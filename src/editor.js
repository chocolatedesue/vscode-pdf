import PdfViewerApi from "./api";
import Logger from "./logger";
import PDFCacheManager from "./cache.js";
import { VIEW_TYPE, WEBVIEW_OPTIONS, MEDIA_FILES, WORKER_FILE_PATTERN, WORKER_FILE_FALLBACK } from "./constants.js";
const vscode = require("vscode");

// Global cache manager (shared across all PDFDoc instances)
const cacheManager = new PDFCacheManager(5); // Max 5 PDFs cached

/**
 * @implements {import("..").PdfFileDataProvider}
 */
class PDFDoc {
  /**
   * @param {vscode.Uri} uri
   */
  constructor(uri) {
    this._uri = uri;
  }

  dispose() {
    // Note: We don't clear cache here as it's managed globally by LRU policy
    // The cache will automatically evict old entries when needed
  }

  get uri() {
    return this._uri;
  }

  /**
   * Reads the file data with caching.
   * @returns {Promise<Uint8Array>}
   */
  async getFileData() {
    // Check global cache first
    const cached = cacheManager.get(this.uri);
    if (cached) {
      return cached;
    }

    try {
      const startTime = Date.now();
      const fileData = await vscode.workspace.fs.readFile(this.uri);
      const dataProvider = PdfViewerApi.PdfFileDataProvider.fromUint8Array(fileData);
      const base64Data = await dataProvider.getFileData();

      // Store in global cache with LRU eviction
      cacheManager.set(this.uri, base64Data, fileData.byteLength);

      const duration = Date.now() - startTime;
      Logger.logPerformance('PDF data loaded and cached', duration, {
        size: fileData.byteLength
      });
      return base64Data;
    } catch (err) {
      throw err;
    }
  }
}

export default class PDFEdit {
  /**
   * Registers the custom editor provider.
   * @param {vscode.ExtensionContext} context
   * @returns {vscode.Disposable}
   */
  static register(context) {
    const provider = new PDFEdit(context);
    return vscode.window.registerCustomEditorProvider(PDFEdit.viewType, provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
      supportsMultipleEditorsPerDocument: false,
    });
  }

  static viewType = VIEW_TYPE;

  /**
   * @param {vscode.ExtensionContext} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Called when the custom editor is opened.
   * @param {vscode.CustomDocument} document
   * @param {vscode.WebviewPanel} panel
   * @param {vscode.CancellationToken} _token
   */
  async resolveCustomEditor(document, panel, _token) {
    Logger.log(`Resolving Custom Editor for: ${document.uri.toString()}`);

    // Check if webview is already set up (to prevent reinitialization on tab switch)
    if (panel.webview.html && panel.webview.html.length > 0) {
      Logger.log('Webview already initialized, skipping setup');
      return;
    }

    await this.setupWebview(document, panel);
  }

  /**
   * Opens the custom document.
   * @param {vscode.Uri} uri
   * @param {vscode.CustomDocumentOpenContext} _context
   * @param {vscode.CancellationToken} _token
   * @returns {Promise<PDFDoc>}
   */
  async openCustomDocument(uri, _context, _token) {
    Logger.log(`Opening Custom Document: ${uri.toString()}`);
    return new PDFDoc(uri);
  }

  /**
   * Sets up the webview content and message handling.
   * @param {PDFDoc} dataProvider
   * @param {vscode.WebviewPanel} panel
   */
  async setupWebview(dataProvider, panel) {
    const startTime = Date.now();
    const extUri = this.context.extensionUri;
    const mediaUri = vscode.Uri.joinPath(extUri, "media");

    const isWeb = vscode.env.uiKind === vscode.UIKind.Web;
    let localResourceRoots = [mediaUri];

    if (!isWeb) {
      try {
        const path = require('path');
        const pdfDir = vscode.Uri.file(path.dirname(dataProvider.uri.fsPath));
        localResourceRoots.push(pdfDir);
      } catch (e) {
        Logger.log(`[Warning] Could not resolve PDF directory for localResourceRoots: ${e}`);
      }
    }

    panel.webview.options = {
      ...WEBVIEW_OPTIONS,
      localResourceRoots: localResourceRoots
    };
    Logger.log(`[Performance] Webview setup started for ${dataProvider.uri.toString()}`);

    try {
      // Load HTML template
      const htmlPath = vscode.Uri.joinPath(mediaUri, MEDIA_FILES.WEBVIEW_HTML);
      const htmlContent = new TextDecoder("utf-8").decode(await vscode.workspace.fs.readFile(htmlPath));

      // Resolve resources
      const editorJsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, MEDIA_FILES.EDITOR_JS));
      const editorCssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, MEDIA_FILES.EDITOR_CSS));
      const wasmUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, MEDIA_FILES.WASM));

      // Dynamic Worker Resolution
      const workerFilename = await this.findWorkerFilename(mediaUri);
      const workerUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, workerFilename));

      // Inject variables into HTML
      panel.webview.html = htmlContent
        .replace(/{{CSP_SOURCE}}/g, panel.webview.cspSource)
        .replace(/{{EDITOR_JS_URI}}/g, editorJsUri.toString())
        .replace(/{{EDITOR_CSS_URI}}/g, editorCssUri.toString())
        .replace(/{{WASM_URI}}/g, wasmUri.toString());

      // Prepare init message
      const msg = {
        command: "preview",
        wasmUri: wasmUri.toString(true),
        workerUri: workerUri.toString(true)
      };

      // Message Handling - Store the disposable for cleanup
      const messageDisposable = panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'ready') {
          await this.handleWebviewReady(dataProvider, panel, msg);
        }
      });

      // Cleanup when panel is disposed
      panel.onDidDispose(() => {
        messageDisposable.dispose();
        Logger.log(`Webview panel disposed for ${dataProvider.uri.toString()}`);
      });

      const duration = Date.now() - startTime;
      Logger.logPerformance('Webview setup completed', duration);

    } catch (e) {
      const duration = Date.now() - startTime;
      Logger.log(`[Performance] Webview setup failed after ${duration}ms: ${e.stack || e}`);

      // Classify error type and provide helpful suggestions
      let errorType = 'Unknown Error';
      let suggestion = 'Please try reopening the file.';
      let canRetry = true;

      if (e.message && e.message.includes('WASM')) {
        errorType = 'WASM Loading Failed';
        suggestion = 'The WebAssembly module failed to load. Try reinstalling the extension.';
        canRetry = false;
      } else if (e.code === 'ENOENT' || (e.message && e.message.includes('ENOENT'))) {
        errorType = 'File Not Found';
        suggestion = 'The PDF file may have been moved or deleted.';
        canRetry = false;
      } else if (e.code === 'EACCES' || (e.message && e.message.includes('EACCES'))) {
        errorType = 'Permission Denied';
        suggestion = 'Check file permissions and try again.';
      } else if (e.message && e.message.includes('fetch')) {
        errorType = 'Network Error';
        suggestion = 'Failed to load required resources. Check your connection.';
      }

      // Display user-friendly error page
      panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: var(--vscode-font-family);
              padding: 40px;
              color: var(--vscode-foreground);
              background: var(--vscode-editor-background);
            }
            .error-container {
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              color: var(--vscode-errorForeground);
              margin-bottom: 20px;
            }
            .error-details {
              background: var(--vscode-textBlockQuote-background);
              border-left: 4px solid var(--vscode-errorForeground);
              padding: 15px;
              margin: 20px 0;
            }
            .suggestion {
              background: var(--vscode-textBlockQuote-background);
              border-left: 4px solid var(--vscode-notificationsInfoIcon-foreground);
              padding: 15px;
              margin: 20px 0;
            }
            button {
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              padding: 10px 20px;
              margin: 10px 10px 10px 0;
              cursor: pointer;
              font-size: 14px;
            }
            button:hover {
              background: var(--vscode-button-hoverBackground);
            }
            .error-code {
              font-family: var(--vscode-editor-font-family);
              font-size: 12px;
              color: var(--vscode-descriptionForeground);
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>❌ ${errorType}</h1>
            <div class="error-details">
              <strong>Error Message:</strong><br>
              ${e.message || 'An unknown error occurred'}
            </div>
            <div class="suggestion">
              <strong>💡 Suggestion:</strong><br>
              ${suggestion}
            </div>
            ${canRetry ? '<button onclick="window.location.reload()">🔄 Retry</button>' : ''}
            <div class="error-code">
              Error occurred ${duration}ms after webview initialization
            </div>
          </div>
        </body>
        </html>
      `;

      // Show VS Code notification with actions
      vscode.window.showErrorMessage(
        `PDF Viewer: ${errorType}`,
        'View Logs',
        'Report Issue'
      ).then(selection => {
        if (selection === 'View Logs') {
          Logger.show();
        } else if (selection === 'Report Issue') {
          vscode.env.openExternal(vscode.Uri.parse(
            'https://github.com/chocolatedesue/vscode-pdf/issues/new'
          ));
        }
      });
    }
  }

  /**
   * Handles the 'ready' message from the webview.
   * @param {PDFDoc} dataProvider 
   * @param {vscode.WebviewPanel} panel 
   * @param {Object} initMsg 
   */
  async handleWebviewReady(dataProvider, panel, initMsg) {
    const isWeb = vscode.env.uiKind === vscode.UIKind.Web;
    Logger.log(`[Webview Ready] Environment: ${isWeb ? "Web" : "Desktop"} (UIKind: ${vscode.env.uiKind})`);

    if (dataProvider.uri && !isWeb) {
      Logger.log("Strategy: URI Mode (Standard)");
      initMsg.pdfUri = panel.webview.asWebviewUri(dataProvider.uri).toString(true);
      panel.webview.postMessage(initMsg);
    } else {
      Logger.log("Strategy: Data Injection Mode (Web/Fallback)");
      try {
        const data = await dataProvider.getFileData();
        initMsg.data = data;
        panel.webview.postMessage(initMsg);
      } catch (err) {
        Logger.log(`Error loading file data: ${err}`);
        panel.webview.postMessage({
          command: 'error',
          error: err.message || String(err)
        });
      }
    }
  }

  /**
   * Finds the worker file in the media directory dynamically.
   * @param {vscode.Uri} mediaUri 
   * @returns {Promise<string>}
   */
  async findWorkerFilename(mediaUri) {
    try {
      const children = await vscode.workspace.fs.readDirectory(mediaUri);
      // Look for worker-engine-*.js or worker-engine.js
      const workerFile = children.find(([name, type]) =>
        WORKER_FILE_PATTERN.test(name)
      );

      if (workerFile) {
        return workerFile[0];
      }

      Logger.log(`Worker file not found, defaulting to '${WORKER_FILE_FALLBACK}'`);
      return WORKER_FILE_FALLBACK;
    } catch (e) {
      Logger.log(`Error listing media folder: ${e} - Defaulting to '${WORKER_FILE_FALLBACK}'`);
      return WORKER_FILE_FALLBACK;
    }
  }
}


import EmbedPDF from './embed-pdf-viewer.min.js';

/* global acquireVsCodeApi */
const vscode = acquireVsCodeApi();
const oldState = vscode.getState();

let viewer;
let currentBlobUrl;
let currentDocumentUri = null; // Track currently loaded document

function showError(err) {
  console.error('[Error]', err);
  const errorDiv = document.getElementById("error");
  const errorMessage = document.getElementById("error-message");
  const loadingDiv = document.getElementById("loading");

  if (loadingDiv) loadingDiv.style.display = "none";
  if (errorDiv) {
    errorDiv.style.display = "block";
    errorMessage.textContent = err.stack || err.message || String(err);
  }
}

function getTheme() {
  if (document.body.classList.contains('vscode-dark')) {
    return 'dark';
  } else if (document.body.classList.contains('vscode-high-contrast')) {
    return 'dark';
  } else {
    return 'light';
  }
}

// Watch for theme changes
const observer = new MutationObserver(() => {
  if (viewer) {
    viewer.setTheme(getTheme());
  }
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// Helper: Initialize or re-initialize viewer
function initViewer(target, config) {
  target.innerHTML = '';
  const newViewer = EmbedPDF.init({
    type: 'container',
    target: target,
    src: config.source,
    wasmUrl: config.wasmUri,
    worker: true,
    theme: getTheme(),

    // Set default zoom to 100% via configuration
    zoom: {
      defaultLevel: 1.0,  // 100% zoom
      minZoom: 0.25,
      maxZoom: 4.0
    }
  });

  return newViewer;
}

// Helper: Try to update document or fallback to re-init
async function updateOrReinitViewer(target, config) {
  try {
    const registry = await viewer.registry;
    const DocPlugin = EmbedPDF.DocumentManagerPlugin;
    if (DocPlugin) {
      const docManager = registry.getPlugin(DocPlugin);
      await docManager.openDocumentUrl({ url: config.source });
    } else {
      viewer = initViewer(target, config);
    }
  } catch (err) {
    console.warn('[Performance] Document update failed, re-initializing viewer', err);
    viewer = initViewer(target, config);
  }
}

if (oldState && oldState.data) {
  previewPdf(null, oldState.data, oldState.wasmUri, oldState.workerUri)
    .then(async () => {
      // Wait for viewer to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));

      // Restore view state if available
      if (oldState.viewState && viewer) {
        try {
          const registry = await viewer.registry;

          // Restore zoom using ZoomPlugin
          if (oldState.viewState.zoom !== undefined) {
            const zoomPlugin = registry.getPlugin(EmbedPDF.ZoomPlugin);
            zoomPlugin.requestZoom(oldState.viewState.zoom);
          }

          // Restore page using ScrollPlugin
          if (oldState.viewState.page !== undefined) {
            const scrollPlugin = registry.getPlugin(EmbedPDF.ScrollPlugin);
            scrollPlugin.jumpToPage(oldState.viewState.page);
          }
        } catch (err) {
          console.warn('[State] Failed to restore view state:', err);
        }
      }
    })
    .catch(showError);
}

window.addEventListener('message', async event => {
  const message = event.data;
  switch (message.command) {
    case 'preview':
      // Check if this is the same document already loaded
      const newDocUri = message.pdfUri || 'base64-data';
      if (currentDocumentUri === newDocUri && viewer) {
        console.log('[Viewer] Same document already loaded, skipping reload');
        return; // Don't reload the same document
      }

      currentDocumentUri = newDocUri;
      await previewPdf(message.pdfUri, message.data, message.wasmUri, message.workerUri);
      vscode.setState({
        pdfUri: message.pdfUri,
        data: message.data,
        wasmUri: message.wasmUri,
        workerUri: message.workerUri,
        viewState: null // Reset view state for new document
      });
      break;
    case 'base64': // Backward compatibility
      await previewPdf(null, message.data, message.wasmUri, message.workerUri);
      vscode.setState({
        data: message.data,
        wasmUri: message.wasmUri,
        workerUri: message.workerUri,
        viewState: null
      });
      break;
    case 'error':
      showError(message.error);
      break;
  }
});

async function previewPdf(pdfUri, base64Data, wasmUri, workerUri) {
  const startTime = performance.now();
  console.log('[Performance] PDF preview started');

  try {
    let source = pdfUri;

    if (!source && base64Data) {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
      const buffer = base64ToArrayBuffer(base64Data);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      source = URL.createObjectURL(blob);
      currentBlobUrl = source;
    }

    if (!source) {
      console.warn("No PDF source provided.");
      document.getElementById("loading")?.remove();
      return;
    }

    const target = document.getElementById('pdf-viewer');
    const config = { source, wasmUri };

    if (!viewer) {
      viewer = initViewer(target, config);
    } else {
      await updateOrReinitViewer(target, config);
    }

    document.getElementById("loading")?.remove();
    const renderTime = (performance.now() - startTime).toFixed(2);
    console.log(`[Performance] PDF rendered in ${renderTime}ms`);
  } catch (e) {
    const failTime = (performance.now() - startTime).toFixed(2);
    console.error(`[Performance] PDF failed after ${failTime}ms`);
    showError(e);
  }
}

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Signal to the extension that the webview is ready to receive messages
vscode.postMessage({ command: 'ready' });

// State saving loop management
let stateSaveInterval;

function startStateSaving() {
  if (stateSaveInterval) return;

  stateSaveInterval = setInterval(async () => {
    if (document.hidden) return; // Double check

    if (viewer) {
      try {
        const currentState = vscode.getState();
        if (currentState) {
          const registry = await viewer.registry;

          const zoomPlugin = registry.getPlugin(EmbedPDF.ZoomPlugin);
          const zoomState = zoomPlugin.getState();

          const scrollPlugin = registry.getPlugin(EmbedPDF.ScrollPlugin);
          const currentPage = scrollPlugin.getCurrentPage();

          const viewState = {
            zoom: zoomState.level,
            page: currentPage
          };

          if (JSON.stringify(currentState.viewState) !== JSON.stringify(viewState)) {
            vscode.setState({
              ...currentState,
              viewState
            });
          }
        }
      } catch (err) {
        // Silently fail
      }
    }
  }, 1000);
}

function stopStateSaving() {
  if (stateSaveInterval) {
    clearInterval(stateSaveInterval);
    stateSaveInterval = null;
  }
}

// Handle visibility changes to optimize CPU usage
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopStateSaving();
  } else {
    startStateSaving();
  }
});

// Start initially
startStateSaving();

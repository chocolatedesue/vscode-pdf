import Logger from "../services/logger";
import PDFCacheManager from "../services/cache.js";
const vscode = require("vscode");

// Global cache manager (shared across all PDFDoc instances)
export const cacheManager = new PDFCacheManager(5); // Max 5 PDFs cached

/**
 * @implements {import("../api/index").PdfFileDataProvider}
 */
export class PDFDoc {
  /**
   * @param {vscode.Uri} uri
   */
  constructor(uri) {
    this._uri = uri;
    this._inFlightRead = null;
  }

  dispose() {
    this._inFlightRead = null;
    // Note: We don't clear cache here as it's managed globally by LRU policy
    // The cache will automatically evict old entries when needed
  }

  get uri() {
    return this._uri;
  }

  /**
   * Reads the file data with caching and concurrency protection.
   * @returns {Promise<Uint8Array>}
   */
  async getFileData() {
    // Check global cache first
    const cached = cacheManager.get(this.uri);
    if (cached) {
      return cached;
    }

    // If already reading, return the existing promise
    if (this._inFlightRead) {
      return this._inFlightRead;
    }

    this._inFlightRead = (async () => {
      try {
        // Check file size limit for Web environment (100MB)
        if (vscode.env.uiKind === vscode.UIKind.Web) {
          try {
            const stat = await vscode.workspace.fs.stat(this.uri);
            const MAX_SIZE_MB = 100;
            if (stat.size > MAX_SIZE_MB * 1024 * 1024) {
              throw new Error(`File is too large (${(stat.size / 1024 / 1024).toFixed(1)}MB) for the Web version (Max ${MAX_SIZE_MB}MB). Please use VS Code Desktop.`);
            }
          } catch (e) {
            // Ignore stat errors, fallback to try reading
            if (e.message && e.message.includes('File is too large')) {
              throw e;
            }
          }
        }

        const startTime = Date.now();
        const fileData = await vscode.workspace.fs.readFile(this.uri);

        // Store in global cache as Uint8Array
        cacheManager.set(this.uri, fileData, fileData.byteLength);

        const duration = Date.now() - startTime;
        Logger.logPerformance('PDF data loaded and cached', duration, {
          size: fileData.byteLength
        });
        return fileData;
      } finally {
        this._inFlightRead = null;
      }
    })();

    return this._inFlightRead;
  }
}

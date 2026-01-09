import Logger from "../services/logger";
const vscode = require("vscode");

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
  }

  get uri() {
    return this._uri;
  }

  /**
   * Reads the file data with concurrency protection.
   * @returns {Promise<Uint8Array>}
   */
  async getFileData() {
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

        const duration = Date.now() - startTime;
        Logger.logPerformance('PDF data loaded', duration, {
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

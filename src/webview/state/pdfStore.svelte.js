import { base64ToArrayBuffer } from "../utils/binary.js";
import { vscodeService } from "../services/vscode.js";

function getInitialTheme() {
  if (typeof document !== "undefined") {
    if (
      document.body.classList.contains("vscode-dark") ||
      document.body.classList.contains("vscode-high-contrast")
    ) {
      return "dark";
    }
  }
  return "light";
}

export const pdfState = $state({
  pdfSrc: null,
  wasmUrl: "",
  loading: true,
  error: null,
  themePreference: getInitialTheme(),
  messageConfig: null,
  activeBlobUrl: null,
  currentDocumentUri: null,
  registry: null,
  container: null,

  updateTheme() {
    const newTheme = getInitialTheme();
    if (this.themePreference !== newTheme) {
      this.themePreference = newTheme;
    }
  },

  setPreview(message) {
    const newDocUri = message.pdfUri || "base64-data";
    if (this.currentDocumentUri === newDocUri && this.pdfSrc) {
      return;
    }

    this.currentDocumentUri = newDocUri;
    this.wasmUrl = message.wasmUri;
    this.messageConfig = message.config;

    let src = message.pdfUri;
    if (!src && message.data) {
      let buffer;
      if (message.data instanceof Uint8Array) {
        buffer = message.data;
      } else if (message.data instanceof ArrayBuffer) {
        buffer = new Uint8Array(message.data);
      } else {
        buffer = new Uint8Array(base64ToArrayBuffer(message.data));
      }

      if (this.activeBlobUrl) {
        URL.revokeObjectURL(this.activeBlobUrl);
      }
      const blob = new Blob([buffer.buffer], { type: "application/pdf" });
      src = URL.createObjectURL(blob);
      this.activeBlobUrl = src;
    }

    if (src) {
      this.pdfSrc = src;
      this.loading = false;
    } else {
      this.error = "Failed to resolve PDF source";
      this.loading = false;
    }

    vscodeService.setState({
      pdfUri: message.pdfUri,
      data: message.data,
      wasmUri: message.wasmUri,
      workerUri: message.workerUri,
      viewState: vscodeService.getState()?.viewState || null,
      config: message.config,
    });
  },

  async handleSave(message) {
    if (this.registry) {
      try {
        const exportPlugin = this.registry.getPlugin("export")?.provides();
        if (exportPlugin) {
          const arrayBuffer = await exportPlugin.saveAsCopy().toPromise();
          vscodeService.postMessage({
            command: "save-response",
            data: new Uint8Array(arrayBuffer),
            requestId: message.requestId,
          });
        }
      } catch (e) {
        vscodeService.postMessage({
          command: "error",
          error: e.message,
          requestId: message.requestId,
        });
      }
    }
  }
});

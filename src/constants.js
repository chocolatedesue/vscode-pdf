const vscode = require("vscode");

// Extension configuration constants
export const VIEW_TYPE = "modernPdfViewer.PDFEdit";
export const OUTPUT_CHANNEL_NAME = "Modern PDF Preview";

// File name patterns
export const WORKER_FILE_PATTERN = /^worker-engine.*\.js$/;
export const WORKER_FILE_FALLBACK = "worker-engine.js";

// Media files
export const MEDIA_FILES = {
    WASM: "pdfium.wasm",
    EDITOR_JS: "editor.js",
    EDITOR_CSS: "editor.css",
    WEBVIEW_HTML: "webview.html"
};

// Base64 conversion configuration
export const BASE64_CHUNK_SIZE = 0x8000; // 32KB chunks

// Webview configuration
export const WEBVIEW_OPTIONS = {
    enableScripts: true,
    retainContextWhenHidden: true,
};

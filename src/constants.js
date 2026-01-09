const vscode = require("vscode");

// Extension configuration constants
export const VIEW_TYPE = "modernPdfViewer.PDFEdit";
export const OUTPUT_CHANNEL_NAME = "Modern PDF Preview";

// Media files
export const MEDIA_FILES = {
    WASM: "pdfium.wasm",
    EDITOR_JS: "editor.js",
    WEBVIEW_HTML: "webview.html",
    WEBVIEW_BUNDLE: "webview-bundle.js"
};

// Base64 conversion configuration
export const BASE64_CHUNK_SIZE = 0x8000; // 32KB chunks

// Webview configuration
export const WEBVIEW_OPTIONS = {
    enableScripts: true,
    retainContextWhenHidden: true,
};

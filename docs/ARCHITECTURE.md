# Technical Architecture

This document describes the technical design of the **Modern PDF Preview** extension.

## Overview

The extension uses a multi-layered modular architecture to ensure separation of concerns, high performance, and platform-agnostic support (Desktop & Web).

### 1. Rendering Engine
We use `pdfium.wasm` (via `@embedpdf/svelte-pdf-viewer`), a compiled WebAssembly version of the industry-standard **PDFium** library.
- **Consistency**: Matches Google Chrome's native PDF rendering.
- **WASM Performance**: High-speed rendering with predictable performance.

### 2. Extension Host (Backend) Structure
The backend is split into semantic layers:
- **`providers/`**: Implements VS Code `CustomEditorProvider`. Handles the bridge between VS Code and the Webview.
- **`models/`**: `PDFDoc` class handles raw file data loading and concurrency protection.
- **`managers/`**:
    - `ConfigManager`: Manages VS Code settings.
    - `EditorManager`: Tracks active editor instances and their state.
- **`services/`**: Cross-cutting services like `Logger`.
- **`api/`**: Public API for other extensions to trigger PDF previews.

### 3. Webview (Frontend) Structure
Built with **Svelte 5** and **Runes** for modern, high-performance state management:
- **`state/`**: Centralized reactive state (`pdfStore.svelte.js`). Logic is separated from UI components.
- **`components/`**: Modular Svelte components (`PdfViewer`, `Loading`, `ErrorMessage`).
- **`services/`**: Standardized communication with the Extension Host via `vscodeService.js`.
- **`hooks/`**: Svelte hooks for theme detection and other cross-cutting UI logic.

### 4. Hybrid Loading Strategy
To support both Desktop and Web environments:
- **Desktop (Local)**: Uses standard `vscode-resource:` URIs for efficient native file access.
- **Web (Remote/Virtual)**: Uses a "Data Injection" fallback where file content is read into memory and transferred as a Blob URL.

### 5. Memory & Resource Model
- **Context Retention**: We use `retainContextWhenHidden: true` to prevent UI state loss when switching tabs.
- **Persistence**: Each PDF view is a separate container. Since there is no automatic LRU (Least Recently Used) management at the extension level, memory scales with the number of open PDF tabs.
- **Cleanup**: Resources are explicitly released when a tab is closed (Disposable pattern).

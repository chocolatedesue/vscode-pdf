# Development Guide

This document explains how to develop, test, and release the **Modern PDF Preview** extension.

## 1. Setup

### Prerequisites
- **Node.js**: v16 or higher
- **npm**: for dependency management
- **VS Code**: for manual testing and development

### Installation
```bash
npm install
```

## 2. Extension Architecture

The extension is built for two targets:
- **Desktop (Node.js)**: Uses `dist/extension.node.js`.
- **Web (Web Worker)**: Uses `dist/extension.browser.js` for support on vscode.dev and GitHub Codespaces.

The `package.json` specifies these via `main` and `browser` fields respectively.

## 3. Build & Development

The extension uses `webpack` to bundle dependencies and assets.

```bash
# Production build
npm run build

# Watch mode (automatically rebuild on changes)
npx webpack --watch
```

## 4. Testing

### VS Code for the Web
To run the extension in an interactive VS Code instance in your browser:

1.  **Start the web server**:
    ```bash
    npm run test-web
    ```
2.  **Open the URL**:
    By default, it will open `http://localhost:3000`.

### Headless Web Testing
To run tests in a headless browser (useful for CI/CD):

```bash
npm run test-web-headless
```

### Manual Desktop Testing
1.  Open the project in VS Code.
2.  Press `F5` to launch an **Extension Development Host**.
3.  Open any `.pdf` file to verify functionality.

## 5. Component Updates

This project vendors third-party components (JS/WASM) in the `media/` directory.

### Updating `embed-pdf-viewer` & `pdfium`
The update process is automated:

1.  **Install Latest Package**:
    ```bash
    npm install @embedpdf/snippet@latest
    ```
2.  **Run Update Script**:
    ```bash
    npm run update-media
    ```

## 6. Release & Publishing

### Versioning
1.  Update the version in `package.json`.
2.  Add a entry to `CHANGELOG.md`.

### Publishing
The project includes a helper script `scripts/publish.sh` that publishes to both VS Code Marketplace and Open VSX Registry.

**Prerequisites**:
- A `.env` file with `VSCE_PAT` (and optionally `OVSX_TOKEN`).

**Command**:
```bash
npm run deploy
```

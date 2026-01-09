# Design: Replacing pdf.js with embed-pdf-viewer

## Architecture Overview
The current architecture involves a VS Code Custom Editor that communicates with a Webview. The Webview loads `pdf.js` and manually renders PDF pages into a series of `<canvas>` elements.

The new architecture will utilize `embed-pdf-viewer`, which wraps the rendering engine (likely still `pdf.js` or `MuPDF WASM` under the hood, but abstracted) and provides a plugin-based architecture for features.

## Key Components

### VS Code Extension Side (`src/editor.js`)
- The `PDFEdit` class remains the entry point.
- The `resolveCustomEditor` method will still set up the Webview.
- The HTML template will be updated to load `media/embed-pdf-viewer.min.js`.
- The `postMessage` call will still send the PDF data as base64, but we might consider sending it as an `ArrayBuffer` for better performance if supported by the new library.

### Webview Side (`media/editor.js`)
- Instead of manually iterating through pages, we will use `EmbedPDF.init`.
- We will mount the viewer into a container (e.g., `#pdf-viewer`).
- We will transition from handling `base64` strings to `ArrayBuffer` if possible, as it's the preferred input for `openDocumentBuffer`.

## Data Flow
1. VS Code reads the PDF file from the workspace.
2. File data is sent to the Webview.
3. Webview initializes `EmbedPDF`.
4. `EmbedPDF` renders the document in the specified container.

## Implementation Details

### Initialization
```javascript
const viewer = EmbedPDF.init({
  type: 'container',
  target: document.getElementById('pdf-viewer'),
  worker: true
});
```

### Loading Document
```javascript
const registry = await viewer.registry;
const docManager = registry.getPlugin(DocumentManagerPlugin);
await docManager.openDocumentBuffer({
  buffer: arrayBuffer,
  name: 'document.pdf',
  autoActivate: true
});
```

## Alternatives Considered
- Staying with `pdf.js`: Rejected due to high maintenance cost for features like spread view and annotations.
- Using `MuPDF WASM` directly: Rejected because `embed-pdf-viewer` provides a better abstraction and UI layer.

## Risks and Mitigations
- Library Size: `embed-pdf-viewer` might be larger than `pdf.js`. Mitigation: Ensure we only include necessary parts if it's modular, or accept the trade-off for better features.
- Performance: Rendering might differ. Mitigation: Performance testing during the implementation phase.

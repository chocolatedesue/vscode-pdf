# Capability: PDF Viewer

This capability represents the core PDF rendering and viewing functionality within the VS Code extension.

## ADDED Requirements

### Requirement: Document Rendering
The viewer MUST render PDF documents provided by the VS Code editor provider.
#### Scenario: Open a PDF file
- Given a valid PDF file is opened in VS Code.
- When the Custom Editor is resolved.
- Then the PDF content MUST be displayed in the webview.

### Requirement: Navigation
The viewer MUST allow users to navigate through the pages of the PDF document.
#### Scenario: Scrolling
- Given a multi-page PDF is loaded.
- When the user scrolls.
- Then the pages MUST be displayed sequentially.

### Requirement: Zooming
The viewer MUST allow users to change the zoom level of the PDF content.
#### Scenario: Zoom In/Out
- Given a PDF is loaded.
- When the user uses the zoom controls.
- Then the displayed size of the PDF content MUST change accordingly.

### Requirement: Usage of embed-pdf-viewer
The rendering engine MUST be based on the `embed-pdf-viewer` library.
#### Scenario: Library Initialization
- Given the webview is loaded.
- When the script is executed.
- Then `EmbedPDF.init` MUST be called successfully.

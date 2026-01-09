# Proposal: Replace pdf.js with embed-pdf-viewer

## Problem
The current PDF rendering implementation uses `pdf.js` directly, which requires manual handling of page rendering, canvas management, and scrolling. This is complex to maintain and lacks many advanced features like a cohesive UI, easy annotation support, and robust document management.

## Solution
Replace the low-level `pdf.js` implementation with `embed-pdf-viewer`, a higher-level library that provides a full-featured PDF viewing experience.

## Benefits
- Improved rendering performance and reliability.
- Built-in support for multiple viewing modes (single, spread).
- Better UI/UX with ready-to-use controls.
- Simplified codebase by offloading rendering logic to a specialized library.

## Proposed Changes
- [NEW] `media/embed-pdf-viewer.min.js`: The new PDF viewer library.
- [DELETE] `media/pdf.min.js`: The old pdf.js library.
- [DELETE] `media/pdf.worker.min.js`: The old pdf.js worker.
- [MODIFY] `src/editor.js`: Update the webview HTML to include the new library and remove the old ones.
- [MODIFY] `media/editor.js`: Replace `pdf.js` rendering logic with `EmbedPDF.init` and its associated API.
- [MODIFY] `media/editor.css`: Update styles to accommodate the new viewer container.

## Dependencies
- `embed-pdf-viewer` v2.1.1 (as referenced in `docs/emb.md`).

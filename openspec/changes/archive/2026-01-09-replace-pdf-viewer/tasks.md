# Tasks: Replace pdf.js with embed-pdf-viewer

- [ ] Task 1: Prepare environment and dependencies
    - [ ] Obtain `embed-pdf-viewer.min.js` and place it in the `media/` directory.
    - [ ] Update `.gitignore` if necessary to include/exclude new media files.

- [ ] Task 2: Modify VS Code Editor Provider
    - [ ] Update `src/editor.js` to change the webview HTML template.
    - [ ] Replace `pdf.min.js` script tag with `embed-pdf-viewer.min.js`.
    - [ ] Update the message sent to the webview to include any necessary configuration for the new viewer.

- [ ] Task 3: Update Webview Implementation
    - [ ] Refactor `media/editor.js` to remove `pdf.js` specific code.
    - [ ] Implement `EmbedPDF.init` call.
    - [ ] Handle document loading using the received base64/buffer data.
    - [ ] Ensure basic features like scrolling and zooming work as expected.

- [ ] Task 4: UI and CSS Adjustments
    - [ ] Update `media/editor.css` to styles the new viewer container.
    - [ ] Ensure the viewer fits the webview dimensions.

- [ ] Task 5: Cleanup
    - [ ] Remove old `media/pdf.min.js` and `media/pdf.worker.min.js`.
    - [ ] Verify that no other parts of the codebase depend on the old files.

- [ ] Task 6: Verification
    - [ ] Test the extension with various PDF files.
    - [ ] Verify that scrolling, zooming, and page navigation work correctly.
    - [ ] Check for any console errors in the webview developer tools.

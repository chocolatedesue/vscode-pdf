# VS Code Web Development & Testing

This extension supports VS Code for the Web (vscode.dev, GitHub Codespaces). This document explains how to develop and test the extension in a web environment.

## Extension Architecture

The extension is built for two targets:
- **Node.js**: Standard VS Code Desktop. Entry point: `dist/extension.node.js`.
- **Web Worker**: VS Code Web. Entry point: `dist/extension.browser.js`.

The `package.json` specifies these via `main` and `browser` fields respectively.

## Development in the Browser

To run the extension in an interactive VS Code instance in your browser:

1.  **Build the project**:
    ```bash
    npm run build
    ```
2.  **Start the web test server**:
    ```bash
    npm run test-web
    ```
3.  **Open the URL**:
    By default, it will open `http://localhost:3000`. This is a fully functional VS Code instance running in your browser with the extension loaded.

## Headless Testing

To run tests in a headless browser (useful for CI/CD):

```bash
npm run test-web-headless
```

This uses `@vscode/test-web` to launch a headless Playwright instance, load VS Code Web, and run any tests defined in your test suite.

## Debugging Tips

- **Webview CSP**: If the PDF fails to load, check the browser's Developer Tools (F12) for Content Security Policy (CSP) errors.
- **WASM Loading**: In the web, WASM is loaded via `fetch`. Ensure the `wasmUrl` passed to the viewer is a valid `asWebviewUri`.
- **Logs**: Extension logs are available in the "Output" panel under "Modern PDF Preview". In the web, these also show up in the browser console.

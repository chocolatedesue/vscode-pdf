# VS Code PDF Viewer

<!-- markdownlint-disable MD033 -->

<div align="center">

[![Visual Studio Marketplace Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/AdamRaichu.pdf-viewer?color=darkblue&logo=visual%20studio%20code&logoColor=007acc)][vsc-marketplace]
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/adamraichu.pdf-viewer?color=darkblue&logo=visual%20studio%20code&logoColor=007acc)][vsc-marketplace]
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/adamraichu.pdf-viewer?color=darkblue&label=Install%20Count&logo=visual%20studio%20code&logoColor=007acc)][vsc-marketplace]
[![Visual Studio Marketplace Rating (Stars)](https://img.shields.io/visual-studio-marketplace/stars/adamraichu.pdf-viewer?color=darkblue&label=Rating&logo=visual%20studio%20code&logoColor=007acc)](https://marketplace.visualstudio.com/items?itemName=AdamRaichu.pdf-viewer&ssr=false#review-details)

[![GitHub issues](https://img.shields.io/github/issues/AdamRaichu/vscode-pdf-viewer)](https://github.com/AdamRaichu/vscode-pdf-viewer/issues)
[![GitHub stars](https://img.shields.io/github/stars/AdamRaichu/vscode-pdf-viewer)](https://github.com/AdamRaichu/vscode-pdf-viewer/stargazers)
[![GitHub license](https://img.shields.io/github/license/AdamRaichu/vscode-pdf-viewer)](https://github.com/AdamRaichu/vscode-pdf-viewer/blob/main/LICENSE)

</div>

This extension provides a high-performance, feature-rich PDF viewing experience directly inside VS Code, powered by the [`embed-pdf-viewer`](https://github.com/EmbedPDF/embed-pdf-viewer) library and WebAssembly.

## Key Features

- **🚀 High Performance**: Faster rendering powered by WebAssembly (WASM).
- **🎨 Theme Synchronization**: Automatically matches your VS Code theme (Light, Dark, High Contrast).
- **🛠 Rich Tooling**: Built-in support for search, sidebar thumbnails, zoom, and navigation.
- **🔒 Secure & Private**: Runs entirely locally via VS Code Webview with strict Content Security Policy (CSP). Offline capable.
- **📱 Responsive UI**: Modern, clean interface that adapts to your workspace.

## Usage

### Installation

Install from the VS Code Extensions panel by searching for `adamraichu.pdf-viewer`.

### Viewing

Simply open any `.pdf` file in VS Code. The extension will automatically activate the modern viewer. You can switch back to the default editor or other viewers via the "Open With..." menu.

## API

As of version `1.1.1`, the extension exports an API that other extension authors can use to generate previews of PDFs. See `docs/API.md` on GitHub for more information.

[vsc-marketplace]: https://marketplace.visualstudio.com/items?itemName=AdamRaichu.pdf-viewer

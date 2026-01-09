# Project Context

## Purpose
A VS Code extension for viewing and interacting with PDF files directly within the editor.

## Tech Stack
- TypeScript / JavaScript
- VS Code Extension API (Custom Editor)
- embed-pdf-viewer (PDF rendering engine)

## Project Conventions

### Code Style
- Follow standard JavaScript/TypeScript conventions.
- Use `prettier` for formatting.

### Architecture Patterns
- VS Code Custom Editor Provider in the extension host.
- Webview-based frontend for PDF rendering.
- Plugin-based architecture for viewer features (via embed-pdf-viewer).

### Testing Strategy
- Manual verification with sample PDFs in `test/` directory.

### Git Workflow
- Use OpenSpec for feature proposals and implementation tracking.

## Domain Context
- VS Code Webviews are isolated environments.
- Communication between extension and webview via `postMessage`.

## Important Constraints
- Performance is critical for large PDF files.
- Memory management in webviews must be handled carefully.

## External Dependencies
- embed-pdf-viewer

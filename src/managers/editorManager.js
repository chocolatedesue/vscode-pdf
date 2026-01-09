/**
 * Collection of active editors and their state
 * @type {Map<string, { panel: import("vscode").WebviewPanel, resolveSave: Function, messageDisposable: import("vscode").Disposable }>}
 */
export const activeEditors = new Map();

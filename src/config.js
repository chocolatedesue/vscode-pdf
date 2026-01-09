const vscode = require('vscode');

/**
 * Fetches and maps configurations for the PDF webview.
 * @returns {Object}
 */
export function getPdfConfiguration() {
    const config = vscode.workspace.getConfiguration('modernPdfViewer');

    // Map VS Code enum values to @embedpdf/svelte-pdf-viewer values
    const zoomMap = {
        'page-width': 'page-width',
        'page-fit': 'page-fit',
        'page-height': 'page-height',
        'auto': 'auto'
    };

    const spreadMap = {
        'none': 'none',
        'odd': 'odd',
        'even': 'even'
    };

    const zoomLevel = config.get('defaultZoomLevel', 'page-width');
    const spreadMode = config.get('defaultSpreadMode', 'none');

    return {
        zoomLevel: zoomMap[zoomLevel] || zoomLevel,
        spreadMode: spreadMap[spreadMode] || spreadMode
    };
}

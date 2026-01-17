<script lang="ts">
  import {
    PDFViewer,
    ZoomMode,
    SpreadMode,
    type EmbedPdfContainer,
    type PluginRegistry,
    type ScrollCapability,
  } from "@embedpdf/svelte-pdf-viewer";
  import { pdfState } from "../state/pdfStore.svelte.js";
  import { vscodeService } from "../services/vscode.js";

  const handleInit = (c: EmbedPdfContainer) => {
    console.log("[Webview] PDF Viewer Initialized");
    pdfState.container = c;
  };

  const handleReady = (r: PluginRegistry) => {
    console.log("[Webview] PDF Viewer Ready with Registry");
    pdfState.registry = r;

    (window as any).markDirty = () => {
      console.log("[Webview] Sending dirty signal");
      vscodeService.postMessage({ command: "dirty" });
    };

    // Restore viewing position if available
    const oldState = vscodeService.getState();
    if (oldState?.viewState?.pageNumber) {
      console.log("[Webview] Restoring view to page", oldState.viewState.pageNumber);
      const scrollPlugin = r.getPlugin<any>("scroll");
      if (scrollPlugin) {
        const scrollCapability: ScrollCapability = scrollPlugin.provides();
        setTimeout(() => {
          scrollCapability.scrollToPage({
            pageNumber: oldState.viewState.pageNumber,
            behavior: "instant"
          });
        }, 100);
      }
    }

    // Set up state saving on page changes (with debounce to avoid excessive saves)
    const scrollPlugin = r.getPlugin<any>("scroll");
    if (scrollPlugin) {
      const scrollCapability: ScrollCapability = scrollPlugin.provides();
      let saveTimeout: number | undefined;

      scrollCapability.onPageChange((event) => {
        // Debounce state saves to avoid performance issues during rapid page changes
        clearTimeout(saveTimeout);
        saveTimeout = window.setTimeout(() => {
          const currentState = vscodeService.getState() || {};
          vscodeService.setState({
            ...currentState,
            viewState: {
              pageNumber: event.pageNumber,
              totalPages: event.totalPages
            }
          });
        }, 300); // 300ms debounce
      });
    }
  };

  $effect(() => {
    if (pdfState.container) {
      console.log("[Webview] Syncing theme preference:", pdfState.themePreference);
      pdfState.container.setTheme({ preference: pdfState.themePreference });
    }
  });
</script>

<div id="pdf-container" class="viewer-wrapper">
  <PDFViewer
    oninit={handleInit}
    onready={handleReady}
    config={{
      src: pdfState.pdfSrc,
      wasmUrl: pdfState.wasmUrl,
      theme: { preference: pdfState.themePreference },
      tabBar: pdfState.messageConfig?.tabBar,
      disabledCategories: ["print", "export", "redaction", "document"],
      spread: {
        defaultSpreadMode: pdfState.messageConfig?.spreadMode || SpreadMode.Odd,
      },
      zoom: {
        defaultZoomLevel: pdfState.messageConfig?.zoomLevel || ZoomMode.FitWidth,
      },
    }}
    style="width: 100%; height: 100%;"
  />
</div>

<style>
  .viewer-wrapper {
    width: 100%;
    height: 100%;
  }
</style>

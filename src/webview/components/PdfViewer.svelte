<script lang="ts">
  import {
    PDFViewer,
    ZoomMode,
    SpreadMode,
    type EmbedPdfContainer,
    type PluginRegistry,
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

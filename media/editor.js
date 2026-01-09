import EmbedPDF from './embed-pdf-viewer.min.js';

const vscode = acquireVsCodeApi();
const oldState = vscode.getState();

let viewer;
let currentBlobUrl;

function showError(err) {
  console.error(err);
  const errorDiv = document.getElementById("error");
  const errorMessage = document.getElementById("error-message");
  const loadingDiv = document.getElementById("loading");

  if (loadingDiv) loadingDiv.style.display = "none";
  if (errorDiv) {
    errorDiv.style.display = "block";
    errorMessage.textContent = err.stack || err.message || String(err);
  }
}

function getTheme() {
  if (document.body.classList.contains('vscode-dark')) {
    return 'dark';
  } else if (document.body.classList.contains('vscode-high-contrast')) {
    return 'dark';
  } else {
    return 'light';
  }
}

// Watch for theme changes
const observer = new MutationObserver(() => {
  if (viewer) {
    viewer.config = {
      ...viewer.config,
      theme: getTheme()
    };
  }
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

if (oldState && oldState.data) {
  previewPdf(oldState.data, oldState.wasmUri, oldState.workerUri).catch(showError);
}

window.addEventListener("message", (event) => {
  if (event.data.command === "base64") {
    previewPdf(event.data.data, event.data.wasmUri, event.data.workerUri).catch(showError);
    vscode.setState({
      data: event.data.data,
      wasmUri: event.data.wasmUri,
      workerUri: event.data.workerUri
    });
  }
});

async function previewPdf(base64Data, wasmUri, workerUri) {
  try {
    const buffer = base64ToArrayBuffer(base64Data);
    const blob = new Blob([buffer], { type: 'application/pdf' });

    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }
    currentBlobUrl = URL.createObjectURL(blob);

    if (!viewer) {
      viewer = EmbedPDF.init({
        type: 'container',
        target: document.getElementById('pdf-viewer'),
        src: currentBlobUrl,
        wasmUrl: wasmUri,
        worker: true,
        theme: getTheme(),
      });
    } else {
      // Update the existing viewer with the new source
      viewer.config = {
        ...viewer.config,
        src: currentBlobUrl,
        wasmUrl: wasmUri,
        theme: getTheme(),
      };
    }

    document.getElementById("loading")?.remove();
  } catch (e) {
    showError(e);
  }
}

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

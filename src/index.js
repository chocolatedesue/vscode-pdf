import PDFEdit from "./editor.js";
import PdfViewerApi from "./api.js";

exports.activate = function (context) {
  // Register the custom editor provider and add to subscriptions
  const providerDisposable = PDFEdit.register(context);
  context.subscriptions.push(providerDisposable);

  return {
    getV1Api: function () {
      return PdfViewerApi;
    },
  };
};

// Cleanup function called when extension is deactivated
exports.deactivate = function () {
  // VS Code will automatically dispose all items in context.subscriptions
  // Additional cleanup can be added here if needed
};

import PDFEdit from "./editor";
import Logger from "./logger";
const vscode = require("vscode");

class DataTypeEnum {
  static BASE64STRING = "base64";
  static UINT8ARRAY = "u8array";
}

class PdfFileDataProvider {
  static DataTypeEnum = DataTypeEnum;

  type;
  data;
  name;

  /**
   *
   * @param {DataTypeEnum} type What type the data is.
   * @param {string|Uint8Array} data The file data.
   */
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.name = "PDF Preview (via API)";
  }

  static fromBase64String(base64Data) {
    return new PdfFileDataProvider(DataTypeEnum.BASE64STRING, base64Data);
  }

  static fromUint8Array(u8array) {
    return new PdfFileDataProvider(DataTypeEnum.UINT8ARRAY, u8array);
  }

  withName(newName) {
    this.name = newName;
    return this;
  }


  getFileData() {
    var _data = this.data;
    var _type = this.type;
    return new Promise(function (resolve, reject) {
      if (typeof _data === "undefined") {
        reject(new TypeError("Cannot get file data because data is undefined."));
      }
      switch (_type) {
        case DataTypeEnum.BASE64STRING:
          resolve(_data);
          break;
        case DataTypeEnum.UINT8ARRAY:
          try {
            // Optimized Base64 conversion with chunked processing
            let base64;
            if (typeof globalThis !== 'undefined' && typeof globalThis.btoa === 'function') {
              // Chunked processing to avoid large string concatenation
              const CHUNK_SIZE = 0x8000; // 32KB chunks
              let binary = '';
              for (let i = 0; i < _data.byteLength; i += CHUNK_SIZE) {
                const chunk = _data.subarray(i, Math.min(i + CHUNK_SIZE, _data.byteLength));
                binary += String.fromCharCode.apply(null, chunk);
              }
              base64 = globalThis.btoa(binary);
            } else if (typeof Window !== 'undefined' && typeof Window.prototype.btoa === 'function') {
              // Fallback for some older browser envs if globalThis is missing
              const CHUNK_SIZE = 0x8000;
              let binary = '';
              for (let i = 0; i < _data.byteLength; i += CHUNK_SIZE) {
                const chunk = _data.subarray(i, Math.min(i + CHUNK_SIZE, _data.byteLength));
                binary += String.fromCharCode.apply(null, chunk);
              }
              base64 = window.btoa(binary);
            } else if (typeof Buffer !== 'undefined') {
              base64 = Buffer.from(_data).toString('base64');
            } else {
              throw new Error("Environment does not support Base64 conversion (no btoa or Buffer)");
            }
            resolve(base64);
          } catch (err) {
            reject(err);
          }
          break;

        default:
          reject(new TypeError("Unknown data type " + _type));
          break;
      }
    });
  }

}


export default class PdfViewerApi {
  static PdfFileDataProvider = PdfFileDataProvider;

  /**
   * Create a data provider and webview panel for a given pdf file and display it.
   * @param {PdfFileDataProvider} provider A holder for the file data.
   */
  static previewPdfFile(provider) {
    Logger.log(`API: Creating preview for: ${provider.name}`);
    const panel = vscode.window.createWebviewPanel("modernPdfViewer.apiCreatedPreview", provider.name);
    PDFEdit.previewPdfFile(provider, panel);
  }
}

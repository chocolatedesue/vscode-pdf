const path = require("path");
const webpack = require("webpack");

const extensionNodeConfig = {
  entry: {
    extension: "./src/index.js",
  },
  output: {
    filename: "[name].node.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode",
  },
  mode: "production",
  target: "node",
  optimization: {
    minimize: true,
  },
};

const extensionWebConfig = {
  entry: {
    extension: "./src/index.js",
  },
  output: {
    filename: "[name].browser.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    fallback: {
      path: false,
      fs: false,
    },
  },
  mode: "production",
  target: "webworker",
  optimization: {
    minimize: true,
  },
};

const webviewConfig = {
  entry: {
    webview: "./src/webview/index.js",
  },
  output: {
    filename: "webview-bundle.js",
    path: path.resolve(__dirname, "media"),
    publicPath: "auto",
  },
  resolve: {
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
    conditionNames: ["svelte", "browser", "import"],
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            compilerOptions: {
              dev: false,
            },
            emitCss: false,
            hotReload: false,
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
        generator: {
          filename: 'pdfium.wasm'
        }
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  mode: "production",
  target: "web",
  optimization: {
    minimize: true,
    splitChunks: false,
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};

module.exports = [extensionNodeConfig, extensionWebConfig, webviewConfig];

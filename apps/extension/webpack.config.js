const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");

const { NODE_ENV, TARGET } = process.env;
const MANIFEST_VERSION = TARGET === "firefox" ? "v2" : "v3";
const MANIFEST_BASE_PATH = `./src/manifest/_base.json`;
const MANIFEST_BASE_VERSION_PATH = `./src/manifest/${MANIFEST_VERSION}/_base.json`;
const MANIFEST_PATH = `./src/manifest/${MANIFEST_VERSION}/${TARGET}.json`;

module.exports = {
  mode: NODE_ENV,
  target: "web",
  devtool: false,
  entry: {
    content: "./src/content",
    background: "./src/background",
    popup: "./src/popup",
    injected: "./src/content/injected.ts",
  },
  output: {
    publicPath: "",
    path: resolve(__dirname, `./build/${TARGET}`),
    filename: "[name].anoma.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  performance: {
    hints: "warning",
    maxAssetSize: 200000,
    maxEntrypointSize: 400000,
    assetFilter: function (assetFilename) {
      assetFilename.endsWith(".wasm");
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./src/static/*.html",
          to: "./[name].html",
        },
      ],
    }),
    new MergeJsonWebpackPlugin({
      files: [MANIFEST_BASE_PATH, MANIFEST_BASE_VERSION_PATH, MANIFEST_PATH],
      output: {
        fileName: "./manifest.json",
      },
    }),
    new ExtensionReloader({
      port: 5000,
      reloadPage: true,
      entries: {
        contentScript: ["content"],
        background: ["background"],
        extensionPage: ["popup"],
      },
    }),
  ],
};

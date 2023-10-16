const webpack = require("webpack");
const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const createStyledComponentsTransformer =
  require("typescript-plugin-styled-components").default;

// Load .env from namada-interface:
require("dotenv").config({ path: "../namada-interface/.env" });

const { NODE_ENV, TARGET } = process.env;

const MANIFEST_VERSION = TARGET === "firefox" ? "v2" : "v3";
const MANIFEST_BASE_PATH = `./src/manifest/_base.json`;
const MANIFEST_BASE_VERSION_PATH = `./src/manifest/${MANIFEST_VERSION}/_base.json`;
const MANIFEST_PATH = `./src/manifest/${MANIFEST_VERSION}/${TARGET}.json`;
const MANIFEST_V2_DEV_ONLY_PATH = `./src/manifest/v2/_devOnly.json`;

const copyPatterns = [
  {
    from: "./src/public/*.html",
    to: "./[name].html",
  },
  {
    from: "./src/public/*.css",
    to: "./assets/[name].css",
  },
  {
    from: "./src/background/offscreen/offscreen.html",
    to: "./offscreen.html",
  },
  // browser-polyfill expects a source-map
  {
    from: "../../node_modules/webextension-polyfill/dist/browser-polyfill.js.map",
    to: "./browser-polyfill.js.map",
  },
];

const plugins = [
  new CopyPlugin({
    patterns: copyPatterns,
  }),
  new MergeJsonWebpackPlugin({
    files: [
      MANIFEST_BASE_PATH,
      MANIFEST_BASE_VERSION_PATH,
      MANIFEST_PATH,
      ...(NODE_ENV === "development" && TARGET === "firefox" ? [MANIFEST_V2_DEV_ONLY_PATH] : [])
    ],
    output: {
      fileName: "./manifest.json",
    },
  }),
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"],
  }),
  // Provide environment variables to extension:
  new webpack.DefinePlugin({
    process: {
      env: JSON.stringify(process.env),
    },
  }),
];

if (NODE_ENV === "development") {
  plugins.push(
    new ExtensionReloader({
      port: 9999,
      reloadPage: true,
      entries: {
        contentScript: ["content"],
        background: ["background"],
        extensionPage: ["popup", "setup", "approvals"],
      },
    })
  );
}

module.exports = {
  mode: NODE_ENV,
  target: "web",
  devtool: NODE_ENV === "development" && TARGET === "firefox" ? "eval-source-map" : false,
  entry: {
    content: "./src/content",
    background: "./src/background",
    popup: "./src/App",
    setup: "./src/Setup",
    approvals: "./src/Approvals",
    injected: "./src/content/injected.ts",
    offscreen: "./src/background/offscreen/offscreen.ts",
    ["submit-transfer-web-worker"]:
      "./src/background/web-workers/submit-transfer-web-worker.ts",
  },
  output: {
    publicPath: "",
    path: resolve(__dirname, `./build/${TARGET}`),
    filename: "[name].namada.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          getCustomTransformers: (program) => ({
            before: [
              createStyledComponentsTransformer(program, {
                setComponentId: true,
                setDisplayName: true,
                minify: true,
              }),
            ],
          }),
        },
      },
      {
        test: /\.wasm$/,
        type: "asset/inline",
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve("@svgr/webpack"),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: require.resolve("file-loader"),
            options: {
              name: "assets/[name].[hash].[ext]",
            },
          },
        ],
        issuer: {
          and: [/\.(ts|tsx|md)$/],
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [resolve(__dirname, "src/"), "node_modules"],
    fallback: {
      buffer: require.resolve("buffer/"),
      crypto: false,
    },
  },
  performance: {
    hints: "warning",
    maxAssetSize: 200000,
    maxEntrypointSize: 400000,
    assetFilter: function(assetFilename) {
      assetFilename.endsWith(".wasm");
    },
  },
  plugins,
};

const webpack = require("webpack");
const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const createStyledComponentsTransformer =
  require("typescript-plugin-styled-components").default;

// Load .env from namada-interface:
require('dotenv').config({ path: '../namada-interface/.env' });

const {
  NODE_ENV,
  TARGET,
  // React .env variables from interface for shared chain configuration:
  REACT_APP_NAMADA_ALIAS,
  REACT_APP_NAMADA_CHAIN_ID,
  REACT_APP_NAMADA_URL,
  REACT_APP_NAMADA_BECH32_PREFIX,
  REACT_APP_COSMOS_ALIAS,
  REACT_APP_COSMOS_CHAIN_ID,
  REACT_APP_COSMOS_URL,
  REACT_APP_OSMOSIS_ALIAS,
  REACT_APP_OSMOSIS_CHAIN_ID,
  REACT_APP_OSMOSIS_URL,
} = process.env;

const MANIFEST_VERSION = TARGET === "firefox" ? "v2" : "v3";
const MANIFEST_BASE_PATH = `./src/manifest/_base.json`;
const MANIFEST_BASE_VERSION_PATH = `./src/manifest/${MANIFEST_VERSION}/_base.json`;
const MANIFEST_PATH = `./src/manifest/${MANIFEST_VERSION}/${TARGET}.json`;

const copyPatterns = [
  {
    from: "./src/public/*.html",
    to: "./[name].html",
  },
  {
    from: "./src/public/*.css",
    to: "./assets/[name].css",
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
    files: [MANIFEST_BASE_PATH, MANIFEST_BASE_VERSION_PATH, MANIFEST_PATH],
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
      env: {
        REACT_APP_NAMADA_ALIAS,
        REACT_APP_NAMADA_CHAIN_ID,
        REACT_APP_NAMADA_URL,
        REACT_APP_NAMADA_BECH32_PREFIX,
        REACT_APP_COSMOS_ALIAS,
        REACT_APP_COSMOS_CHAIN_ID,
        REACT_APP_COSMOS_URL,
        REACT_APP_OSMOSIS_ALIAS,
        REACT_APP_OSMOSIS_CHAIN_ID,
        REACT_APP_OSMOSIS_URL,
      },
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
        extensionPage: ["popup", "setup"],
      },
    })
  );
}

module.exports = {
  mode: NODE_ENV,
  target: "web",
  devtool: false,
  entry: {
    content: "./src/content",
    background: "./src/background",
    popup: "./src/App",
    setup: "./src/Setup",
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
    },
  },
  performance: {
    hints: "warning",
    maxAssetSize: 200000,
    maxEntrypointSize: 400000,
    assetFilter: function (assetFilename) {
      assetFilename.endsWith(".wasm");
    },
  },
  plugins,
};

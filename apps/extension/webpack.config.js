const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const createStyledComponentsTransformer =
  require("typescript-plugin-styled-components").default;

const { NODE_ENV, TARGET } = process.env;
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
];

if (NODE_ENV === "development") {
  plugins.push(
    new ExtensionReloader({
      port: 5000,
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
    popup: "./src/popup",
    setup: "./src/setup",
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

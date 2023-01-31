const webpack = require("webpack");
const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const createStyledComponentsTransformer =
  require("typescript-plugin-styled-components").default;

// Load .env from namada-interface:
require("dotenv").config({ path: resolve(__dirname, `.env`) });

const {
  NODE_ENV,
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

console.log("\n\n\n\n\nBUILD MODE", NODE_ENV, "\n\n\n\n\n");
console.log(
  "\n\n\n\n\nLOCATION OF .env",
  resolve(__dirname, ".env"),
  "\n\n\n\n\n",
  process.env
);
const copyPatterns = [
  {
    from: "./public/wasm/*.wasm",
    to: "./wasm/[name].wasm",
  },
  {
    from: "./public/assets/*.params",
    to: "./assets/[name].params",
  },
  {
    from: "./public/*.png",
    to: "./assets/[name].png",
  },
];

// Set up environment values
const env = {};
const envVariables = {
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
};

// Stringify to ensure values are wrapped in quotes
for (const key in envVariables) {
  env[key] = JSON.stringify(envVariables[key]);
}

const plugins = [
  new CopyPlugin({
    patterns: copyPatterns,
  }),
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"],
  }),
  // Provide environment variables to interface:
  new webpack.DefinePlugin({
    process: {
      env,
    },
  }),
];

module.exports = {
  mode: NODE_ENV,
  target: "web",
  devtool: false,
  entry: "./src/index.tsx",
  output: {
    publicPath: "",
    path: resolve(__dirname, `./build/`),
    filename: "[name].js",
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

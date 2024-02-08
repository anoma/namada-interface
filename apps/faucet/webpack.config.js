const webpack = require("webpack");
const { resolve, join } = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { getProcessEnv } = require("@namada/config/webpack.js");

// Load environment variables
require("dotenv").config({ path: resolve(__dirname, ".env") });

const { NODE_ENV } = process.env;

const ASSET_PATH =
  NODE_ENV === "development" ? "/" : "https://faucet.heliax.click/";

const createStyledComponentsTransformer =
  require("typescript-plugin-styled-components").default;

const copyPatterns = [
  {
    from: "./public/*.png",
    to: "./assets/[name].png",
  },
  {
    from: "./public/manifest.json",
    to: "./manifest.json",
  },
  {
    from: "./public/_redirects",
    to: "./_redirects",
  },
];

const plugins = [
  new CopyPlugin({
    patterns: copyPatterns,
  }),
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"],
  }),
  new HtmlWebpackPlugin({
    template: resolve("./public/index.html"),
  }),
  // Provide environment variables to interface:
  new webpack.DefinePlugin({
    process: {
      env: JSON.stringify(
        getProcessEnv("NAMADA_INTERFACE", [
          "TARGET",
          "NODE_ENV",
          "npm_package_version",
        ])
      ),
    },
  }),
];

module.exports = {
  mode: NODE_ENV,
  target: "web",
  devtool: "eval-source-map",
  entry: {
    faucet: "./src",
  },
  output: {
    publicPath: ASSET_PATH,
    path: resolve(__dirname, `./build/`),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: resolve(__dirname, "tsconfig.webpack.json"),
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
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.png$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
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
      crypto: require.resolve("crypto-browserify"),
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: "tsconfig.json",
      }),
    ],
  },
  performance: {
    hints: false,
  },
  plugins,
  devServer: {
    static: {
      directory: join(__dirname, "public"),
    },
    compress: false,
    port: 8081,
    historyApiFallback: true,
  },
};

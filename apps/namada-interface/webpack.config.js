const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");
const { resolve, join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { getProcessEnv } = require("@namada/config/webpack.js");

// Load environment variables
require("dotenv").config({ path: resolve(__dirname, ".env") });

const { NODE_ENV, BUNDLE_ANALYZE } = process.env;

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

const analyzePlugins =
  BUNDLE_ANALYZE === "true" ? [new BundleAnalyzerPlugin()] : [];

const plugins = [
  ...analyzePlugins,
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
    interface: "./src",
  },
  output: {
    publicPath: "/",
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
    alias: {
      // Use styled-components from namada-interface, not packages/components
      "styled-components": resolve(
        __dirname,
        "node_modules",
        "styled-components"
      ),
    },
    extensions: [".tsx", ".ts", ".js"],
    modules: [resolve(__dirname, "src/"), "node_modules"],
    fallback: {
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify"),
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: "tsconfig.webpack.json",
      }),
    ],
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
  devServer: {
    static: {
      directory: join(__dirname, "public"),
    },
    compress: false,
    port: 3000,
    historyApiFallback: true,
  },
  stats: {
    // We want to ignore wasm-bindgen-rayon circular dependency warning
    warningsFilter: [/dependency between chunks.+wasm-bindgen-rayon/],
  },
};

const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const copyPatterns = [
  {
    from: "../../packages/shared/src/shared/shared_bg.wasm",
    to: "shared_bg.wasm",
  },
  {
    from: "../../packages/crypto/src/crypto/crypto_bg.wasm",
    to: "crypto_bg.wasm",
  },
];

module.exports = {
  target: "node",
  mode: "development",
  entry: "./src/index.ts",
  output: {
    path: path.resolve("dist"),
    filename: "index.js",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, "tsconfig.webpack.json"),
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.resolve(__dirname, "src/"), "node_modules"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: "tsconfig.json",
      }),
    ],
  },
  plugins: [new CopyPlugin({ patterns: copyPatterns })],
  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin()],
  // },
};

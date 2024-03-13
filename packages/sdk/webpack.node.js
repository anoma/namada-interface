const CopyPlugin = require("copy-webpack-plugin");

const base = require("./webpack.base.js");

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
  ...base,
  target: "node",
  entry: "./src/indexNode.ts",
  output: {
    ...base.output,
    filename: "indexNode.js",
  },
  plugins: [...base.plugins, new CopyPlugin({ patterns: copyPatterns })],
};

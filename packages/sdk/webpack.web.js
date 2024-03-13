const CopyPlugin = require("copy-webpack-plugin");

const base = require("./webpack.base.js");

const copyPatterns = [
  {
    from: "../../packages/shared/src/shared/shared_bg.wasm",
    to: "shared.namada.wasm",
  },
  {
    from: "../../packages/crypto/src/crypto/crypto_bg.wasm",
    to: "crypto.namada.wasm",
  },
];

module.exports = {
  ...base,
  target: "web",
  entry: "./src/indexWeb.ts",
  output: {
    ...base.output,
    filename: "indexWeb.js",
  },
  plugins: [...base.plugins, new CopyPlugin({ patterns: copyPatterns })],
};

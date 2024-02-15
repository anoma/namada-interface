const baseConfig = require("../.release-it.base.cjs");

const config = {
  ...baseConfig,
  hooks: {
    "after:bump": [
      "yarn bump -p components -p types",
    ],
  },
};

module.exports = config;

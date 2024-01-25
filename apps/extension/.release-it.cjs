const baseConfig = require("../../.release-it.base.cjs");

const config = {
  ...baseConfig,
  hooks: {
    "after:bump": [
      "yarn bump -p chains -p components -p crypto -p shared -p storage -p types -p utils",
    ],
  },
};

module.exports = config;

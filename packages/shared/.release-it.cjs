const baseConfig = require("../../.release-it.base.cjs");

const config = {
  ...baseConfig,
  npm: {
    ...baseConfig.npm,
    publish: true,
  },
};

module.exports = config;

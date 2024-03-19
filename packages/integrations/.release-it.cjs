const baseConfig = require("../../.release-it.base.cjs");

const config = {
  ...baseConfig,
  // TODO: we do not want to bump the version of the packages that are not published
  // hooks: {
  //   "after:bump": ["yarn bump -p types -p utils"],
  // },
};

module.exports = config;

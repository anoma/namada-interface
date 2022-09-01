module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // ts-loader for using non-transpiled ts content from yarn workspaces
      webpackConfig.module.rules.push({
        test: /\.ts?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          configFile: "tsconfig.json",
        },
      });

      // @cosmjs/encoding requires "crypto", which is only availabe on NodeJS.
      // This provides a fallback for browsers:
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          crypto: require.resolve("crypto-browserify"),
        },
      };

      return webpackConfig;
    },
  },
};

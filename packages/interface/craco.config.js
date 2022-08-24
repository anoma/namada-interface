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

      return webpackConfig;
    },
  },
};

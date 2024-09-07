module.exports = {
  extends: require.resolve("@namada/config/eslint/react.js"),
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-floating-promises": ["warn"],
      },
    },
  ],
};

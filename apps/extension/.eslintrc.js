module.exports = {
  extends: require.resolve("@namada/config/eslint/react.js"),
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    project: [`${__dirname}/tsconfig.json`],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-floating-promises": ["warn"],
      },
    },
  ],
};

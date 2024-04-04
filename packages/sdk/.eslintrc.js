module.exports = {
  plugins: ["jsdoc"],
  extends: [
    require.resolve("@namada/config/eslint/react.js"),
    "plugin:jsdoc/recommended-typescript",
  ],
  rules: {
    "jsdoc/require-jsdoc": [
      "warn",
      {
        contexts: [
          "ClassDeclaration",
          "ClassProperty",
          "FunctionDeclaration",
          "MethodDefinition",
        ],
      },
    ],
    "jsdoc/require-returns-description": 0,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    project: [`${__dirname}/tsconfig.json`],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-floating-promises": "warn",
      },
    },
  ],
};

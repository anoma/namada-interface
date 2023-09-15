module.exports = {
  "env": {
    "es2021": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "no-use-before-define": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "ts": "never"
      }
    ],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["off"],
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        "allowExpressions": true
      }
    ],
    "import/prefer-default-export": "off",
    "no-restricted-globals": [
      "error",
      {
        "name": "browser",
        "message": "You probably need to import webextension-polyfill."
      }
    ]
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    "import/resolver": {
      "typescript": {
        "paths": ["./src"]
      }
    }
  }
};

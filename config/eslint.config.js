const globals = require("globals");
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const pluginChaiFriendly = require("eslint-plugin-chai-friendly");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "out/",
      ".vscode-test/**/*",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginChaiFriendly.configs.recommendedFlat,
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.jquery,
        ...globals.mocha,
      },
    },
    rules: {
      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      semi: "off",
    },
  },
];

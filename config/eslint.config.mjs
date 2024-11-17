import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginChaiFriendly from "eslint-plugin-chai-friendly";

export default [
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

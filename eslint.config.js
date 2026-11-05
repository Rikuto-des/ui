import tseslint from "typescript-eslint";
import urushi from "@urushi/eslint-plugin";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "generated/**",
      "packages/*/src/generated/**",
      "apps/playground/public/**",
      "tests/lint-fixtures/**",
    ],
  },
  {
    ...urushi.configs.recommended,
    files: ["apps/**/*.tsx", "examples/**/*.tsx", "scripts/**/*.tsx", "blocks/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];

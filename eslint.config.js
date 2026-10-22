import tseslint from "typescript-eslint";
import yourlib from "@yourlib/eslint-plugin";

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
    ...yourlib.configs.recommended,
    files: ["apps/**/*.tsx", "examples/**/*.tsx", "scripts/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];

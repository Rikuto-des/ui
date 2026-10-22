import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import plugin from "../src/index.ts";

const root = join(import.meta.dirname, "../../..");

test("every problem in the agent-written fixture is reported with a fix in the message", async () => {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        ...plugin.configs.recommended,
        files: ["**/*.tsx"],
        languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
      },
    ],
  });
  const [result] = await eslint.lintFiles(["tests/lint-fixtures/agent-written.tsx"]);
  const ids = result.messages.map((m) => m.ruleId).sort();
  if (process.env.SHOW) for (const m of result.messages) console.log(`${m.line}:${m.column} ${m.ruleId}\n  ${m.message}`);
  assert.deepEqual(ids, [
    ...Array(3).fill("yourlib/accessible-name"),
    ...Array(10).fill("yourlib/no-raw-color"),
    ...Array(3).fill("yourlib/no-visual-override"),
    "yourlib/prefer-native",
    ...Array(2).fill("yourlib/required-props"),
    ...Array(2).fill("yourlib/tabs-match"),
    ...Array(2).fill("yourlib/valid-idref"),
    ...Array(3).fill("yourlib/valid-import"),
    "yourlib/valid-token",
  ]);
  for (const m of result.messages) assert.ok(m.message.length > 20, `${m.ruleId} message should explain the fix`);
});

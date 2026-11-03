/** Reproducible, offline example of detect → repair → recheck. Never invokes an AI service. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { check } from "../packages/cli/src/check.ts";

const root = resolve(import.meta.dirname, "..");
const cwd = await mkdtemp(join(tmpdir(), "urushi-proof-"));
const before = `import { Button, Dialog } from "@urushi/react";

export default function Confirm() {
  return <>
    <Button variant="destructive" className="rounded-xl">削除する</Button>
    <Dialog id="confirm" open onOpenChange={() => {}} />
  </>;
}
`;
const after = `import { Dialog } from "@urushi/react";

export default function Confirm() {
  return <>
    <Dialog.Trigger dialog="confirm" variant="danger">削除する</Dialog.Trigger>
    <Dialog id="confirm" title="タスクを削除しますか？">
      <Dialog.Actions>
        <Dialog.Close dialog="confirm" variant="ghost" autoFocus>キャンセル</Dialog.Close>
        <Dialog.Close dialog="confirm" variant="danger">削除する</Dialog.Close>
      </Dialog.Actions>
    </Dialog>
  </>;
}
`;
try {
  await symlink(join(root, "node_modules"), join(cwd, "node_modules"));
  await writeFile(join(cwd, "tsconfig.json"), JSON.stringify({
    compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, jsx: "react-jsx", module: "ESNext", moduleResolution: "Bundler", allowImportingTsExtensions: true },
    include: ["screen.tsx"],
  }));
  await writeFile(join(cwd, "screen.tsx"), before);
  const rejected = await check(cwd, { strict: true });
  assert.equal(rejected.status, "fail");
  for (const code of ["urushi/valid-props", "urushi/required-props", "urushi/no-visual-override"]) {
    assert.ok(rejected.issues.some((i) => i.code === code), `must catch ${code}`);
  }
  await writeFile(join(cwd, "screen.tsx"), after);
  const accepted = await check(cwd, { strict: true });
  assert.equal(accepted.status, "pass", JSON.stringify(accepted.issues));
  const hash = (text: string) => createHash("sha256").update(text).digest("hex");
  const evidence = {
    schemaVersion: 1,
    kind: "authored regression fixture, not an AI benchmark",
    command: "pnpm proof:agent",
    catalogSha256: hash(await readFile(join(root, "packages/cli/src/catalog.generated.json"), "utf8")),
    before: { code: before, sha256: hash(before), report: rejected },
    after: { code: after, sha256: hash(after), report: accepted },
  };
  await writeFile(join(root, "generated/agent-proof.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(`agent proof: ${rejected.summary.errors} errors → ${accepted.summary.errors} errors; ${accepted.summary.lintedFiles} file checked`);
} finally {
  await rm(cwd, { recursive: true, force: true });
}

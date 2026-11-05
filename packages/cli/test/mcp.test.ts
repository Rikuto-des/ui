import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { afterEach, test } from "node:test";
import { init } from "../src/add.ts";
import { SUPPORTED_PROTOCOL_VERSIONS } from "../src/mcp.ts";

const bin = join(import.meta.dirname, "../src/bin.ts");
const registry = join(import.meta.dirname, "../../../generated/registry");

// A failed assertion skips close(): a server left running would keep the test file from ending.
const running = new Set<ReturnType<typeof spawn>>();
afterEach(() => {
  for (const child of running) child.kill();
  running.clear();
});

/** Starts `urushi mcp` as a real process and talks to it over stdio, as an MCP client does. */
function client(cwd: string) {
  const child = spawn(process.execPath, [bin, "mcp", "--cwd", cwd], { stdio: ["pipe", "pipe", "pipe"] });
  running.add(child);
  const waiting = new Map<number | string | null, (reply: Record<string, unknown>) => void>();
  const stdout: string[] = [];
  createInterface({ input: child.stdout }).on("line", (line) => {
    stdout.push(line);
    const reply = JSON.parse(line);
    waiting.get(reply.id)?.(reply);
    waiting.delete(reply.id);
  });
  let next = 1;
  const send = (message: object) => child.stdin.write(`${JSON.stringify(message)}\n`);
  return {
    stdout,
    raw: (line: string, id: number | null) =>
      new Promise<Record<string, unknown>>((resolve) => {
        waiting.set(id, resolve);
        child.stdin.write(`${line}\n`);
      }),
    notify: (method: string, params?: object) => send({ jsonrpc: "2.0", method, params }),
    request: (method: string, params?: object) =>
      new Promise<Record<string, unknown>>((resolve) => {
        const id = next++;
        waiting.set(id, resolve);
        send({ jsonrpc: "2.0", id, method, params });
      }),
    close: () =>
      new Promise<number | null>((resolve) => {
        child.on("exit", resolve);
        child.stdin.end();
      }),
  };
}

type ToolResult = { content: { type: string; text: string }[]; structuredContent?: Record<string, unknown>; isError?: boolean };

test("mcp: initializes, lists tools with schemas, and answers a contract lookup", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-mcp-"));
  const c = client(cwd);
  const init = (await c.request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "test", version: "1" },
  })) as { result: { protocolVersion: string; serverInfo: { name: string }; capabilities: { tools: object }; instructions: string } };
  assert.equal(init.result.protocolVersion, "2025-06-18");
  assert.equal(init.result.serverInfo.name, "urushi");
  assert.ok(init.result.capabilities.tools);
  assert.match(init.result.instructions, /get_authoring_context/);
  c.notify("notifications/initialized");

  const list = (await c.request("tools/list")) as { result: { tools: { name: string; inputSchema: { type: string; required?: string[] }; annotations: { readOnlyHint: boolean } }[] } };
  const names = list.result.tools.map((t) => t.name);
  assert.deepEqual(names, [
    "list_components",
    "describe_component",
    "get_authoring_context",
    "check_project",
    "project_info",
    "add_components",
    "update_components",
    "list_local_changes",
  ]);
  for (const t of list.result.tools) assert.equal(t.inputSchema.type, "object", t.name);
  assert.deepEqual(list.result.tools.find((t) => t.name === "describe_component")!.inputSchema.required, ["name"]);
  assert.equal(list.result.tools.find((t) => t.name === "add_components")!.annotations.readOnlyHint, false);

  const described = (await c.request("tools/call", { name: "describe_component", arguments: { name: "Dialog.Trigger" } })) as { result: ToolResult };
  assert.equal(described.result.isError, undefined);
  assert.equal(described.result.structuredContent!.name, "dialog");
  assert.equal(JSON.parse(described.result.content[0].text).name, "dialog");

  const all = (await c.request("tools/call", { name: "list_components" })) as { result: ToolResult };
  assert.ok((all.result.structuredContent!.components as unknown[]).length >= 50);

  assert.equal(await c.close(), 0);
  // stdout carries nothing but protocol messages.
  for (const line of c.stdout) assert.equal(JSON.parse(line).jsonrpc, "2.0");
});

test("mcp: negotiates the protocol version, and reports bad input the right way", async () => {
  const c = client(await mkdtemp(join(tmpdir(), "urushi-mcp-")));
  const future = (await c.request("initialize", { protocolVersion: "2099-01-01", capabilities: {}, clientInfo: { name: "t", version: "1" } })) as {
    result: { protocolVersion: string };
  };
  assert.equal(future.result.protocolVersion, SUPPORTED_PROTOCOL_VERSIONS[0]);
  assert.deepEqual(((await c.request("ping")) as { result: object }).result, {});

  // Protocol errors: unknown method, unknown tool, arguments that do not match the schema, unparsable JSON.
  assert.equal(((await c.request("resources/list")) as { error: { code: number } }).error.code, -32601);
  const unknown = (await c.request("tools/call", { name: "rm_rf", arguments: {} })) as { error: { code: number; message: string } };
  assert.equal(unknown.error.code, -32602);
  const invalid = (await c.request("tools/call", { name: "describe_component", arguments: { name: 3 } })) as { error: { code: number; message: string } };
  assert.equal(invalid.error.code, -32602);
  assert.match(invalid.error.message, /name/);
  assert.equal(((await c.raw("{not json", null)) as { error: { code: number } }).error.code, -32700);

  // A tool that fails is a result the model can read, not a protocol error.
  const missing = (await c.request("tools/call", { name: "describe_component", arguments: { name: "Stepper" } })) as { result: ToolResult };
  assert.equal(missing.result.isError, true);
  assert.match(missing.result.content[0].text, /Unknown component "Stepper"\. Available: accordion/);

  // check_project paths stay inside the project.
  const escape = (await c.request("tools/call", { name: "check_project", arguments: { project: "../elsewhere/tsconfig.json" } })) as { result: ToolResult };
  assert.equal(escape.result.isError, true);
  assert.match(escape.result.content[0].text, /Unsafe path/);
  assert.equal(await c.close(), 0);
});

test("mcp: adds components, keeps local edits, previews updates and checks the project", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "urushi-mcp-project-"));
  await init(cwd, { registry, pack: "lucent", components: "components/ui" });
  const c = client(cwd);
  await c.request("initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "t", version: "1" } });

  const added = (await c.request("tools/call", { name: "add_components", arguments: { names: ["dialog"] } })) as { result: ToolResult };
  assert.equal(added.result.isError, undefined, added.result.content[0].text);
  assert.equal(added.result.structuredContent!.packCss, "@urushi/packs/lucent.css");
  assert.match(await readFile(join(cwd, "components/ui/dialog.tsx"), "utf8"), /@urushi\/react/);

  // A second add never overwrites a file the user changed.
  await writeFile(join(cwd, "components/ui/dialog.tsx"), "// mine\n");
  await c.request("tools/call", { name: "add_components", arguments: { names: ["dialog"] } });
  assert.equal(await readFile(join(cwd, "components/ui/dialog.tsx"), "utf8"), "// mine\n");

  const info = (await c.request("tools/call", { name: "project_info" })) as { result: ToolResult };
  assert.ok((info.result.structuredContent!.installed as Record<string, unknown>).dialog);
  const changes = (await c.request("tools/call", { name: "list_local_changes" })) as { result: ToolResult };
  assert.deepEqual(changes.result.structuredContent!.files, [{ item: "dialog", file: "components/ui/dialog.tsx", status: "modified" }]);

  // update previews unless told to write.
  const preview = (await c.request("tools/call", { name: "update_components", arguments: {} })) as { result: ToolResult };
  assert.equal(preview.result.structuredContent!.dryRun, true);
  assert.equal(await readFile(join(cwd, "components/ui/dialog.tsx"), "utf8"), "// mine\n");

  // No tsconfig: check reports it as an issue instead of failing.
  const checked = (await c.request("tools/call", { name: "check_project", arguments: {} })) as { result: ToolResult };
  assert.equal(checked.result.structuredContent!.status, "fail");
  assert.match(checked.result.content[0].text, /missing-tsconfig/);
  assert.equal(await c.close(), 0);
});

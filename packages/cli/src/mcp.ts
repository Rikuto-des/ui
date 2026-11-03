import { createInterface } from "node:readline";
import { z } from "@urushi/contract";
import { add, diff, readConfig, readLock } from "./add.ts";
import catalog from "./catalog.generated.json" with { type: "json" };
import { context, describe } from "./catalog.ts";
import { relativePath } from "./paths.ts";

/**
 * `urushi mcp`: the CLI's agent commands as a Model Context Protocol server
 * over stdio (newline-delimited JSON-RPC 2.0). Every tool works on the
 * project the server was started in and never leaves it.
 */

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "urushi", title: "Urushi", version: "0.1.0-beta.1" };
const INSTRUCTIONS =
  "Urushi is a React UI library built on native HTML elements, styled by packs (Graphite, Lucent). " +
  "Before writing UI, call get_authoring_context with the components you plan to use and follow its rules and contracts exactly. " +
  "After editing, call check_project and fix every issue it reports. Use add_components to copy components into the project; " +
  "update_components previews by default and only writes with dryRun: false.";

const componentName = z.string().min(1).describe("A component or part name, e.g. dialog, Dialog or Dialog.Trigger.");
const tools = {
  list_components: {
    title: "List components",
    description: "Every Urushi component with a one-line summary, when to use it and its JSX parts.",
    input: z.object({}),
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async () => ({
      components: catalog.map((c) => ({ name: c.name, summary: c.summary, use: c.use, parts: c.parts.map((p) => p.jsx) })),
    }),
  },
  describe_component: {
    title: "Describe a component",
    description: "The exact contract of one component: props, parts, accessibility rules, states, tokens and examples.",
    input: z.object({ name: componentName }),
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async ({ name }: { name: string }) => describe(name),
  },
  get_authoring_context: {
    title: "Get authoring context",
    description:
      "Contracts for the given components plus the system-wide design rules and tokens. Call this before writing UI with them.",
    input: z.object({
      components: z.array(componentName).min(1).describe("The components the UI will use."),
      compact: z.boolean().default(false).describe("Only common tokens plus those the components use."),
    }),
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async ({ components, compact }: { components: string[]; compact: boolean }) => context(components, { compact }),
  },
  check_project: {
    title: "Check the project",
    description:
      "Type-check the TypeScript project and lint it against the component contracts. Returns each issue with file, line and repair context. Read-only.",
    input: z.object({
      project: z.string().optional().describe("Path to a tsconfig.json inside the project. Defaults to the nearest one."),
      strict: z.boolean().default(false).describe("Treat warnings as failures."),
    }),
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async ({ project, strict }: { project?: string; strict: boolean }, cwd: string) => {
      const { check } = await import("./check.ts");
      return check(cwd, { project: project === undefined ? undefined : relativePath(project), strict });
    },
  },
  project_info: {
    title: "Project info",
    description: "The project's urushi.json (pack, components folder, registry) and the installed components with versions.",
    input: z.object({}),
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async (_: object, cwd: string) => ({ config: await readConfig(cwd), installed: (await readLock(cwd)).items }),
  },
  add_components: {
    title: "Add components",
    description:
      "Copy components into the project's components folder and record them in urushi.lock. Files you already changed are kept, never overwritten. Returns the packages to install and the CSS to import.",
    input: z.object({ names: z.array(componentName).min(1) }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    run: async ({ names }: { names: string[] }, cwd: string) => {
      const results = await add(cwd, names);
      const { pack } = await readConfig(cwd);
      return { results, packCss: `@urushi/packs/${pack}.css`, htmlAttribute: `data-pack="${pack}"` };
    },
  },
  update_components: {
    title: "Update components",
    description:
      "Take newer registry versions, merging local edits with a 3-way merge. Previews by default; pass dryRun: false to write. Conflicts are written with markers and listed.",
    input: z.object({
      names: z.array(componentName).default([]).describe("Components to update. Empty means all installed."),
      dryRun: z.boolean().default(true),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    run: async ({ names, dryRun }: { names: string[]; dryRun: boolean }, cwd: string) => {
      const { update, conflictHelp } = await import("./update.ts");
      const entries = await update(cwd, names, { dryRun });
      const conflicts = entries.some((e) => e.status === "conflict");
      return { dryRun, entries, ...(conflicts ? { conflictHelp: conflictHelp(entries) } : {}) };
    },
  },
  list_local_changes: {
    title: "List local changes",
    description: "Installed files changed since they were added, and unresolved merge conflicts.",
    input: z.object({}),
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async (_: object, cwd: string) => ({ files: await diff(cwd) }),
  },
} satisfies Record<string, Tool>;

interface Tool {
  title: string;
  description: string;
  input: z.ZodObject;
  annotations: Record<string, boolean>;
  /** Takes the tool's own parsed input; the dispatcher validates against `input` first. */
  run: (args: never, cwd: string) => Promise<unknown>;
}

type Id = string | number;
interface Message {
  jsonrpc?: string;
  id?: Id | null;
  method?: string;
  params?: Record<string, unknown>;
}
type Reply = { jsonrpc: "2.0"; id: Id | null } & ({ result: unknown } | { error: { code: number; message: string } });

const inputSchema = (schema: z.ZodObject) => {
  const json = z.toJSONSchema(schema, { io: "input" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
};

/** Handles one message; returns the reply, or null for notifications. */
export async function handle(message: Message, cwd: string): Promise<Reply | null> {
  const id = message.id;
  const isRequest = id !== undefined && id !== null;
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return isRequest ? { jsonrpc: "2.0", id, error: { code: -32600, message: "Invalid request" } } : null;
  }
  if (!isRequest) return null; // notifications/initialized, notifications/cancelled, …
  const ok = (result: unknown): Reply => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, msg: string): Reply => ({ jsonrpc: "2.0", id, error: { code, message: msg } });

  switch (message.method) {
    case "initialize": {
      const requested = message.params?.protocolVersion;
      const protocolVersion =
        typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[0];
      return ok({ protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({
        tools: Object.entries(tools).map(([name, t]) => ({
          name,
          title: t.title,
          description: t.description,
          inputSchema: inputSchema(t.input),
          annotations: t.annotations,
        })),
      });
    case "tools/call": {
      const name = message.params?.name;
      const tool = typeof name === "string" && Object.hasOwn(tools, name) ? (tools as Record<string, Tool>)[name] : undefined;
      if (!tool) return fail(-32602, `Unknown tool ${JSON.stringify(name)}. Available: ${Object.keys(tools).join(", ")}`);
      const parsed = tool.input.safeParse(message.params?.arguments ?? {});
      if (!parsed.success) {
        return fail(-32602, `Invalid arguments for ${name}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ")}`);
      }
      try {
        const value = await tool.run(parsed.data as never, cwd);
        const structured = value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : { value };
        return ok({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }], structuredContent: structured });
      } catch (error) {
        // A failed tool is a result the model can read and act on, not a protocol error.
        return ok({ content: [{ type: "text", text: (error as Error).message }], isError: true });
      }
    }
    default:
      return fail(-32601, `Method not found: ${message.method}`);
  }
}

/** Serves until stdin closes. stdout carries only protocol messages; anything else goes to stderr. */
export async function serve(cwd: string, input: NodeJS.ReadableStream = process.stdin, output: NodeJS.WritableStream = process.stdout) {
  console.log = console.info = console.warn = console.error;
  const send = (reply: Reply) => output.write(`${JSON.stringify(reply)}\n`);
  const pending = new Set<Promise<void>>();
  for await (const line of createInterface({ input, crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    let message: Message;
    try {
      message = JSON.parse(line);
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      continue;
    }
    // Requests run concurrently (a slow check must not block ping); replies carry their id.
    const job = handle(message, cwd).then((reply) => {
      if (reply) send(reply);
    });
    pending.add(job);
    void job.finally(() => pending.delete(job));
  }
  await Promise.all(pending);
}

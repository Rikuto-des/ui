/**
 * Measures how often Claude writes yourlib screens that pass @yourlib/eslint-plugin.
 *
 *   node scripts/ai-lint-rate.ts                    # run every task in both conditions
 *   node scripts/ai-lint-rate.ts --trials 3         # repeat each task to see the spread
 *   node scripts/ai-lint-rate.ts --tasks 02,04 --conditions A
 *   node scripts/ai-lint-rate.ts --dry-run          # show the plan and prompts, no API calls
 *   node scripts/ai-lint-rate.ts --rescore evals/runs/<run>   # re-lint saved outputs
 *
 * Condition A gives the model generated/llms.txt and generated/SKILL.md; condition B
 * gives it nothing but the task. Every reply is linted with the same config as
 * packages/eslint-plugin/test/fixture.test.ts, and a reply with problems gets one more
 * turn with the lint report. Replies are saved to evals/runs/<run>/ and the tables are
 * written between the markers in docs/phase1/ai-lint-rate.md.
 *
 * With ANTHROPIC_API_KEY set it calls the Claude API (the key is read from there and
 * nowhere else); without it, it runs `claude -p` on the Claude Code login.
 * --via api|claude picks one explicitly; CLAUDE_BIN points at the claude command.
 */
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { ESLint } from "eslint";
import ts from "typescript";
import tseslint from "typescript-eslint";
import plugin from "../packages/eslint-plugin/src/index.ts";
import parts from "../packages/eslint-plugin/src/contracts.generated.json" with { type: "json" };

const root = join(import.meta.dirname, "..");

const { values: args } = parseArgs({
  options: {
    trials: { type: "string", default: "1" },
    tasks: { type: "string" },
    conditions: { type: "string", default: "A,B" },
    model: { type: "string", default: "claude-opus-5-5" },
    effort: { type: "string", default: "high" },
    concurrency: { type: "string", default: "4" },
    via: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    rescore: { type: "string" },
    out: { type: "string", default: "evals/runs" },
    report: { type: "string", default: "docs/phase1/ai-lint-rate.md" },
  },
});

type Condition = "A" | "B";
type Effort = "low" | "medium" | "high" | "xhigh" | "max";

interface Task {
  id: string;
  title: string;
  prompt: string;
}

interface Problem {
  line: number;
  column: number;
  severity: 1 | 2;
  /** The rule, or "parse-error" when the file does not parse. */
  rule: string;
  message: string;
}

interface Attempt {
  /** The saved TSX, relative to the run directory; null when the reply had no code block. */
  file: string | null;
  stopReason: string | null;
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
  /** What Claude Code reports for the turn (`claude -p` only). */
  costUsd?: number | null;
  problems: Problem[];
  /** JSX elements whose name is a yourlib part (Button, Dialog.Trigger, …). */
  yourlibElements: number;
  /** Ways of writing that only SKILL.md teaches; in condition B they would mean the docs leaked in. */
  skillSignals?: string[];
  typeErrors: number | null;
}

interface Sample {
  task: string;
  condition: Condition;
  trial: number;
  first?: Attempt;
  /** Only when the first attempt had problems. */
  fix?: Attempt;
  error?: string;
}

interface Run {
  id: string;
  via?: Via;
  /** "Claude API" or "claude -p（2.1.296 (Claude Code)）". */
  client?: string;
  model: string;
  effort: Effort;
  trials: number;
  /** sha256 prefixes of the files condition A gives the model. */
  docs: { llms: string; skill: string };
  tasks: Task[];
  samples: Sample[];
}

// ----------------------------------------------------------------------------
// Prompts

const BASE_SYSTEM = `You are a coding agent working in a React 19 + TypeScript app (Next.js App Router). Tailwind CSS is available.
The app's UI component library is yourlib; import its components from "@yourlib/react".

Write the screen the user asks for as one .tsx file.
- Use yourlib components wherever one fits.
- Import only from "react" and "@yourlib/react".
- Export the screen as a named export.
- Reply with the complete file in a single \`\`\`tsx code block and nothing else.`;

function systemPrompt(condition: Condition, docs: { llms: string; skill: string }): string {
  if (condition === "B") return BASE_SYSTEM;
  return `${BASE_SYSTEM}

The library's documentation follows.

<file path="llms.txt">
${docs.llms.trim()}
</file>

<file path="SKILL.md">
${docs.skill.trim()}
</file>`;
}

/** What an agent sees after running eslint (the stylish formatter's lines). */
function fixPrompt(attempt: Attempt): string {
  if (attempt.file === null) {
    return "Your reply had no ```tsx code block. Reply with the complete file in a single ```tsx code block.";
  }
  const report = attempt.problems
    .map((p) => `  ${p.line}:${p.column}  ${p.severity === 2 ? "error" : "warning"}  ${p.message}  ${p.rule === "parse-error" ? "" : p.rule}`.trimEnd())
    .join("\n");
  return `Running eslint with @yourlib/eslint-plugin on your file reported:

${report}

Fix every problem and reply with the complete corrected file in a single \`\`\`tsx code block.`;
}

async function loadTasks(filter: string | undefined): Promise<Task[]> {
  const dir = join(root, "evals/ui-tasks");
  const names = (await readdir(dir)).filter((n) => /^\d\d-.+\.md$/.test(n)).sort();
  const wanted = filter?.split(",").map((s) => s.trim());
  const tasks: Task[] = [];
  for (const name of names) {
    const id = name.replace(/\.md$/, "");
    if (wanted && !wanted.some((w) => id === w || id.startsWith(`${w}-`))) continue;
    const text = await readFile(join(dir, name), "utf8");
    const [heading, ...rest] = text.trim().split("\n");
    if (!heading.startsWith("# ")) throw new Error(`${name}: the first line must be "# <title>"`);
    tasks.push({ id, title: heading.slice(2).trim(), prompt: rest.join("\n").trim() });
  }
  if (tasks.length === 0) throw new Error(`no tasks match --tasks ${filter}`);
  return tasks;
}

// ----------------------------------------------------------------------------
// Scoring

// The same config as packages/eslint-plugin/test/fixture.test.ts.
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

const PART_NAMES = new Set(Object.keys(parts));

/**
 * Ways of writing that only SKILL.md (or the components' source) teaches. Condition B
 * gets no docs, so finding these in its replies would mean yourlib leaked in.
 */
const SKILL_ONLY: [string, RegExp][] = [
  ["Trigger の dialog/menu/popover/tooltip で id を指す", /<(Dialog|Menu|Popover|Tooltip)\.(Trigger|Close)\b[^>]*?\s(dialog|menu|popover|tooltip)=/],
  ["トークン var(--yl-…)", /--yl-/],
  ["data-pack", /data-pack/],
  ["YourlibRuntime", /YourlibRuntime/],
  ["Card の headingLevel", /headingLevel=/],
  ["Badge の tone", /<Badge\b[^>]*?\stone=/],
];

async function lint(attempt: Attempt, runDir: string): Promise<void> {
  if (attempt.file === null) {
    attempt.problems = [];
    attempt.yourlibElements = 0;
    attempt.skillSignals = [];
    return;
  }
  const path = join(runDir, attempt.file);
  const code = await readFile(path, "utf8");
  const [result] = await eslint.lintText(code, { filePath: path });
  attempt.problems = result.messages.map((m) => ({
    line: m.line,
    column: m.column,
    severity: m.severity === 2 ? 2 : 1,
    rule: m.ruleId ?? "parse-error",
    message: m.message,
  }));
  attempt.yourlibElements = [...code.matchAll(/<([A-Z]\w*(?:\.[A-Z]\w*)*)[\s/>]/g)].filter((m) => PART_NAMES.has(m[1])).length;
  attempt.skillSignals = SKILL_ONLY.filter(([, re]) => re.test(code)).map(([label]) => label);
}

/** Type-checks every saved file in one program with the repository's compiler options. */
function typecheck(run: Run, runDir: string): void {
  const attempts = run.samples.flatMap((s) => [s.first, s.fix]).filter((a): a is Attempt => a?.file != null);
  if (attempts.length === 0) return;
  const config = ts.readConfigFile(join(root, "tsconfig.json"), ts.sys.readFile).config;
  const { options } = ts.parseJsonConfigFileContent({ compilerOptions: config.compilerOptions, files: [] }, ts.sys, root);
  const files = attempts.map((a) => join(runDir, a.file!));
  const program = ts.createProgram(files, options);
  attempts.forEach((attempt, i) => {
    const source = program.getSourceFile(files[i]);
    attempt.typeErrors = source
      ? program.getSyntacticDiagnostics(source).length + program.getSemanticDiagnostics(source).length
      : null;
  });
}

const passes = (a: Attempt | undefined) => a !== undefined && a.file !== null && a.problems.length === 0;
const errorFree = (a: Attempt | undefined) => a !== undefined && a.file !== null && !a.problems.some((p) => p.severity === 2);
const final = (s: Sample) => s.fix ?? s.first;

// ----------------------------------------------------------------------------
// Generation: the Claude API (ANTHROPIC_API_KEY) or `claude -p` (the Claude Code login)

type Via = "api" | "claude";

/** A stop the person running this has to fix (a rejected key, no login); printed without a stack trace. */
class Fatal extends Error {}

interface Reply {
  text: string;
  stopReason: string | null;
  usage: Attempt["usage"];
  costUsd: number | null;
}

/** One conversation per sample: the task, then the lint report when there is one. */
interface Conversation {
  send(text: string): Promise<Reply>;
  close(): Promise<void>;
}

function apiConversation(client: Anthropic, run: Run, system: string): Conversation {
  const messages: Anthropic.MessageParam[] = [];
  return {
    async send(text) {
      messages.push({ role: "user", content: text });
      // No `fallbacks`: a reply from another model would be counted as this model's.
      const message = await client.messages
        .stream({
          model: run.model,
          max_tokens: 32000,
          thinking: { type: "adaptive" },
          output_config: { effort: run.effort },
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages,
        })
        .finalMessage()
        .catch(apiError(run));
      // Append-only: the reply goes back unchanged, thinking blocks included.
      messages.push({ role: "assistant", content: message.content });
      const u = message.usage;
      return {
        text: message.content.map((b) => (b.type === "text" ? b.text : "")).join("\n"),
        stopReason: message.stop_reason,
        usage: { input: u.input_tokens, output: u.output_tokens, cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0 },
        costUsd: null,
      };
    },
    async close() {},
  };
}

/** Errors that every later request would hit too stop the run; the rest stay with the sample. */
function apiError(run: Run) {
  return (error: unknown): never => {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Fatal("The API rejected ANTHROPIC_API_KEY (401). Check the key, or unset it to measure through `claude -p` instead.");
    }
    if (error instanceof Anthropic.PermissionDeniedError) {
      throw new Fatal(`The API key may not use ${run.model} (403). Use a key from a workspace that has access, or pass another --model.`);
    }
    if (error instanceof Anthropic.NotFoundError) throw new Fatal(`The API does not know the model ${run.model} (404). Check --model.`);
    if (error instanceof Anthropic.BadRequestError) throw new Fatal(`The API rejected the request (400): ${error.message}`);
    throw error;
  };
}

const NOT_LOGGED_IN =
  "Run `claude auth login` (or start `claude` and use /login), check it with `claude auth status`, then run this again. " +
  "To use the API instead, set ANTHROPIC_API_KEY.";

async function findClaude(): Promise<string> {
  const executable = (path: string) => access(path, constants.X_OK).then(() => true, () => false);
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  // Claude Code's local install, which a shell alias makes `claude`. It comes first
  // because an older global install often stays on PATH next to it.
  const local = join(homedir(), ".claude/local/claude");
  if (await executable(local)) return local;
  for (const dir of (process.env.PATH ?? "").split(":").filter(Boolean)) {
    if (await executable(join(dir, "claude"))) return join(dir, "claude");
  }
  throw new Fatal("Could not find the claude command. Install Claude Code, put it on PATH or set CLAUDE_BIN, or set ANTHROPIC_API_KEY to use the API.");
}

/**
 * `claude -p` in a new empty directory, so no CLAUDE.md, project memory or file is in
 * reach. --system-prompt replaces Claude Code's own system prompt, --tools "" removes
 * every tool, --safe-mode drops the user's customizations (CLAUDE.md, hooks, plugins,
 * output styles), and MCP servers and skills are off. Both turns go through stream-json
 * to one process, so the fix turn continues the same conversation.
 */
async function claudeConversation(bin: string, run: Run, system: string): Promise<Conversation> {
  const cwd = await mkdtemp(join(tmpdir(), "yourlib-ai-lint-"));
  // prettier-ignore
  const child = spawn(bin, [
    "-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
    "--system-prompt", system, "--tools", "", "--safe-mode", "--strict-mcp-config", "--disable-slash-commands",
    "--no-session-persistence", "--model", run.model, "--effort", run.effort,
  ], { cwd, stdio: ["pipe", "pipe", "pipe"] });

  let pending: { resolve: (reply: Reply) => void; reject: (error: unknown) => void } | null = null;
  let authFailed = false;
  let costSoFar = 0; // total_cost_usd is cumulative over the conversation; usage is per turn
  let stderr = "";
  const settle = (outcome: { reply: Reply } | { error: unknown }) => {
    const p = pending;
    pending = null;
    if (p && "reply" in outcome) p.resolve(outcome.reply);
    else if (p) p.reject((outcome as { error: unknown }).error);
  };
  child.stderr.on("data", (chunk) => (stderr = (stderr + chunk).slice(-2000)));
  child.stdin.on("error", () => {}); // a dead process is reported by "exit"
  child.on("error", (error: NodeJS.ErrnoException) =>
    settle({ error: error.code === "ENOENT" ? new Fatal(`Could not run ${bin}. Set CLAUDE_BIN to the claude command.`) : error }),
  );
  child.on("exit", (code) => settle({ error: new Error(`claude exited (${code}) before replying: ${stderr.trim().slice(-300) || "no output"}`) }));

  createInterface({ input: child.stdout }).on("line", (line) => {
    let event: { type?: string; error?: string; is_error?: boolean; result?: string; stop_reason?: string; total_cost_usd?: number; usage?: Record<string, number> };
    try {
      event = JSON.parse(line);
    } catch {
      return;
    }
    if (event.type === "assistant" && event.error === "authentication_failed") authFailed = true;
    if (event.type !== "result") return;
    if (event.is_error) {
      const message = String(event.result ?? "unknown error");
      if (authFailed) settle({ error: new Fatal(`Claude Code is not logged in ("${message}"). ${NOT_LOGGED_IN}`) });
      // A rejected request (an old Claude Code, an unknown model) fails the same way for every sample.
      else if (/API Error: 4(00|01|03|04)\b/.test(message)) settle({ error: new Fatal(`claude -p (${bin}) failed: ${message} Set CLAUDE_BIN to use another claude.`) });
      else settle({ error: new Error(`claude -p: ${message}`) });
      return;
    }
    const u = event.usage ?? {};
    const costUsd = typeof event.total_cost_usd === "number" ? event.total_cost_usd - costSoFar : null;
    costSoFar = event.total_cost_usd ?? costSoFar;
    settle({
      reply: {
        text: String(event.result ?? ""),
        stopReason: event.stop_reason ?? null,
        usage: { input: u.input_tokens ?? 0, output: u.output_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0 },
        costUsd,
      },
    });
  });

  return {
    send(text) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          settle({ error: new Error("claude -p did not reply within 10 minutes") });
          child.kill();
        }, 10 * 60 * 1000);
        pending = {
          resolve: (reply) => (clearTimeout(timer), resolve(reply)),
          reject: (error) => (clearTimeout(timer), reject(error)),
        };
        child.stdin.write(`${JSON.stringify({ type: "user", message: { role: "user", content: text } })}\n`);
      });
    },
    async close() {
      child.stdin.end();
      if (child.exitCode === null && child.signalCode === null) await new Promise((done) => child.once("exit", done));
      await rm(cwd, { recursive: true, force: true });
    },
  };
}

function extractCode(text: string): string | null {
  const blocks = [...text.matchAll(/```(?:tsx|jsx|typescript|ts)?[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.sort((a, b) => b.length - a.length)[0] ?? null;
}

async function save(reply: Reply, runDir: string, file: string): Promise<Attempt> {
  const code = extractCode(reply.text);
  if (code !== null) await writeFile(join(runDir, file), code);
  return {
    file: code === null ? null : file,
    stopReason: reply.stopReason,
    usage: reply.usage,
    costUsd: reply.costUsd,
    problems: [],
    yourlibElements: 0,
    skillSignals: [],
    typeErrors: null,
  };
}

async function runSample(run: Run, runDir: string, sample: Sample, conversation: Conversation): Promise<void> {
  const task = run.tasks.find((t) => t.id === sample.task)!;
  const base = `${sample.condition}/${task.id}${run.trials > 1 ? `.t${sample.trial}` : ""}`;
  try {
    const first = await conversation.send(task.prompt);
    sample.first = await save(first, runDir, `${base}.tsx`);
    await lint(sample.first, runDir);
    if (passes(sample.first) || first.stopReason === "refusal") return;

    const fixed = await conversation.send(fixPrompt(sample.first));
    sample.fix = await save(fixed, runDir, `${base}.fix.tsx`);
    await lint(sample.fix, runDir);
  } finally {
    await conversation.close();
  }
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

// ----------------------------------------------------------------------------
// Report

const LABEL: Record<Condition, string> = { A: "A: llms.txt と SKILL.md を渡す", B: "B: 何も渡さない" };
const RULES = [...Object.keys(plugin.rules).map((r) => `yourlib/${r}`), "parse-error"];

function ratio(n: number, total: number): string {
  return total === 0 ? "—" : `${n}/${total}（${Math.round((n / total) * 100)}%）`;
}

function count<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

function breakdown(a: Attempt): string {
  if (a.file === null) return a.stopReason === "refusal" ? "応答を拒否" : "コードなし";
  if (a.problems.length === 0) return "0 件";
  const byRule = new Map<string, number>();
  for (const p of a.problems) byRule.set(p.rule, (byRule.get(p.rule) ?? 0) + 1);
  const detail = [...byRule].map(([r, n]) => `${r.replace("yourlib/", "")} ${n}`).join("・");
  return `${a.problems.length} 件（${detail}）`;
}

function cell(samples: Sample[], column: "first" | "final", trials: number): string {
  const measured = samples.filter((s) => s.first);
  if (measured.length === 0) return samples.some((s) => s.error) ? "エラー" : "—";
  const pick = column === "first" ? (s: Sample) => s.first : final;
  if (trials === 1) {
    const s = measured[0];
    return column === "final" && !s.fix ? "—" : breakdown(pick(s)!);
  }
  const total = measured.reduce((n, s) => n + (pick(s)?.problems.length ?? 0), 0);
  const noCode = count(measured, (s) => pick(s)?.file === null);
  return `${count(measured, (s) => passes(pick(s)))}/${measured.length} 回 0 件（計 ${total} 件${noCode ? `、コードなし ${noCode} 回` : ""}）`;
}

function render(run: Run, runDir: string, reportPath: string): string {
  const conditions = (["A", "B"] as const).filter((c) => run.samples.some((s) => s.condition === c));
  const of = (c: Condition) => run.samples.filter((s) => s.condition === c && s.first);
  const date = run.id.slice(0, 10);
  const lines: string[] = [];

  lines.push(
    "## 結果",
    "",
    `${date} に ${run.client ?? "Claude API"} で計測。モデルは \`${run.model}\`（effort: ${run.effort}）、課題 ${run.tasks.length} 個 × 各 ${run.trials} 回。` +
      `渡した資料は llms.txt \`${run.docs.llms}\`・SKILL.md \`${run.docs.skill}\`（sha256 の先頭）。` +
      `出力したファイルは [\`${relative(root, runDir)}/\`](${relative(dirname(reportPath), runDir)}/)。`,
    "",
    "| 条件 | 件数 | 1 回目で lint 0 件 | 1 回目で error 0 件 | 1 回直したあと lint 0 件 | 型エラー 0 件（1 回目 → 直したあと） | yourlib の部品の数（1 回目の平均） |",
    "|---|---|---|---|---|---|---|",
  );
  for (const c of conditions) {
    const samples = of(c);
    const n = samples.length;
    const typed = (pick: (s: Sample) => Attempt | undefined) => count(samples, (s) => pick(s)?.typeErrors === 0);
    const elements = n === 0 ? 0 : samples.reduce((sum, s) => sum + s.first!.yourlibElements, 0) / n;
    lines.push(
      `| ${LABEL[c]} | ${n} | **${ratio(count(samples, (s) => passes(s.first)), n)}** | ${ratio(count(samples, (s) => errorFree(s.first)), n)} | ` +
        `**${ratio(count(samples, (s) => passes(final(s))), n)}** | ${ratio(typed((s) => s.first), n)} → ${ratio(typed(final), n)} | ${elements.toFixed(1)} |`,
    );
  }

  if (conditions.includes("B")) {
    const leaked = of("B").filter((s) => s.first!.skillSignals?.length);
    lines.push(
      "",
      `条件 B の 1 回目で、SKILL.md にしか書いていない書き方（Trigger の \`dialog=\` などで id を指す、\`var(--yl-…)\`、\`data-pack\`、\`YourlibRuntime\`、Card の \`headingLevel\`、Badge の \`tone\`）が出たのは ${ratio(leaked.length, of("B").length)}` +
        (leaked.length ? `: ${leaked.map((s) => `${s.task}（${s.first!.skillSignals!.join("・")}）`).join("、")}。` : "。"),
    );
  }

  lines.push("", "### ルールごとの件数", "", `| ルール | ${conditions.map((c) => `${c} 1 回目 | ${c} 直したあと`).join(" | ")} |`, `|---|${conditions.map(() => "---|---|").join("")}`);
  for (const rule of RULES) {
    const counts = conditions.flatMap((c) =>
      [(s: Sample) => s.first, final].map((pick) => of(c).reduce((n, s) => n + (pick(s)?.problems.filter((p) => p.rule === rule).length ?? 0), 0)),
    );
    const name = rule === "parse-error" ? "構文エラー（parse）" : `\`${rule.replace("yourlib/", "")}\``;
    lines.push(`| ${name} | ${counts.join(" | ")} |`);
  }
  const noCode = conditions.flatMap((c) => [(s: Sample) => s.first, final].map((pick) => count(of(c), (s) => pick(s)?.file === null)));
  lines.push(`| コードが返ってこない | ${noCode.join(" | ")} |`);

  lines.push("", "### 課題ごと", "", `| 課題 | ${conditions.map((c) => `${c} 1 回目 | ${c} 直したあと`).join(" | ")} |`, `|---|${conditions.map(() => "---|---|").join("")}`);
  for (const task of run.tasks) {
    const cells = conditions.flatMap((c) => {
      const samples = run.samples.filter((s) => s.condition === c && s.task === task.id);
      return [cell(samples, "first", run.trials), cell(samples, "final", run.trials)];
    });
    lines.push(`| ${task.id.slice(0, 2)} ${task.title} | ${cells.join(" | ")} |`);
  }
  if (run.trials === 1) lines.push("", "「直したあと」の — は、1 回目で 0 件だったので直させていないもの。");

  const attempts = run.samples.flatMap((s) => [s.first, s.fix]).filter((a): a is Attempt => a !== undefined);
  const sum = (key: keyof Attempt["usage"]) => attempts.reduce((n, a) => n + a.usage[key], 0).toLocaleString("en-US");
  const costs = attempts.map((a) => a.costUsd).filter((c): c is number => typeof c === "number");
  lines.push(
    "",
    `呼び出しは ${attempts.length} 回。入力 ${sum("input")} トークン（ほかにキャッシュの書き込み ${sum("cacheWrite")}、読み込み ${sum("cacheRead")}）、出力 ${sum("output")} トークン（思考を含む）。` +
      (costs.length ? `Claude Code が示した費用の目安は合計 $${costs.reduce((a, b) => a + b, 0).toFixed(2)}。` : ""),
  );
  const failed = run.samples.filter((s) => s.error);
  if (failed.length) {
    lines.push("", `エラーで測れなかったもの（件数から除いた）: ${failed.map((s) => `${s.condition} ${s.task}（${s.error}）`).join("、")}`);
  }
  return lines.join("\n");
}

/** Replaces what is between the results markers, leaving the rest of the page alone. */
async function writeReport(path: string, results: string): Promise<void> {
  const doc = await readFile(path, "utf8");
  const start = "<!-- results:start -->";
  const end = "<!-- results:end -->";
  const [before, rest] = doc.split(start);
  if (rest === undefined || !rest.includes(end)) throw new Error(`${relative(root, path)} needs ${start} and ${end}`);
  await writeFile(path, `${before}${start}\n${results}\n${end}${rest.split(end)[1]}`);
}

// ----------------------------------------------------------------------------

async function finish(run: Run, runDir: string): Promise<void> {
  typecheck(run, runDir);
  await writeFile(join(runDir, "summary.json"), `${JSON.stringify(run, null, 2)}\n`);
  const reportPath = resolve(root, args.report!);
  const results = render(run, runDir, reportPath);
  await writeReport(reportPath, results);
  console.log(`${results}\n\nwrote ${relative(root, join(runDir, "summary.json"))} and ${relative(root, reportPath)}`);
}

async function main(): Promise<void> {
  if (args.rescore) {
    const runDir = resolve(root, args.rescore);
    const run = JSON.parse(await readFile(join(runDir, "summary.json"), "utf8")) as Run;
    for (const s of run.samples) for (const a of [s.first, s.fix]) if (a) await lint(a, runDir);
    await finish(run, runDir);
    return;
  }

  const trials = Number(args.trials);
  const concurrency = Number(args.concurrency);
  const conditions = args.conditions!.split(",").map((c) => c.trim().toUpperCase()) as Condition[];
  const efforts: Effort[] = ["low", "medium", "high", "xhigh", "max"];
  const via = (args.via ?? (process.env.ANTHROPIC_API_KEY ? "api" : "claude")) as Via;
  if (!Number.isInteger(trials) || trials < 1) throw new Fatal("--trials must be a positive integer");
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Fatal("--concurrency must be a positive integer");
  if (conditions.some((c) => c !== "A" && c !== "B")) throw new Fatal("--conditions takes A, B or A,B");
  if (!efforts.includes(args.effort as Effort)) throw new Fatal(`--effort takes ${efforts.join(", ")}`);
  if (via !== "api" && via !== "claude") throw new Fatal("--via takes api or claude");

  const [llms, skill] = await Promise.all([readFile(join(root, "generated/llms.txt"), "utf8"), readFile(join(root, "generated/SKILL.md"), "utf8")]);
  const hash = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 12);
  const tasks = await loadTasks(args.tasks);
  const run: Run = {
    id: new Date().toISOString().replace(/:/g, "-").replace(/\.\d+Z$/, "Z"),
    via,
    client: "Claude API",
    model: args.model!,
    effort: args.effort as Effort,
    trials,
    docs: { llms: hash(llms), skill: hash(skill) },
    tasks,
    samples: conditions.flatMap((condition) =>
      tasks.flatMap((task) => Array.from({ length: trials }, (_, i) => ({ task: task.id, condition, trial: i + 1 }))),
    ),
  };
  const systems: Record<Condition, string> = { A: systemPrompt("A", { llms, skill }), B: systemPrompt("B", { llms, skill }) };

  if (args["dry-run"]) {
    console.log(`${run.samples.length} samples (${tasks.length} tasks × ${conditions.join(",")} × ${trials}), up to ${run.samples.length * 2} requests to ${run.model} (effort: ${run.effort}) via ${via === "api" ? "the Claude API" : "claude -p"}`);
    for (const c of conditions) console.log(`system prompt ${c}: ${systems[c].length} characters`);
    for (const t of tasks) console.log(`  ${t.id}  ${t.title}  (${t.prompt.length} characters)`);
    console.log(`\n--- system prompt B ---\n${systems.B}\n\n--- ${tasks[0].id} ---\n${tasks[0].prompt}`);
    return;
  }

  let open: (system: string) => Promise<Conversation>;
  if (via === "api") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Fatal("--via api needs ANTHROPIC_API_KEY. Set it, or drop --via to measure through `claude -p` with the Claude Code login.");
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });
    open = async (system) => apiConversation(client, run, system);
  } else {
    const bin = await findClaude();
    const version = await new Promise<string>((done, fail) =>
      execFile(bin, ["--version"], (error, stdout) => (error ? fail(new Fatal(`Could not run ${bin} (${error.message}). Set CLAUDE_BIN to the claude command.`)) : done(stdout.trim()))),
    );
    run.client = `claude -p（${version}）`;
    open = (system) => claudeConversation(bin, run, system);
  }

  const runDir = resolve(root, args.out!, run.id);
  for (const c of conditions) await mkdir(join(runDir, c), { recursive: true });
  console.log(`${run.samples.length} samples via ${run.client} → ${relative(root, runDir)}`);

  let done = 0;
  let fatal: Fatal | null = null;
  await pool(run.samples, concurrency, async (sample) => {
    if (fatal) return;
    try {
      await runSample(run, runDir, sample, await open(systems[sample.condition]));
    } catch (error) {
      if (error instanceof Fatal) {
        fatal ??= error;
        return;
      }
      sample.error = error instanceof Error ? error.message.slice(0, 200) : String(error);
    }
    done++;
    const status = sample.error ? `error: ${sample.error}` : `${breakdown(sample.first!)}${sample.fix ? ` → ${breakdown(sample.fix)}` : ""}`;
    console.log(`[${done}/${run.samples.length}] ${sample.condition} ${sample.task}${trials > 1 ? ` #${sample.trial}` : ""}: ${status}`);
    await writeFile(join(runDir, "summary.json"), `${JSON.stringify(run, null, 2)}\n`);
  });
  const measured = run.samples.some((s) => s.first);
  if (!measured) await rm(runDir, { recursive: true, force: true });
  if (fatal) throw fatal;
  if (!measured) {
    throw new Fatal(`No sample could be measured, so the report was left as it was. First error: ${run.samples.find((s) => s.error)?.error}`);
  }
  await finish(run, runDir);
}

try {
  await main();
} catch (error) {
  if (!(error instanceof Fatal)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}

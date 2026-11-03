import { relative, resolve, dirname } from "node:path";
import { ESLint } from "eslint";
import ts from "typescript";
import tseslint from "typescript-eslint";
import urushi from "@urushi/eslint-plugin";
import { relatedContracts } from "./catalog.ts";

export interface Issue {
  source: "contract" | "typescript" | "configuration";
  severity: "error" | "warning";
  code: string;
  file?: string;
  line?: number;
  column?: number;
  message: string;
  excerpt?: string;
}

/** Read-only, offline gate for an AI's edit/recheck loop. No project ESLint code is executed. */
export async function check(cwd: string, opts: { project?: string; strict?: boolean } = {}) {
  const issues: Issue[] = [];
  const path = opts.project ? resolve(cwd, opts.project) : ts.findConfigFile(cwd, ts.sys.fileExists);
  const addTypeIssue = (d: ts.Diagnostic) => {
    const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : undefined;
    issues.push({
      source: d.file ? "typescript" : "configuration",
      severity: d.category === ts.DiagnosticCategory.Warning ? "warning" : "error",
      code: `TS${d.code}`,
      ...(d.file ? { file: relative(cwd, d.file.fileName) } : {}),
      ...(pos ? { line: pos.line + 1, column: pos.character + 1, excerpt: d.file!.text.split(/\r?\n/)[pos.line] } : {}),
      message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
    });
  };
  let lintedFiles = 0;
  let typechecked = false;
  if (!path) {
    issues.push({ source: "configuration", severity: "error", code: "missing-tsconfig", message: "No tsconfig.json found. Pass --project <path> to check a TypeScript project." });
  } else {
    const config = ts.readConfigFile(path, ts.sys.readFile);
    if (config.error) addTypeIssue(config.error);
    else {
      const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(path), undefined, path);
      parsed.errors.forEach(addTypeIssue);
      if (!parsed.errors.length) {
        const program = ts.createProgram({ rootNames: parsed.fileNames, options: { ...parsed.options, noEmit: true, incremental: false }, projectReferences: parsed.projectReferences });
        ts.getPreEmitDiagnostics(program).forEach(addTypeIssue);
        typechecked = true;
        const files = parsed.fileNames.filter((f) => /\.[cm]?[jt]sx?$/.test(f) && !/\.d\.[cm]?ts$/.test(f) && !/[\\/]node_modules[\\/]/.test(f));
        const eslint = new ESLint({
          cwd: dirname(path), overrideConfigFile: true, ignore: false,
          overrideConfig: [{
            ...urushi.configs.recommended,
            files: ["**/*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}"],
            languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
            linterOptions: { noInlineConfig: true },
          }],
        });
        for (const file of files.sort()) {
          const source = ts.sys.readFile(file);
          if (source === undefined) {
            issues.push({ source: "configuration", severity: "error", code: "unreadable-source", file: relative(cwd, file), message: "Could not read an included source file." });
            continue;
          }
          // lintText cannot import a user's configuration or execute their application.
          const results = await eslint.lintText(source, { filePath: file });
          if (!results.length || results.some((result) => result.messages.some((m) => !m.ruleId && !m.fatal && m.line === undefined))) {
            issues.push({ source: "configuration", severity: "error", code: "unchecked-source", file: relative(cwd, file), message: "This source is outside the lint scope. Put tsconfig.json at the common root of the UI source and run check again." });
            continue;
          }
          lintedFiles++;
          for (const result of results) for (const m of result.messages) {
            issues.push({ source: "contract", severity: m.severity === 2 ? "error" : "warning", code: m.ruleId ?? "parse-error",
              file: relative(cwd, file), line: m.line, column: m.column, message: m.message,
              excerpt: source.split(/\r?\n/)[m.line - 1] });
          }
        }
        if (!lintedFiles) issues.push({ source: "configuration", severity: "error", code: "no-source-files", message: "No application source files were checked. Include the UI source in the selected tsconfig.json." });
      }
    }
  }
  issues.sort((a, b) => (a.file ?? "").localeCompare(b.file ?? "") || (a.line ?? 0) - (b.line ?? 0) || (a.column ?? 0) - (b.column ?? 0) || a.code.localeCompare(b.code));
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.length - errors;
  return {
    schemaVersion: 1,
    status: errors || (opts.strict && warnings) ? "fail" as const : "pass" as const,
    project: path ? relative(cwd, path) : null,
    summary: { errors, warnings, lintedFiles, typechecked },
    issues,
    contracts: relatedContracts(issues.map((i) => i.message)),
    notChecked: ["rendered layout", "browser interaction", "screen reader behavior", "dynamic values and cross-file ID references"],
  };
}

export function formatCheck(report: Awaited<ReturnType<typeof check>>): string {
  const lines = [`urushi check: ${report.status.toUpperCase()} — ${report.summary.errors} error(s), ${report.summary.warnings} warning(s), ${report.summary.lintedFiles} file(s)`];
  for (const issue of report.issues) {
    lines.push("", `${issue.file ?? "configuration"}${issue.line ? `:${issue.line}:${issue.column}` : ""} [${issue.code}]`, issue.message);
    if (issue.excerpt) lines.push(`  ${issue.excerpt.trim()}`);
  }
  lines.push("", "Not checked: " + report.notChecked.join(", ") + ".");
  return lines.join("\n");
}

import { initialProjects, owners, statusLabels, type Project } from "../../studio/src/model.ts";
import { projectErrors } from "../../studio/src/validation.ts";

export { owners, statusLabels, projectErrors, type Project };
export const STUDIO_STORAGE_KEY = "urushi-example-studio-v1";
export interface StudioWorkspace {
  version: 1;
  name: string;
  showCompleted: boolean;
  projects: Project[];
}

const descriptions: Record<string, string> = {
  "PRJ-001": "訪問者が製品を理解しやすいように、サイトの構成とデザインを見直します。",
  "PRJ-010": "必要なプロジェクトを素早く見つけられるように、検索を改善します。",
};
export function createStudioWorkspace(): StudioWorkspace {
  return { version: 1, name: "Forma Studio", showCompleted: true, projects: initialProjects.map(project => ({ ...project, description: descriptions[project.id] ?? project.description })) };
}

/** Reject malformed or future-version data without silently replacing it. */
export function parseStudioWorkspace(raw: string): StudioWorkspace {
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object") throw new Error("Invalid workspace");
  const workspace = data as StudioWorkspace;
  if (workspace.version !== 1 || typeof workspace.name !== "string" || !workspace.name.trim() || workspace.name.length > 60 || typeof workspace.showCompleted !== "boolean" || !Array.isArray(workspace.projects) || workspace.projects.length > 500) throw new Error("Invalid workspace");
  const ids = new Set<string>();
  for (const row of workspace.projects) {
    if (!row || typeof row !== "object" || typeof row.id !== "string" || !/^[\w-]{1,80}$/.test(row.id) || ids.has(row.id) || typeof row.name !== "string" || typeof row.description !== "string" || typeof row.due !== "string" || !Object.hasOwn(statusLabels, row.status) || !Number.isInteger(row.revision) || row.revision < 0 || Object.keys(projectErrors(row)).length) throw new Error("Invalid project");
    ids.add(row.id);
  }
  return workspace;
}

export const studioComponents = [
  ["DataTable", "data-table"], ["Checkbox", "checkbox"], ["Combobox", "combobox"], ["DatePicker", "date-picker"],
  ["Command", "command"], ["Sheet", "sheet"], ["AlertDialog", "alert-dialog"],
  ["Button", "button"], ["Input", "input"], ["Textarea", "textarea"], ["Field", "field"],
  ["Select", "select"], ["Tabs", "tabs"], ["Card", "card"], ["Badge", "badge"],
  ["Avatar", "avatar"], ["Progress", "progress"], ["Switch", "switch"],
  ["Menu", "menu"], ["Empty", "empty"], ["Alert", "alert"], ["Skeleton", "skeleton"],
] as const;

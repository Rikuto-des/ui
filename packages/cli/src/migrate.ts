import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

/**
 * `urushi migrate shadcn`: finds the shadcn/ui components a project imports
 * and reports the Urushi component for each, with what changes in its API.
 * It only reads: moving one screen at a time is the user's (or an agent's)
 * edit, checked afterwards with `urushi check`.
 */
export interface MigrationNote {
  urushi: string | null;
  note: string;
}

/** shadcn/ui file name → the Urushi component and the main API difference. */
export const SHADCN: Record<string, MigrationNote> = {
  accordion: { urushi: "accordion", note: "Accordion.Item takes title; there is no Trigger/Content pair. Built on <details name>." },
  alert: { urushi: "alert", note: "title prop and tone (neutral|accent|ok|warning|danger) instead of AlertTitle/AlertDescription and variant." },
  "alert-dialog": { urushi: "alert-dialog", note: "Give it an id; AlertDialog.Trigger alertDialog={id}. No open state is needed." },
  "aspect-ratio": { urushi: "aspect-ratio", note: "Same idea; ratio is a number." },
  avatar: { urushi: "avatar", note: "name and src props; the initials fallback is automatic." },
  badge: { urushi: "badge", note: "tone instead of variant (destructive → danger)." },
  breadcrumb: { urushi: "breadcrumb", note: "Breadcrumb.Item href / current; separators are drawn by CSS." },
  button: { urushi: "button", note: "variant: default → primary, destructive → danger, outline → secondary, link → use Link. asChild is not supported: style an <a> with Link." },
  "button-group": { urushi: "button-group", note: "label prop names the group." },
  calendar: { urushi: "calendar", note: "ISO date strings (YYYY-MM-DD) instead of Date objects; min/max instead of disabled matchers." },
  card: { urushi: "card", note: "title, description and footer props instead of CardHeader/CardTitle/CardFooter." },
  carousel: { urushi: "carousel", note: "Scroll snapping; no Embla API." },
  chart: { urushi: "chart", note: "labels and series props instead of Recharts children; the numbers are also a table." },
  checkbox: { urushi: "checkbox", note: "A native checkbox: checked/defaultChecked and onChange; the label is its children." },
  collapsible: { urushi: "collapsible", note: "Built on <details>; title prop." },
  combobox: { urushi: "combobox", note: "One component with options instead of Popover + Command." },
  command: { urushi: "command", note: "Command takes items; no cmdk dependency." },
  "context-menu": { urushi: "context-menu", note: "ContextMenu id + ContextMenu.Area menu={id}; items are Menu.Item." },
  "data-table": { urushi: "data-table", note: "rows, columns and getRowId instead of TanStack Table setup." },
  "date-picker": { urushi: "date-picker", note: "One component with an ISO value instead of Popover + Calendar." },
  dialog: { urushi: "dialog", note: "Give it an id; Dialog.Trigger dialog={id}, Dialog.Close dialog={id}. title is required. No open state is needed." },
  drawer: { urushi: "drawer", note: "A bottom Sheet with a handle; no vaul dependency. Drawer.Trigger drawer={id}." },
  "dropdown-menu": { urushi: "menu", note: "Menu id + Menu.Trigger menu={id}; items are Menu.Item, Menu.Link and Menu.Sub." },
  empty: { urushi: "empty", note: "title, description, action and icon props." },
  field: { urushi: "field", note: "Field id label description error wraps one control and wires its ids." },
  form: { urushi: "form", note: "Native constraints (required, type, min, pattern) instead of react-hook-form + zod; errors appear in Fields and a summary." },
  "hover-card": { urushi: "hover-card", note: "HoverCard.Trigger hoverCard={id} on a link; opens on hover and focus." },
  input: { urushi: "input", note: "Put it in a Field for its label." },
  "input-group": { urushi: "input-group", note: "Same idea; InputGroup.Addon for text and buttons." },
  "input-otp": { urushi: "otp-input", note: "One native input drawn as boxes; length prop." },
  item: { urushi: "item", note: "Item title description icon action href inside Item.Group." },
  kbd: { urushi: "kbd", note: "Same." },
  label: { urushi: "field", note: "No separate Label: Field's label prop renders and links it." },
  menubar: { urushi: "menubar", note: "Menubar label + Menubar.Menu label; items are Menu.Item." },
  "native-select": { urushi: "select", note: "Urushi's Select is the native <select>." },
  "navigation-menu": { urushi: "navigation-menu", note: "NavigationMenu.Group and NavigationMenu.Link; hover and keyboard come from the runtime." },
  pagination: { urushi: "pagination", note: "Links built from a URL pattern." },
  popover: { urushi: "popover", note: "Popover id + Popover.Trigger popover={id}; native popover and anchor positioning." },
  progress: { urushi: "progress", note: "label is required; omit value for an indeterminate bar." },
  "radio-group": { urushi: "radio-group", note: "A fieldset: name and legend are required; RadioGroup.Item value." },
  resizable: { urushi: "resizable", note: "Two panes: Resizable.Panel, Resizable.Handle label, Resizable.Panel." },
  "scroll-area": { urushi: "scroll-area", note: "A focusable named region with native scrolling." },
  select: { urushi: "select", note: "The native <select> with <option>s instead of SelectTrigger/SelectContent/SelectItem." },
  separator: { urushi: "separator", note: "Same; decorative hides it from screen readers." },
  sheet: { urushi: "sheet", note: "Sheet id side + Sheet.Trigger sheet={id}." },
  sidebar: { urushi: "sidebar", note: "Sidebar label, Sidebar.Group, Sidebar.Item href current; no SidebarProvider." },
  skeleton: { urushi: "skeleton", note: "Same." },
  slider: { urushi: "slider", note: "A native range input: min, max, step, value; one thumb." },
  sonner: { urushi: "toast", note: "toast() from @urushi/core and <Toaster /> from @urushi/react; no sonner dependency." },
  spinner: { urushi: "spinner", note: "label is required." },
  switch: { urushi: "switch", note: "A native checkbox with role=switch: checked/onChange; the label is its children." },
  table: { urushi: "table", note: "Table caption + plain thead/tbody/tr/th/td." },
  tabs: { urushi: "tabs", note: "Tabs id label, Tabs.List, Tabs.Tab value, Tabs.Panel value." },
  textarea: { urushi: "textarea", note: "Grows with its content where field-sizing is supported." },
  toggle: { urushi: "toggle", note: "A native checkbox drawn as a button." },
  "toggle-group": { urushi: "toggle-group", note: "Radios (type=single) or checkboxes (type=multiple) with a legend." },
  tooltip: { urushi: "tooltip", note: "Tooltip id + Tooltip.Trigger tooltip={id}; a hint, not a replacement for a button's name." },
  typography: { urushi: null, note: "No component: headings and text take the pack's type scale." },
};

export interface MigrationUse {
  file: string;
  line: number;
  shadcn: string;
  names: string[];
  urushi: string | null;
  note: string;
}

const SOURCE = /\.(tsx|jsx|ts|js)$/;
const SKIP = new Set(["node_modules", ".next", "dist", "build", "out", ".git", ".urushi"]);

async function* files(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (SOURCE.test(entry.name)) yield path;
  }
}

/** The import prefix of the project's shadcn components, from components.json when there is one. */
async function uiAlias(cwd: string) {
  const path = join(cwd, "components.json");
  if (!existsSync(path)) return "@/components/ui";
  const config = JSON.parse(await readFile(path, "utf8")) as { aliases?: { ui?: string; components?: string } };
  return config.aliases?.ui ?? (config.aliases?.components ? `${config.aliases.components}/ui` : "@/components/ui");
}

export async function migrateShadcn(cwd: string) {
  const alias = await uiAlias(cwd);
  const pattern = new RegExp(`import\\s*(?:type\\s*)?\\{([^}]*)\\}\\s*from\\s*["']${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([a-z0-9-]+)["']`, "g");
  const uses: MigrationUse[] = [];
  for await (const path of files(cwd)) {
    // The shadcn sources themselves are what is being replaced.
    const file = relative(cwd, path);
    if (file.split("/").includes("ui") && file.includes("components")) continue;
    const text = await readFile(path, "utf8");
    for (const match of text.matchAll(pattern)) {
      const line = text.slice(0, match.index).split("\n").length;
      const names = match[1].split(",").map((n) => n.trim().replace(/^type\s+/, "")).filter(Boolean);
      const known = SHADCN[match[2]];
      uses.push({ file, line, shadcn: match[2], names, urushi: known?.urushi ?? null, note: known?.note ?? "No Urushi equivalent; keep it or rebuild it from Urushi parts." });
    }
  }
  uses.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const add = [...new Set(uses.map((u) => u.urushi).filter((u): u is string => Boolean(u)))].sort();
  return { alias, uses, add };
}

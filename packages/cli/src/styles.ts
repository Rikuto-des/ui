import postcss from "postcss";

export interface StyleContract { name: string; parts: { slot: string }[]; styleDependencies?: string[] }

/** Select by component contract, never by a DOM snapshot: all states and media rules survive. */
export function selectStyles(source: string, names: string[], contracts: StyleContract[]): string {
  if (!names.length) throw new Error("css needs at least one component name");
  const selected = new Set<string>();
  // Shared accessibility mechanics must survive for internal labels in any component.
  const slots = new Set<string>(["visually-hidden"]);
  function include(name: string) {
    if (selected.has(name)) return;
    const contract = contracts.find(c => c.name === name);
    if (!contract) throw new Error(`Unknown CSS component: ${name}`);
    selected.add(name);
    for (const part of contract.parts) slots.add(part.slot);
    for (const dependency of contract.styleDependencies ?? []) include(dependency);
  }
  names.forEach(include);
  const root = postcss.parse(source);
  root.walkComments(comment => { if (!comment.text.startsWith("!")) comment.remove(); });
  root.walkRules(rule => {
    // Keep a whole compound selector if it mentions any selected slot. This
    // deliberately retains shared :is/:has rules instead of rewriting their semantics.
    const selectors = rule.selectors.filter(selector => {
      const referenced = [...selector.matchAll(/\[data-slot\s*~?=\s*["']([^"']+)["']\]/g)].map(m => m[1]);
      return !referenced.length || referenced.some(slot => [...slots].some(s => slot === s || slot.startsWith(s + "-")));
    });
    if (selectors.length) rule.selectors = selectors;
    else rule.remove();
  });
  // Remove empty conditional/layer blocks, but preserve layer-order statements.
  function prune() {
    let removed = false;
    root.walkAtRules(rule => { if (rule.nodes?.length === 0) { rule.remove(); removed = true; } });
    if (removed) prune();
  }
  prune();
  return root.toString().trim() + "\n";
}

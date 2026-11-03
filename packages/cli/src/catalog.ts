import catalog from "./catalog.generated.json" with { type: "json" };
import guidance from "./guidance.generated.json" with { type: "json" };

/** Generated from exactly the contracts used by the components and lint rules. */
export function describe(name: string) {
  const contract = catalog.find((c) => c.name === name || c.parts.some((p) => p.jsx === name));
  if (!contract) throw new Error(`Unknown component ${JSON.stringify(name)}. Available: ${catalog.map((c) => c.name).join(", ")}`);
  return contract;
}

export function relatedContracts(messages: string[]) {
  const names = new Set(messages.flatMap((message) => [...message.matchAll(/<([A-Z][\w.]*)\b/g)].map((m) => m[1])));
  return catalog.filter((c) => c.parts.some((p) => names.has(p.jsx)));
}

/** Complete, offline authoring context: API contracts alone omit system-wide styling rules. */
export function context(names: string[], options: { compact?: boolean } = {}) {
  if (!names.length) throw new Error("context needs at least one component name");
  const contracts = [...new Map(names.map((name) => {
    const contract = describe(name);
    return [contract.name, contract] as const;
  })).values()];
  const requestedTokens = new Set(contracts.flatMap(c => c.tokens).map(name => '--ur-' + name.replaceAll('.', '-')));
  const tokens = options.compact ? guidance.tokens.filter(t => ['color', 'space', 'font'].includes(t.group) || requestedTokens.has(t.name)) : guidance.tokens;
  return { schemaVersion: 1, instructions: guidance.instructions, tokens, ...(options.compact ? { tokenScope: "Common colors, spacing and type plus the requested contracts' tokens. Run context without --compact for the complete token catalog. Contracts and authoring rules are unchanged." } : {}), styles: { components: contracts.map(c => `@urushi/react/styles/${c.name}.css`), pack: "Import @urushi/packs/<pack>.css once. Keep public pack tokens. Use urushi css <components...> to emit a deduplicated combined stylesheet." }, contracts };
}

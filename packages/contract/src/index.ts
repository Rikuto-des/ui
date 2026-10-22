import { z } from "zod";

export { z };

/**
 * className overrides a part allows. Anything outside these categories is
 * treated as a visual override and rejected by the lint plugin — visuals
 * belong to packs and variants, not to call sites.
 */
export const overrideCategories = [
  "margin",
  "width",
  "height",
  "layout",
  "position",
] as const;
export type OverrideCategory = (typeof overrideCategories)[number];

export type Tier = 1 | 2 | 3;

export type Rendering = "server" | "client" | { uncontrolled: "server"; controlled: "client" };

export interface PartSpec {
  /** JSX name as written at call sites, e.g. "Dialog" or "Dialog.Trigger". */
  jsx: string;
  /** Value of the data-slot attribute the part renders. */
  slot: string;
  /** Native element the part renders. */
  element: string;
  description: string;
  props: z.ZodObject;
  overrides: readonly OverrideCategory[];
}

export interface ContractInput {
  name: string;
  tier: Tier;
  summary: string;
  use: string[];
  avoid: { case: string; instead: string }[];
  rendering: Rendering;
  platform: {
    requires: string[];
    enhances?: { feature: string; fallback: string }[];
  };
  parts: PartSpec[];
  states: string[];
  a11y: {
    apg?: string;
    keyboard?: Record<string, string>;
    focus?: { initial?: string; restore?: string };
    rules: string[];
  };
  tokens: string[];
  examples: { title: string; code: string }[];
}

export interface Contract extends ContractInput {
  readonly __contract: true;
}

const nameRe = /^[a-z][a-z0-9-]*$/;
const slotRe = /^[a-z][a-z0-9-]*$/;

export function defineContract(input: ContractInput): Contract {
  if (!nameRe.test(input.name)) throw new Error(`contract name must be kebab-case: ${input.name}`);
  if (input.parts.length === 0) throw new Error(`${input.name}: at least one part is required`);
  const slots = new Set<string>();
  for (const part of input.parts) {
    if (!slotRe.test(part.slot)) throw new Error(`${input.name}: invalid slot "${part.slot}"`);
    if (slots.has(part.slot)) throw new Error(`${input.name}: duplicate slot "${part.slot}"`);
    slots.add(part.slot);
    for (const category of part.overrides) {
      if (!overrideCategories.includes(category)) {
        throw new Error(`${input.name}.${part.jsx}: unknown override category "${category}"`);
      }
    }
  }
  return { ...input, __contract: true };
}

/** Marks a prop whose TypeScript type is a React node (not representable in JSON Schema). */
export function node(description: string) {
  return z.any().meta({ description, "x-ts-type": "React.ReactNode" });
}

/**
 * Marks a prop that must reference the id of another element (like `commandfor`).
 * `target` names the contract whose root provides that id ("dialog", "popover");
 * omit it when any element may be referenced.
 */
export function idref(description: string, target?: string) {
  return z.string().min(1).meta({ description, "x-idref": target ?? true });
}

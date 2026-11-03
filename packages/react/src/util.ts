import { isValidElement, type ReactElement, type ReactNode } from "react";

/** The anchor name shared by a popover-like element and its trigger (CSS anchor positioning). */
export function anchorName(id: string): string {
  return `--ur-anchor-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

/** Joins id references for aria-describedby / aria-labelledby, dropping empty ones. */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

/** A part of a compound component, marked with the name its parent finds it by. */
export type Part = { urPart: string };

/**
 * Whether a child is an element of one of the given parts. Compares the static
 * urPart marker rather than the function: Fast Refresh replaces the functions
 * on every edit, while elements created before the edit keep the old ones.
 */
export function isPart<P>(child: ReactNode, ...parts: Part[]): child is ReactElement<P> {
  if (!isValidElement(child)) return false;
  const name = (child.type as Partial<Part>).urPart;
  return parts.some((part) => part.urPart === name);
}

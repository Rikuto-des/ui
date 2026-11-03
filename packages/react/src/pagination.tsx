import type * as React from "react";
import { paginationDefaults, paginationSlot, type PaginationOwnProps } from "./generated/pagination.ts";

export type PaginationProps = PaginationOwnProps & Omit<React.ComponentPropsWithRef<"nav">, keyof PaginationOwnProps | "children">;

/** The pages to show: the first, the last, the current one with its siblings, and gaps between. */
export function pageItems(page: number, total: number, siblings: number): (number | "gap")[] {
  const shown = new Set([1, total]);
  for (let p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= total) shown.add(p);
  const sorted = [...shown].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const p of sorted) {
    // A gap of one page is shown as that page rather than as "…".
    if (p - previous === 2) out.push(p - 1);
    else if (p - previous > 2) out.push("gap");
    out.push(p);
    previous = p;
  }
  return out;
}

/**
 * Links to pages, built from a URL template, so it works without JavaScript.
 * The current page has aria-current="page"; disabled ends are not links.
 */
export function Pagination({
  page,
  total,
  href,
  siblings = paginationDefaults.siblings,
  label = paginationDefaults.label,
  ...rest
}: PaginationProps) {
  const url = (p: number) => href.replaceAll("{page}", String(p));
  const end = (p: number, enabled: boolean, text: string, slot: string, rel: string) =>
    enabled ? (
      <a href={url(p)} rel={rel} data-slot={slot}>
        {text}
      </a>
    ) : (
      <span aria-disabled="true" data-slot={slot}>
        {text}
      </span>
    );
  return (
    <nav {...rest} aria-label={label} data-slot={paginationSlot}>
      <ul data-slot="pagination-list">
        <li>{end(page - 1, page > 1, "前へ", "pagination-prev", "prev")}</li>
        {pageItems(page, total, siblings).map((p, i) => (
          <li key={p === "gap" ? `gap-${i}` : p}>
            {p === "gap" ? (
              <span data-slot="pagination-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <a href={url(p)} aria-label={`${p} ページ目`} aria-current={p === page ? "page" : undefined} data-slot="pagination-page">
                {p}
              </a>
            )}
          </li>
        ))}
        <li>{end(page + 1, page < total, "次へ", "pagination-next", "next")}</li>
      </ul>
    </nav>
  );
}

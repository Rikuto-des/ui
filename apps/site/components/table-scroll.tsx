"use client";

import type { ReactNode } from "react";

/** Keep horizontal documentation tables reachable in browsers that do not
 * scroll a focused overflow region with the arrow keys. */
export function TableScroll({ label, children }: { label: string; children: ReactNode }) {
  return <div className="table-scroll" role="region" aria-label={label} tabIndex={0} onKeyDown={event => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const region = event.currentTarget;
    if (region.scrollWidth <= region.clientWidth || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    region.scrollBy({ left: event.key === "ArrowRight" ? 64 : -64, behavior: "instant" });
  }}>{children}</div>;
}

"use client";

import { useEffect } from "react";
import { installRuntime } from "@urushi/core/runtime";

/**
 * Optional client runtime. Render it once (e.g. in the root layout). Every
 * component renders and works without it; it adds what HTML and CSS cannot do
 * yet: menu and tab keyboard models, tooltips outside Chromium, <dialog
 * closedby> outside browsers that ship it, and the toast region.
 */
export function UrushiRuntime() {
  useEffect(() => installRuntime(), []);
  return null;
}

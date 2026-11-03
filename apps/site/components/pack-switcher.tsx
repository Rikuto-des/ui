"use client";

import { useEffect, useRef, useState } from "react";
import { Select } from "@urushi/react";

/** Remembered per browser; read again by the inline script in the layout before first paint. */
export const STORAGE_KEY = "urushi-site";

function save(next: { pack: string; theme: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private windows and blocked storage: the choice simply is not remembered.
  }
}

/** The pack and theme switches in the header: two native selects. */
export function PackSwitcher() {
  const [ready, setReady] = useState(false);
  const [pack, setPack] = useState("graphite");
  const [theme, setTheme] = useState("system");
  const selection = useRef({ pack: "graphite", theme: "system" });

  useEffect(() => {
    const html = document.documentElement;
    selection.current = { pack: html.dataset.pack ?? "graphite", theme: html.dataset.theme ?? "system" };
    setPack(html.dataset.pack ?? "graphite");
    setTheme(html.dataset.theme ?? "system");
    setReady(true);
  }, []);

  const apply = (patch: Partial<{ pack: string; theme: string }>) => {
    const next = { ...selection.current, ...patch };
    selection.current = next;
    // Commit immediately. CSS fades colors without freezing hit testing.
    setPack(next.pack);
    setTheme(next.theme);
    save(next);
    const html = document.documentElement;
    html.dataset.pack = next.pack;
    if (next.theme === "system") delete html.dataset.theme;
    else html.dataset.theme = next.theme;
  };

  return (
    <div className="switcher">
      <Select size="sm" aria-label="パック" disabled={!ready} value={pack} onChange={(e) => apply({ pack: e.target.value })}>
        <option value="graphite">Graphite</option>
        <option value="lucent">Lucent</option>
      </Select>
      <Select size="sm" aria-label="テーマ" disabled={!ready} value={theme} onChange={(e) => apply({ theme: e.target.value })}>
        <option value="system">自動</option>
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
      </Select>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Toaster } from "@yourlib/react";
import { YourlibRuntime } from "@yourlib/react/runtime";

const packs = [
  { name: "graphite", label: "Graphite" },
  { name: "lucent", label: "Lucent" },
] as const;
const themes = [
  { name: "system", label: "自動" },
  { name: "light", label: "ライト" },
  { name: "dark", label: "ダーク" },
] as const;
const pages = [
  { href: "/", label: "トップ", name: "home" },
  { href: "/components.html", label: "部品", name: "components" },
] as const;
type PackName = (typeof packs)[number]["name"];
type ThemeName = (typeof themes)[number]["name"];

/** Runs a DOM update inside a view transition so a pack change morphs instead of jumping. */
function transition(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return update();
  document.startViewTransition(() => flushSync(update));
}

/** The review bar and the runtime around a playground page. */
export function App({ page, children }: { page: (typeof pages)[number]["name"]; children: ReactNode }) {
  const [pack, setPack] = useState<PackName>("graphite");
  const [theme, setTheme] = useState<ThemeName>("system");

  const choosePack = (next: PackName) =>
    transition(() => {
      document.documentElement.dataset.pack = next;
      setPack(next);
    });
  const chooseTheme = (next: ThemeName) =>
    transition(() => {
      if (next === "system") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = next;
      setTheme(next);
    });

  return (
    <>
      <YourlibRuntime />
      <div className="review" role="toolbar" aria-label="表示の切り替え">
        <b>playground</b>
        <nav className="seg" aria-label="ページ">
          {pages.map((p) => (
            <a key={p.name} href={p.href} aria-current={p.name === page ? "page" : undefined}>
              {p.label}
            </a>
          ))}
        </nav>
        <div className="seg" role="group" aria-label="パック">
          {packs.map((p) => (
            <button key={p.name} type="button" aria-pressed={p.name === pack} onClick={() => choosePack(p.name)} data-testid={`pack-${p.name}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="テーマ">
          {themes.map((t) => (
            <button key={t.name} type="button" aria-pressed={t.name === theme} onClick={() => chooseTheme(t.name)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {children}
      <Toaster />
    </>
  );
}

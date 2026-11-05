import { PackSwitcher } from "./pack-switcher";

const nav = [
  { href: "/docs/", label: "Docs", section: "docs" },
  { href: "/components/", label: "Components", section: "components" },
  { href: "/blocks/", label: "Blocks", section: "blocks" },
  { href: "/examples/", label: "Examples", section: "examples" },
  { href: "/themes/", label: "Themes", section: "themes" },
  { href: "/docs/design/", label: "Design", section: "design" },
];

export function SiteHeader({ section }: { section?: string }) {
  return (
    <header className="site-header">
      <div className="site-header-inner wrap">
        <a className="wordmark" href="/" aria-label="Urushi">
          <svg className="brand-mark" width="27" height="27" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 3v11a11 11 0 0 0 22 0V3M8 3v11a6 6 0 0 0 12 0V3M13 3v11a1 1 0 0 0 2 0V3" /></svg>
          <span>urushi</span>
        </a>
        <nav className="site-nav" aria-label="サイト">
          {nav.map((n) => (
            <a key={n.href} href={n.href} aria-current={n.section === section ? "page" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <PackSwitcher />
      </div>
    </header>
  );
}

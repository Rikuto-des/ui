"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ListIcon, MagnifyingGlassIcon, XIcon } from "@urushi/react/icons";
import { docsNavGroups, type DocsNavGroup } from "@/lib/docs-navigation";

const DESKTOP_SCROLL_KEY = "urushi-docs-navigation-scroll-v2";
const MOBILE_SCROLL_KEY = "urushi-docs-navigation-mobile-scroll";
const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase().replace(/[\s-]/g, "");

function NavLinks({ groups, current, onNavigate }: { groups: DocsNavGroup[]; current: string; onNavigate?: () => void }) {
  return groups.map(group => <div className="docs-nav-group" key={group.label}>
    <p>{group.label}</p>
    <ul>{group.items.map(item => <li key={item.href}>
      <Link href={item.href} prefetch={false} aria-current={item.href === current ? "page" : undefined} onNavigate={onNavigate}>
        {item.label}
      </Link>
    </li>)}</ul>
  </div>);
}

/** The search stays visible while only the links scroll. */
function NavigationPanel({ current, mobile = false, open = false, onNavigate }: {
  current: string; mobile?: boolean; open?: boolean; onNavigate?: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const unfilteredTop = useRef(0);
  const filtering = useRef(false);
  const [query, setQuery] = useState("");
  const [shortcut, setShortcut] = useState("Ctrl K");
  const key = mobile ? MOBILE_SCROLL_KEY : DESKTOP_SCROLL_KEY;
  const normalized = normalize(query);
  const groups = docsNavGroups.map(group => ({ ...group, items: group.items.filter(item =>
    normalize(`${item.label} ${item.keywords ?? ""}`).includes(normalized),
  ) })).filter(group => group.items.length);
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);

  useEffect(() => {
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K");
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const save = () => {
      if (!nav.clientHeight || filtering.current) return;
      unfilteredTop.current = nav.scrollTop;
      try { sessionStorage.setItem(key, String(nav.scrollTop)); } catch { /* Storage is optional. */ }
    };
    const restore = () => {
      if (!nav.clientHeight || filtering.current) return;
      try {
        const saved = sessionStorage.getItem(key);
        if (saved !== null && Number.isFinite(Number(saved))) nav.scrollTop = Math.max(0, Number(saved));
      } catch { /* Reveal the current page even when storage is blocked. */ }
      const active = nav.querySelector('[aria-current="page"]');
      if (active) {
        const item = active.getBoundingClientRect(), frame = nav.getBoundingClientRect();
        if (item.top < frame.top + 8 || item.bottom > frame.bottom - 8) {
          nav.scrollTop += (item.top + item.bottom - frame.top - frame.bottom) / 2;
        }
      }
      unfilteredTop.current = nav.scrollTop;
    };
    restore();
    let visible = nav.clientHeight > 0;
    const observer = new ResizeObserver(() => {
      const nextVisible = nav.clientHeight > 0;
      if (nextVisible && !visible) restore();
      visible = nextVisible;
    });
    // Keep boundary wheels in the index even when a browser's async scrolling
    // chains them despite overscroll-behavior. Preserve zoom and horizontal scroll.
    const containWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const bottom = nav.scrollHeight - nav.clientHeight;
      if ((event.deltaY < 0 && nav.scrollTop <= 1) || (event.deltaY > 0 && nav.scrollTop >= bottom - 1)) event.preventDefault();
    };
    observer.observe(nav);
    nav.addEventListener("scroll", save, { passive: true });
    nav.addEventListener("wheel", containWheel, { passive: false });
    nav.addEventListener("click", save, { capture: true });
    window.addEventListener("pagehide", save);
    return () => {
      save();
      observer.disconnect();
      nav.removeEventListener("scroll", save);
      nav.removeEventListener("wheel", containWheel);
      nav.removeEventListener("click", save, { capture: true });
      window.removeEventListener("pagehide", save);
    };
  }, [current, key, open]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    nav.scrollTop = normalized ? 0 : unfilteredTop.current;
  }, [normalized]);

  const changeQuery = (value: string) => {
    if (!filtering.current && normalize(value)) unfilteredTop.current = navRef.current?.scrollTop ?? 0;
    filtering.current = Boolean(normalize(value));
    setQuery(value);
  };
  const searchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && query) {
      event.preventDefault(); event.stopPropagation(); changeQuery("");
    } else if (event.key === "ArrowDown") {
      event.preventDefault(); navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    } else if (event.key === "Enter" && normalized) {
      event.preventDefault(); navRef.current?.querySelector<HTMLAnchorElement>("a")?.click();
    }
  };
  return <>
    <div className="docs-nav-search">
      <MagnifyingGlassIcon size={16} />
      <input ref={searchRef} type="search" aria-label="ドキュメントを検索" aria-keyshortcuts="Meta+K Control+K" placeholder="検索..." value={query}
        onChange={e => changeQuery(e.target.value)} onKeyDown={searchKey} autoComplete="off" spellCheck={false} />
      {query ? <button type="button" aria-label="検索をクリア" onClick={() => { changeQuery(""); searchRef.current?.focus(); }}><XIcon size={16} /></button>
        : <kbd aria-hidden="true">{shortcut}</kbd>}
    </div>
    <nav ref={navRef} className="docs-nav docs-nav-list" aria-label={mobile ? "モバイルの目次" : "ドキュメントの目次"}>
      <NavLinks groups={groups} current={current} onNavigate={onNavigate} />
      {normalized && count === 0 && <div className="docs-nav-empty"><p>一致するページがありません。</p><button type="button" onClick={() => { changeQuery(""); searchRef.current?.focus(); }}>検索をクリア</button></div>}
    </nav>
    <span className="visually-hidden" role="status">{normalized ? `${count}件のページが見つかりました。` : ""}</span>
  </>;
}

export function DocsNavigation({ current }: { current: string }) {
  const asideRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const backdropPress = useRef(false);
  const [open, setOpen] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const currentLabel = docsNavGroups.flatMap(group => group.items).find(item => item.href === current)?.label ?? "ドキュメント";
  const close = () => { dialogRef.current?.close(); setOpen(false); };
  const show = (search = false) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal(); setOpen(true);
    if (search) dialog.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    else titleRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    setEnhanced(true);
    const media = matchMedia("(max-width: 960px)");
    const resize = () => {
      if (!media.matches && dialogRef.current?.open) {
        dialogRef.current.close(); setOpen(false);
        requestAnimationFrame(() => asideRef.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus({ preventScroll: true }));
      }
    };
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k" || event.altKey || event.isComposing) return;
      // Do not steal shortcuts from an example dialog opened over the documentation.
      if (document.querySelector('dialog[open]:not(.docs-drawer)')) return;
      event.preventDefault();
      if (media.matches) {
        if (!dialogRef.current?.open) show(true);
        else dialogRef.current.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      } else asideRef.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    };
    // Next may temporarily retain a hidden outgoing page. Measure this page's
    // header, never the first matching header in the whole document.
    const header = asideRef.current?.closest(".docs")?.previousElementSibling;
    const sizeHeader = () => {
      const height = header?.getBoundingClientRect().height;
      if (height) document.documentElement.style.setProperty("--site-header-height", `${height}px`);
    };
    sizeHeader();
    const observer = new ResizeObserver(sizeHeader);
    if (header) observer.observe(header);
    media.addEventListener("change", resize);
    document.addEventListener("keydown", shortcut);
    return () => { observer.disconnect(); media.removeEventListener("change", resize); document.removeEventListener("keydown", shortcut); };
  }, []);

  return <>
    <aside ref={asideRef} className="docs-sidebar">
      <NavigationPanel current={current} />
    </aside>
    <details ref={detailsRef} className="docs-mobile">
      <summary aria-haspopup={enhanced ? "dialog" : undefined} aria-expanded={enhanced ? open : undefined} aria-controls={enhanced ? "site-docs-menu" : undefined} onClick={event => { event.preventDefault(); show(); }}>
        <ListIcon size={20} /><span>ドキュメントの目次</span><span className="docs-mobile-current">{currentLabel}</span>
      </summary>
      <nav className="docs-mobile-fallback docs-nav-list" aria-label="モバイルの目次"><NavLinks groups={docsNavGroups} current={current} /></nav>
    </details>
    <dialog ref={dialogRef} id="site-docs-menu" className="docs-drawer" aria-labelledby="site-docs-menu-title" closedby="any"
      onClose={() => { setOpen(false); detailsRef.current?.querySelector("summary")?.focus({ preventScroll: true }); }}
      onPointerDown={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        backdropPress.current = event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
      }}
      onClick={event => {
        if (event.target !== event.currentTarget || !backdropPress.current) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}>
      <div className="docs-drawer-heading"><h2 ref={titleRef} tabIndex={-1} id="site-docs-menu-title">ドキュメント</h2><button type="button" aria-label="メニューを閉じる" onClick={close}><XIcon size={20} /></button></div>
      <NavigationPanel current={current} mobile open={open} onNavigate={close} />
    </dialog>
  </>;
}

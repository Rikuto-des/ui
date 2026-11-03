const ROOT = '[data-slot="navigation-menu"]';
const GROUP = 'details[data-slot="navigation-menu-group"]';
const TRIGGER = '[data-slot="navigation-menu-trigger"]';
const CONTROL = `${TRIGGER}, [data-slot="navigation-menu-link"]`;
const PANEL = '[data-slot="navigation-menu-panel"]';
type Point = { x: number; y: number };
type Surface = { element: HTMLElement; owner: HTMLDetailsElement; target: DOMRect; animation?: Animation };

/** A pointer may cross other rows while travelling diagonally to a flyout. */
function inTriangle(p: Point, a: Point, b: Point, c: Point) {
  const cross = (p1: Point, p2: Point, p3: Point) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d = [cross(p, a, b), cross(p, b, c), cross(p, c, a)];
  return !(d.some(n => n < 0) && d.some(n => n > 0));
}

export function installNavigationMenus(doc: Document): () => void {
  const win = doc.defaultView!;
  const wide = win.matchMedia('(min-width: 641px)');
  const hover = win.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const opening = new Map<HTMLDetailsElement, ReturnType<typeof setTimeout>>();
  const closing = new Map<HTMLDetailsElement, ReturnType<typeof setTimeout>>();
  const floating = new Set<HTMLDetailsElement>();
  const automatic = new Set<HTMLDetailsElement>();
  const suppressed = new WeakSet<HTMLDetailsElement>();
  const corridors = new Map<HTMLDetailsElement, { origin: Point; expires: number }>();
  const surfaces = new Map<Element, Surface>();
  const contentAnimations = new Map<HTMLElement, Animation>();
  const scopes = new WeakMap<Element, Element>();
  const panel = (group: Element) => group.querySelector<HTMLElement>(`:scope > ${PANEL}`)!;
  const summary = (group: Element) => group.querySelector<HTMLElement>(':scope > summary')!;
  const parent = (group: Element) => group.parentElement?.closest<HTMLDetailsElement>(GROUP);
  const scope = (group: Element) => {
    const key = group.parentElement?.parentElement ?? scopes.get(group)!;
    if (key) scopes.set(group, key);
    return key;
  };
  const entries = (list: Element) => Array.from(list.querySelectorAll<HTMLElement>(CONTROL)).filter(el => el.closest('ul') === list);
  const clear = (map: Map<HTMLDetailsElement, ReturnType<typeof setTimeout>>, group: HTMLDetailsElement) => {
    clearTimeout(map.get(group)); map.delete(group);
  };
  const cancel = (group: HTMLDetailsElement) => { clear(opening, group); clear(closing, group); corridors.delete(group); };
  let frame = 0, disposed = false;
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => scheduleLayout());
  const mutations = new MutationObserver(() => scheduleLayout());
  function removeSurface(group: HTMLDetailsElement) {
    const key = scope(group), surface = surfaces.get(key);
    if (!surface) return;
    surface.animation?.cancel(); surface.element.remove(); surfaces.delete(key);
  }
  function paintSurface(group: HTMLDetailsElement, animate: boolean) {
    const p = panel(group), key = scope(group), target = p.getBoundingClientRect();
    let surface = surfaces.get(key);
    const previous = surface?.element.getBoundingClientRect();
    const changed = !surface || ['x', 'y', 'width', 'height'].some(k => Math.abs(target[k as keyof DOMRect] as number - (surface!.target[k as keyof DOMRect] as number)) > .5);
    const switching = surface && surface.owner !== group;
    if (!surface) {
      const element = doc.createElement('div');
      element.dataset.slot = 'navigation-menu-surface'; element.setAttribute('popover', 'manual');
      element.setAttribute('aria-hidden', 'true'); element.inert = true;
      group.closest(ROOT)!.append(element);
      surface = { element, owner: group, target }; surfaces.set(key, surface);
      // Show the decorative surface first, then the real list above it. No links
      // are cloned or reparented, so focus and the accessibility tree stay native.
      element.showPopover();
      p.hidePopover(); p.showPopover();
    }
    surface.owner = group;
    p.dataset.surface = '';
    if (!changed && !switching) return;
    const element = surface.element;
    surface.animation?.cancel(); surface.target = target;
    const to = { left: `${target.x}px`, top: `${target.y}px`, width: `${target.width}px`, height: `${target.height}px` };
    Object.assign(element.style, to);
    if (animate && switching && previous && !reducedMotion.matches && typeof element.animate === 'function') {
      surface.animation = element.animate([
        { left: `${previous.x}px`, top: `${previous.y}px`, width: `${previous.width}px`, height: `${previous.height}px` }, to,
      ], { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)' });
      // Reveal content inside the changing surface without scaling the text.
      const inset = `${Math.max(0, previous.top-target.top)}px ${Math.max(0, target.right-previous.right)}px ${Math.max(0, target.bottom-previous.bottom)}px ${Math.max(0, previous.left-target.left)}px`;
      contentAnimations.get(p)?.cancel();
      const animation = p.animate([{ opacity: 0, clipPath: `inset(${inset})` }, { opacity: 1, clipPath: 'inset(-3px)' }], { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' });
      contentAnimations.set(p, animation);
      animation.onfinish = () => { if (contentAnimations.get(p) === animation) contentAnimations.delete(p); };
    }
  }
  function unfloat(group: HTMLDetailsElement, keepSurface = false) {
    const p = panel(group);
    contentAnimations.get(p)?.cancel(); contentAnimations.delete(p);
    if (!keepSurface && surfaces.get(scope(group))?.owner === group) removeSurface(group);
    if (p.matches(':popover-open')) p.hidePopover();
    p.removeAttribute('popover'); p.removeAttribute('data-floating'); p.removeAttribute('data-surface');
    for (const name of ['--ur-nav-x', '--ur-nav-y', '--ur-nav-height', '--ur-nav-width']) p.style.removeProperty(name);
    delete group.dataset.side; floating.delete(group); resize?.unobserve(p);
    if (!floating.size) mutations.disconnect();
  }
  function close(group: HTMLDetailsElement, keepSurface = false) {
    for (const child of group.querySelectorAll<HTMLDetailsElement>(GROUP)) close(child);
    cancel(group); automatic.delete(group);
    if (floating.has(group)) unfloat(group, keepSurface);
    group.open = false;
  }
  const closeAll = (root: Element) => {
    for (const group of root.querySelectorAll<HTMLDetailsElement>(GROUP)) close(group);
  };
  const peers = (group: HTMLDetailsElement) => group.parentElement?.parentElement?.querySelectorAll<HTMLDetailsElement>(`:scope > li > ${GROUP}`) ?? [];
  function position(group: HTMLDetailsElement, animate = false) {
    if (!group.open || !group.isConnected) { if (floating.has(group)) unfloat(group); return; }
    const p = panel(group), owner = parent(group);
    if (!wide.matches || typeof p.showPopover !== 'function' || (owner && group.dataset.submenu === 'inline')) {
      if (floating.has(group)) unfloat(group); removeSurface(group); return;
    }
    const trigger = summary(group).getBoundingClientRect(), anchor = owner ? panel(owner).getBoundingClientRect() : trigger;
    const width = doc.documentElement.clientWidth, height = win.innerHeight, edge = 12, gap = 8;
    if (!owner && (trigger.bottom < 0 || trigger.top > height || trigger.right < 0 || trigger.left > width)) {
      if (containsFocus(group)) summary(group).focus({preventScroll:true});
      close(group); return;
    }
    const rtl = win.getComputedStyle(group).direction === 'rtl';
    const rightSpace = width - anchor.right - gap - edge, leftSpace = anchor.left - gap - edge;
    if (owner && Math.max(rightSpace, leftSpace) < 220) { if (floating.has(group)) unfloat(group); removeSurface(group); return; }
    const fresh = !floating.has(group);
    if (fresh) {
      p.setAttribute('popover', 'manual'); p.dataset.floating = owner ? 'submenu' : 'root';
      floating.add(group); p.showPopover(); resize?.observe(p);
      mutations.observe(doc.body, { childList: true, subtree: true });
    }
    p.style.setProperty('--ur-nav-height', `${height - edge * 2}px`);
    p.style.removeProperty('--ur-nav-width');
    let rect = p.getBoundingClientRect();
    let side = owner ? (rtl ? 'left' : 'right') : 'bottom';
    if (owner && (side === 'right' ? rightSpace : leftSpace) < rect.width && (side === 'right' ? leftSpace > rightSpace : rightSpace > leftSpace)) side = side === 'right' ? 'left' : 'right';
    if (owner) { p.style.setProperty('--ur-nav-width', `${side === 'right' ? rightSpace : leftSpace}px`); rect = p.getBoundingClientRect(); }
    let x = owner ? (side === 'right' ? anchor.right + gap : anchor.left - rect.width - gap) : rtl ? trigger.right - rect.width : trigger.left;
    let y = owner ? trigger.top - 8 : trigger.bottom + gap;
    if (!owner && height - y - edge < rect.height && trigger.top - edge > height - trigger.bottom - edge) { side = 'top'; y = trigger.top - rect.height - gap; }
    const availableHeight = owner ? height - edge * 2 : side === 'top' ? trigger.top - gap - edge : height - trigger.bottom - gap - edge;
    p.style.setProperty('--ur-nav-height', `${Math.max(44, availableHeight)}px`);
    x = Math.max(edge, Math.min(x, width - rect.width - edge));
    y = Math.max(edge, Math.min(y, height - Math.min(rect.height, Math.max(44, availableHeight)) - edge));
    p.style.setProperty('--ur-nav-x', `${Math.round(x)}px`); p.style.setProperty('--ur-nav-y', `${Math.round(y)}px`);
    group.dataset.side = side;
    paintSurface(group, animate);
  }
  function scheduleLayout() {
    if (disposed || frame) return;
    frame = win.requestAnimationFrame(() => {
      frame = 0;
      for (const group of [...floating]) if (!group.isConnected || !group.open) close(group);
      for (const group of doc.querySelectorAll<HTMLDetailsElement>(`${GROUP}[open]`)) position(group);
    });
  }
  function open(group: HTMLDetailsElement, pointer = false) {
    if (!group.isConnected) return;
    // A pointer must not hide the keyboard user's focused link.
    if (pointer && [...peers(group)].some(other => other !== group && panel(other).contains(doc.activeElement))) return;
    cancel(group);
    for (const other of peers(group)) if (other !== group) close(other, true);
    group.open = true;
    if (pointer) automatic.add(group); else automatic.delete(group);
    position(group, true);
  }
  function containsFocus(group: HTMLDetailsElement) { return panel(group).contains(doc.activeElement); }
  const toggle = (event: Event) => {
    const group = event.target;
    if (!(group instanceof HTMLDetailsElement) || !group.matches(GROUP)) return;
    if (!group.open) { close(group); return; }
    for (const other of peers(group)) if (other !== group) close(other, true);
    position(group, true);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const el = event.target;
    if (event.key === 'Escape') {
      if (opening.size || automatic.size) event.preventDefault();
      for (const group of opening.keys()) { suppressed.add(group); clear(opening, group); }
      const current = el instanceof Element ? el.closest<HTMLDetailsElement>(GROUP) : null;
      const nearest = current?.open ? current : current && parent(current);
      if (nearest?.open) { event.preventDefault(); suppressed.add(nearest); close(nearest); summary(nearest).focus(); }
      else for (const group of [...automatic]) { suppressed.add(group); close(group); }
      return;
    }
    if (!(el instanceof HTMLElement) || !el.matches(CONTROL)) return;
    const root = el.closest(ROOT); if (!root) return;
    for (const group of root.querySelectorAll<HTMLDetailsElement>(GROUP)) cancel(group);
    const group = el.closest<HTMLDetailsElement>(GROUP), list = el.closest('ul')!;
    const top = list.parentElement === root, rtl = win.getComputedStyle(root).direction === 'rtl';
    if (el.tagName === 'SUMMARY' && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || (!top && event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')))) {
      event.preventDefault(); open(group!);
      const items = entries(panel(group!)); (event.key === 'ArrowUp' ? items.at(-1) : items[0])?.focus(); return;
    }
    if (!top && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
      const owner = list.parentElement as HTMLDetailsElement;
      if (parent(owner)) { event.preventDefault(); close(owner); summary(owner).focus(); } return;
    }
    const items = entries(list); let index = items.indexOf(el);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = items.length - 1;
    else if (!top && event.key === 'ArrowDown') index++;
    else if (!top && event.key === 'ArrowUp') index--;
    else if (top && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) index += (event.key === 'ArrowRight') !== rtl ? 1 : -1;
    else return;
    event.preventDefault();
    const next = items[(index + items.length) % items.length];
    next?.focus();
    if (top && next?.matches(TRIGGER) && root.querySelector(`${GROUP}[open]`)) open(next.parentElement as HTMLDetailsElement);
  };
  function hoverable(event: PointerEvent, root: HTMLElement) { return event.pointerType === 'mouse' && wide.matches && hover.matches && root.dataset.hover !== 'false'; }
  const pointerover = (event: PointerEvent) => {
    if (!(event.target instanceof Element)) return;
    const root = event.target.closest<HTMLElement>(ROOT); if (!root || !hoverable(event, root)) return;
    for (const group of root.querySelectorAll<HTMLDetailsElement>(GROUP)) if (group.contains(event.target)) { clear(closing, group); corridors.delete(group); }
    const trigger = event.target.closest(TRIGGER), group = trigger?.parentElement as HTMLDetailsElement | undefined;
    if (!group || trigger?.contains(event.relatedTarget as Node | null) || group.open || suppressed.has(group)) return;
    clear(opening, group);
    const delay = parent(group) ? 160 : root.querySelector(`${GROUP}[open]`) ? 70 : 180;
    const attempt = () => {
      opening.delete(group);
      if (!group.isConnected || !summary(group).matches(':hover')) return;
      const remaining = [...corridors].filter(([child]) => child.closest(ROOT) === root).map(([, c]) => c.expires-Date.now());
      if (remaining.some(n => n > 0)) { opening.set(group, setTimeout(attempt, Math.min(80, Math.max(...remaining)))); return; }
      open(group, true);
    };
    opening.set(group, setTimeout(attempt, delay));
  };
  function scheduleClose(group: HTMLDetailsElement, delay = 300) {
    clear(closing, group);
    closing.set(group, setTimeout(() => {
      closing.delete(group); corridors.delete(group);
      if (!containsFocus(group)) close(group);
    }, delay));
  }
  const pointerout = (event: PointerEvent) => {
    if (!(event.target instanceof Element)) return;
    const root = event.target.closest<HTMLElement>(ROOT); if (!root || !hoverable(event, root)) return;
    for (const group of root.querySelectorAll<HTMLDetailsElement>(GROUP)) {
      if (!group.contains(event.target) || group.contains(event.relatedTarget as Node | null)) continue;
      clear(opening, group); suppressed.delete(group);
      if (!group.open) continue;
      if (parent(group) && floating.has(group)) {
        corridors.set(group, {origin:{x:event.clientX,y:event.clientY},expires:Date.now()+700}); scheduleClose(group, 700);
        // The gap is outside the entire navigation. Its ancestors must share
        // the child's grace period rather than closing the child at 300ms.
        for (let ancestor = parent(group); ancestor; ancestor = parent(ancestor)) scheduleClose(ancestor, 700);
      } else {
        const remaining = [...corridors].filter(([child]) => group.contains(child)).map(([, corridor]) => corridor.expires - Date.now());
        scheduleClose(group, Math.max(300, ...remaining));
      }
    }
  };
  const pointermove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    for (const [group, corridor] of corridors) {
      if (group.contains(event.target as Node)) { clear(closing, group); corridors.delete(group); continue; }
      const r = panel(group).getBoundingClientRect(), x = group.dataset.side === 'left' ? r.right + 5 : r.left - 5;
      if (Date.now() > corridor.expires || !inTriangle({x:event.clientX,y:event.clientY}, corridor.origin, {x,y:r.top-10}, {x,y:r.bottom+10})) {
        corridors.delete(group); scheduleClose(group, 100);
        for (let ancestor = parent(group); ancestor; ancestor = parent(ancestor)) if (!ancestor.contains(event.target as Node)) scheduleClose(ancestor, 100);
      }
    }
  };
  const pointerdown = (event: PointerEvent) => {
    if (!(event.target instanceof Node)) return;
    for (const root of doc.querySelectorAll(ROOT)) {
      for (const group of root.querySelectorAll<HTMLDetailsElement>(GROUP)) clear(opening, group);
      if (root.contains(event.target)) continue;
      const active = doc.activeElement, group = active instanceof Element ? active.closest<HTMLDetailsElement>(`${GROUP}[open]`) : null;
      if (group && root.contains(group)) { let outer = group; while (parent(outer)) outer = parent(outer)!; summary(outer).focus(); }
      closeAll(root);
    }
  };
  const focusin = (event: FocusEvent) => {
    if (!(event.target instanceof Node)) return;
    for (const root of doc.querySelectorAll(ROOT)) if (!root.contains(event.target)) closeAll(root);
  };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const group = target?.closest(TRIGGER)?.parentElement as HTMLDetailsElement | undefined;
    if (group) {
      cancel(group);
      if (event.detail > 0 && group.open && automatic.has(group)) { event.preventDefault(); automatic.delete(group); return; }
      // Activate synchronously so native queued toggle events cannot revive an
      // old panel. Without this runtime, details keeps its native activation.
      event.preventDefault();
      if (!group.open) open(group);
      else { suppressed.add(group); close(group); }
    }
    const link = target?.closest('[data-slot="navigation-menu-link"]'), root = link?.closest(ROOT);
    if (root) {
      const owner = link!.closest<HTMLDetailsElement>(GROUP);
      if (owner) { let outer = owner; while (parent(outer)) outer = parent(outer)!; summary(outer).focus(); }
      closeAll(root);
    }
  };
  doc.addEventListener('toggle', toggle, true); doc.addEventListener('keydown', keydown);
  doc.addEventListener('pointerover', pointerover); doc.addEventListener('pointerout', pointerout); doc.addEventListener('pointermove', pointermove);
  doc.addEventListener('pointerdown', pointerdown); doc.addEventListener('focusin', focusin); doc.addEventListener('click', click);
  win.addEventListener('resize', scheduleLayout); doc.addEventListener('scroll', scheduleLayout, true);
  const motionChange = () => { if (reducedMotion.matches) { for (const surface of surfaces.values()) surface.animation?.cancel(); for (const animation of contentAnimations.values()) animation.cancel(); contentAnimations.clear(); } };
  reducedMotion.addEventListener('change', motionChange);
  scheduleLayout();
  return () => {
    disposed = true; win.cancelAnimationFrame(frame); resize?.disconnect(); mutations.disconnect();
    for (const group of new Set([...opening.keys(), ...closing.keys()])) cancel(group);
    for (const group of [...floating]) unfloat(group);
    for (const surface of surfaces.values()) { surface.animation?.cancel(); surface.element.remove(); } surfaces.clear();
    reducedMotion.removeEventListener('change', motionChange);
    automatic.clear(); corridors.clear();
    doc.removeEventListener('toggle', toggle, true); doc.removeEventListener('keydown', keydown);
    doc.removeEventListener('pointerover', pointerover); doc.removeEventListener('pointerout', pointerout); doc.removeEventListener('pointermove', pointermove);
    doc.removeEventListener('pointerdown', pointerdown); doc.removeEventListener('focusin', focusin); doc.removeEventListener('click', click);
    win.removeEventListener('resize', scheduleLayout); doc.removeEventListener('scroll', scheduleLayout, true);
  };
}

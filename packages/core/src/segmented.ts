/** Tracks the actual selected radio's geometry, including RTL and wrapped rows. */
export function installSegmentedControls(doc: Document = document): () => void {
  const win = doc.defaultView!;
  const roots = new Map<HTMLElement, { resize: ResizeObserver; frame: number }>();
  const sync = (root: HTMLElement) => {
    const rail = root.querySelector<HTMLElement>('[data-slot="toggle-group-items"]');
    const indicator = rail?.querySelector<HTMLElement>('[data-slot="toggle-group-indicator"]');
    const selected = rail?.querySelector<HTMLInputElement>('input:checked')?.parentElement;
    if (!rail || !indicator || !selected || root.dataset.type === 'multiple') { root.removeAttribute('data-sliding'); return; }
    const box = selected.getBoundingClientRect(), bounds = rail.getBoundingClientRect();
    for (const [property, value] of Object.entries({ left: box.left - bounds.left + rail.scrollLeft, top: box.top - bounds.top + rail.scrollTop, width: box.width, height: box.height })) {
      const next = `${value}px`;
      if (indicator.style.getPropertyValue(property) !== next) indicator.style.setProperty(property, next);
    }
    if (!root.hasAttribute('data-sliding')) {
      root.dataset.sliding = '';
      indicator.getBoundingClientRect(); // Establish the initial geometry before enabling transitions.
    }
  };
  const scan = () => {
    for (const [root, state] of roots) if (!root.isConnected) { state.resize.disconnect(); win.cancelAnimationFrame(state.frame); roots.delete(root); }
    for (const root of doc.querySelectorAll<HTMLElement>('[data-slot="toggle-group"]')) {
      if (!roots.has(root)) {
        const resize = new win.ResizeObserver(() => sync(root));
        const state = { resize, frame: 0 }; roots.set(root, state);
        resize.observe(root);
      }
      const state = roots.get(root)!;
      for (const item of root.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]')) state.resize.observe(item);
      sync(root);
    }
  };
  const onChange = (event: Event) => { if (event.target instanceof win.Element) { const root = event.target.closest<HTMLElement>('[data-slot="toggle-group"]'); if (root) sync(root); } };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onReset = () => { clearTimeout(timer); timer = setTimeout(scan, 0); };
  const observer = new win.MutationObserver(scan);
  observer.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['checked', 'dir', 'data-type'] });
  doc.addEventListener('change', onChange); doc.addEventListener('reset', onReset); scan();
  return () => { observer.disconnect(); clearTimeout(timer); doc.removeEventListener('change', onChange); doc.removeEventListener('reset', onReset); for (const [root, state] of roots) { state.resize.disconnect(); root.removeAttribute('data-sliding'); } roots.clear(); };
}

/** Buttons and keyboard navigation enhance a native, swipeable scroll strip. */
export function installCarousels(doc: Document = document): () => void {
  const mounted = new Map<HTMLElement, { controls: HTMLElement; viewport: HTMLElement; refresh: () => void; destroy: () => void }>();
  const setup = (root: HTMLElement) => {
    const viewport = root.querySelector<HTMLElement>(':scope > [data-slot="carousel-viewport"]');
    const controls = root.querySelector<HTMLElement>(':scope > [data-slot="carousel-controls"]');
    if (!viewport || !controls) return;
    let current = 0, pending: number | undefined, timer: ReturnType<typeof setTimeout> | undefined;
    const items = () => [...viewport.querySelectorAll<HTMLElement>(':scope > [data-slot="carousel-item"]')];
    const rtl = () => getComputedStyle(viewport).direction === 'rtl';
    const render = () => {
      const slides = items();
      if (!slides.length || !viewport.clientWidth) return;
      const bounds = viewport.getBoundingClientRect();
      const distance = (slide: HTMLElement) => { const rect = slide.getBoundingClientRect(); return Math.abs(rtl() ? rect.right - bounds.right : rect.left - bounds.left); };
      current = slides.reduce((best, slide, i) => distance(slide) < distance(slides[best]) ? i : best, 0);
      // At the trailing edge, the final card may be narrower than the viewport.
      if (viewport.scrollWidth > viewport.clientWidth + 2 && Math.abs(viewport.scrollLeft) >= viewport.scrollWidth - viewport.clientWidth - 2) current = slides.length - 1;
      const selected = Math.min(slides.length - 1, pending ?? current);
      const previous = controls.querySelector<HTMLButtonElement>('[data-slot="carousel-previous"]');
      const next = controls.querySelector<HTMLButtonElement>('[data-slot="carousel-next"]');
      if (previous) { previous.disabled = false; previous.setAttribute('aria-disabled', String(selected === 0)); }
      if (next) { next.disabled = false; next.setAttribute('aria-disabled', String(selected === slides.length - 1)); }
      for (const [index, slide] of slides.entries()) slide.toggleAttribute('data-current', index === selected);
      for (const position of controls.querySelectorAll<HTMLElement>('[data-slot="carousel-position"]')) {
        const active = Number(position.dataset.index) === selected;
        if (active) position.setAttribute('aria-current', 'true'); else position.removeAttribute('aria-current');
      }
      const count = controls.querySelector('[data-slot="carousel-count"]');
      const text = `${selected + 1} / ${slides.length}`;
      if (count && count.textContent !== text) count.textContent = text;
    };
    const go = (index: number, instant = false) => {
      const slides = items();
      const next = Math.max(0, Math.min(slides.length - 1, index)), slide = slides[next];
      if (!slide) return;
      pending = next;
      const bounds = viewport.getBoundingClientRect(), rect = slide.getBoundingClientRect();
      const delta = rtl() ? rect.right - bounds.right : rect.left - bounds.left;
      // An absolute destination can pass intermediate mandatory snap stops.
      viewport.scrollTo({ left: viewport.scrollLeft + delta, behavior: instant || doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      render();
      clearTimeout(timer); timer = setTimeout(settle, 180);
    };
    const settle = () => { pending = undefined; render(); };
    const onScroll = () => { render(); clearTimeout(timer); timer = setTimeout(settle, 140); };
    const onInterrupt = () => { pending = undefined; };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button');
      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true' || !controls.contains(button)) return;
      if (button.dataset.slot === 'carousel-previous') go((pending ?? current) - 1);
      if (button.dataset.slot === 'carousel-next') go((pending ?? current) + 1);
      if (button.dataset.slot === 'carousel-position') go(Number(button.dataset.index));
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
      let next: number;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items().length - 1;
      else if (event.key === 'ArrowRight') next = (pending ?? current) + (rtl() ? -1 : 1);
      else if (event.key === 'ArrowLeft') next = (pending ?? current) + (rtl() ? 1 : -1);
      else return;
      event.preventDefault(); go(next);
    };
    root.dataset.enhanced = ''; controls.hidden = false;
    controls.addEventListener('click', onClick); viewport.addEventListener('keydown', onKey);
    viewport.addEventListener('scroll', onScroll); viewport.addEventListener('wheel', onInterrupt, { passive: true }); viewport.addEventListener('pointerdown', onInterrupt);
    let width = viewport.clientWidth;
    const resize = new ResizeObserver(() => { const nextWidth = viewport.clientWidth; if (nextWidth && nextWidth !== width) { width = nextWidth; go(pending ?? current, true); } else render(); });
    resize.observe(viewport); render();
    return { controls, viewport, refresh: render, destroy: () => {
      clearTimeout(timer); resize.disconnect(); delete root.dataset.enhanced; controls.hidden = true;
      for (const slide of items()) slide.removeAttribute('data-current');
      controls.removeEventListener('click', onClick); viewport.removeEventListener('keydown', onKey); viewport.removeEventListener('scroll', onScroll); viewport.removeEventListener('wheel', onInterrupt); viewport.removeEventListener('pointerdown', onInterrupt);
    } };
  };
  const discover = () => {
    for (const [root, record] of mounted) if (!root.isConnected) { record.destroy(); mounted.delete(root); }
    for (const root of doc.querySelectorAll<HTMLElement>('[data-slot="carousel"]')) {
      const existing = mounted.get(root);
      if (existing && existing.controls === root.querySelector(':scope > [data-slot="carousel-controls"]') && existing.viewport === root.querySelector(':scope > [data-slot="carousel-viewport"]')) { existing.refresh(); continue; }
      existing?.destroy(); mounted.delete(root);
      const record = setup(root); if (record) mounted.set(root, record);
    }
  };
  discover(); const observer = new MutationObserver(discover); observer.observe(doc.documentElement, { childList: true, subtree: true });
  return () => { observer.disconnect(); for (const record of mounted.values()) record.destroy(); mounted.clear(); };
}

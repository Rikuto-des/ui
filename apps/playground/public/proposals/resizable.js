
document.querySelectorAll('.r-handle').forEach(h => {
  const group = h.closest('.r-group');
  const set = v => { v = Math.min(80, Math.max(20, Math.round(v))); group.style.setProperty('--_size', v + '%'); h.setAttribute('aria-valuenow', v); };
  h.addEventListener('pointerdown', e => {
    h.setPointerCapture(e.pointerId); h.dataset.dragging = '';
    const move = ev => { const r = group.getBoundingClientRect(); set((ev.clientX - r.left) / r.width * 100); };
    const up = () => { delete h.dataset.dragging; h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up);
  });
  h.addEventListener('keydown', e => {
    const now = +h.getAttribute('aria-valuenow');
    const step = e.shiftKey ? 10 : 2;
    const next = { ArrowLeft: now - step, ArrowRight: now + step, Home: 20, End: 80 }[e.key];
    if (next != null) { e.preventDefault(); set(next); }
  });
});
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));

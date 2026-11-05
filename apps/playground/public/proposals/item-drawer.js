
document.querySelectorAll('.d-open').forEach(b => b.addEventListener('click', () => {
  const d = document.getElementById('drawer-' + b.dataset.drawer);
  d.style.position = 'absolute'; d.show(); d.style.setProperty('--_drag', '100%'); d.dataset.dragging = '';
  requestAnimationFrame(() => { delete d.dataset.dragging; requestAnimationFrame(() => d.style.setProperty('--_drag', '0px')); });
  d.querySelector('input')?.focus({ preventScroll: true });
}));
document.querySelectorAll('.d-sheet').forEach(d => {
  let start = null, last = 0, lastT = 0, v = 0;
  const close = () => { d.style.setProperty('--_drag', '100%'); setTimeout(() => { d.close(); d.style.setProperty('--_drag', '0px'); }, 280); };
  d.addEventListener('command', e => { if (e.command === 'close') { e.preventDefault(); close(); } });
  d.addEventListener('pointerdown', e => { if (e.target.closest('input, button')) return; start = e.clientY; last = e.clientY; lastT = e.timeStamp; d.setPointerCapture(e.pointerId); d.dataset.dragging = ''; });
  d.addEventListener('pointermove', e => { if (start == null) return; v = (e.clientY - last) / Math.max(1, e.timeStamp - lastT); last = e.clientY; lastT = e.timeStamp; d.style.setProperty('--_drag', Math.max(0, e.clientY - start) + 'px'); });
  const end = e => { if (start == null) return; const moved = e.clientY - start; start = null; delete d.dataset.dragging; if (moved > d.offsetHeight / 4 || v > 0.5) close(); else d.style.setProperty('--_drag', '0px'); };
  d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end);
  d.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
});
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));

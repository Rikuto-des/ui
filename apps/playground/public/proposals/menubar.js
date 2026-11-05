
const sync = () => document.querySelectorAll('.m-trigger').forEach(t => t.setAttribute('aria-expanded', String(document.getElementById(t.getAttribute('popovertarget')).matches(':popover-open'))));
document.addEventListener('toggle', () => requestAnimationFrame(sync), true);
document.addEventListener('pointerover', e => {
  const t = e.target.closest?.('.m-trigger'); if (!t) return;
  const bar = t.closest('.m-bar');
  const open = [...bar.querySelectorAll('.m-trigger')].find(o => document.getElementById(o.getAttribute('popovertarget')).matches(':popover-open'));
  if (open && open !== t) document.getElementById(t.getAttribute('popovertarget')).showPopover({ source: t });
});
document.addEventListener('keydown', e => {
  const t = e.target.closest?.('.m-trigger'); if (!t || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const all = [...t.closest('.m-bar').querySelectorAll('.m-trigger')];
  const next = all[(all.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
  all.forEach(o => o.tabIndex = o === next ? 0 : -1); next.focus(); e.preventDefault();
});
document.querySelectorAll('[data-set-pack]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.pack = b.dataset.setPack; document.querySelectorAll('[data-set-pack]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));
document.querySelectorAll('[data-set-theme]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.setTheme; document.querySelectorAll('[data-set-theme]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); }));

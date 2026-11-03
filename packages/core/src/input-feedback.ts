const TEXT = '[data-slot="textarea-control"]';
const FILE = '[data-slot="file-input-control"]';

/** Local feedback for native controls; no requests, uploads or custom input model. */
export function installInputFeedback(doc: Document = document): () => void {
  const win = doc.defaultView!;
  const textControls = new Set<HTMLElement>();
  const fileControls = new Map<HTMLElement, { files: File[]; urls: string[] }>();
  const resizeOriginal = new Map<HTMLTextAreaElement, string>();
  const supportsSizing = win.CSS.supports('field-sizing', 'content');
  const syncText = (root: HTMLElement) => {
    const input = root.querySelector('textarea');
    if (!input) return;
    const count = input.value.length, max = input.maxLength;
    const counter = root.querySelector<HTMLElement>('[data-slot="textarea-count"]');
    const budget = root.querySelector<HTMLElement>('[data-slot="textarea-budget"]');
    const text = max >= 0 ? `${count} / ${max}` : String(count);
    if (counter && counter.textContent !== text) counter.textContent = text;
    if (budget) budget.hidden = false;
    const ratio = max > 0 ? Math.min(count / max, 1) : 0;
    root.style.setProperty('--ur-text-budget', `${ratio * 100}%`);
    root.toggleAttribute('data-near-limit', max >= 0 && count >= max * .9);
    root.toggleAttribute('data-at-limit', max >= 0 && count >= max);
  };
  const resize = (input: HTMLTextAreaElement) => {
    if (supportsSizing || !input.hasAttribute('data-autoresize') || !input.clientWidth) return;
    if (!resizeOriginal.has(input)) resizeOriginal.set(input, input.style.height);
    const css = win.getComputedStyle(input);
    const line = parseFloat(css.lineHeight) || parseFloat(css.fontSize) * 1.5;
    const edges = parseFloat(css.paddingTop) + parseFloat(css.paddingBottom) + parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
    input.style.height = 'auto';
    input.style.height = `${Math.min(Math.max(input.scrollHeight + parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth), line * input.rows + edges), line * 12 + edges)}px`;
  };
  const release = (root: HTMLElement) => {
    for (const url of fileControls.get(root)?.urls ?? []) win.URL.revokeObjectURL(url);
    fileControls.delete(root);
  };
  const syncFiles = (root: HTMLElement, refresh = false) => {
    const input = root.querySelector<HTMLInputElement>('input[type="file"]');
    const list = root.querySelector<HTMLUListElement>('[data-slot="file-input-list"]');
    if (!input || !list) return;
    const files = Array.from(input.files ?? []), previous = fileControls.get(root);
    const disabled = input.matches(':disabled');
    if (refresh || !previous || previous.files.length !== files.length || previous.files.some((file, index) => file.name !== files[index].name || file.size !== files[index].size || file.lastModified !== files[index].lastModified || file.type !== files[index].type)) {
      release(root);
      const record = { files, urls: [] as string[] };
      fileControls.set(root, record);
      list.replaceChildren();
      files.forEach((file, index) => {
        const row = doc.createElement('li'); row.dataset.slot = 'file-input-item';
        const preview = doc.createElement('span'); preview.dataset.slot = 'file-input-preview'; preview.setAttribute('aria-hidden', 'true');
        preview.textContent = file.name.split('.').pop()?.slice(0, 4).toUpperCase() ?? 'FILE';
        if (/^image\/(png|jpeg|webp|gif|avif|svg\+xml)$/.test(file.type)) {
          const image = doc.createElement('img'); image.alt = ''; image.src = win.URL.createObjectURL(file); record.urls.push(image.src);
          preview.replaceChildren(image);
        }
        const details = doc.createElement('span'); details.dataset.slot = 'file-input-detail';
        const name = doc.createElement('span'); name.dataset.slot = 'file-input-name'; name.textContent = file.name;
        const size = doc.createElement('span'); size.dataset.slot = 'file-input-size';
        size.textContent = file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${Math.ceil(file.size / 1024)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`;
        details.append(name, size); row.append(preview, details);
        if (typeof win.DataTransfer === 'function') {
          const remove = doc.createElement('button'); remove.type = 'button'; remove.dataset.fileRemove = String(index);
          remove.setAttribute('aria-label', `${root.dataset.removeLabel ?? '取り除く'}: ${file.name}`); remove.textContent = '×'; row.append(remove);
        }
        list.append(row);
      });
      list.hidden = files.length === 0;
      const status = root.querySelector('[data-file-status]');
      const message = `${files.length}件のファイルを選択`;
      if (status && (previous || files.length > 0) && status.textContent !== message) status.textContent = message;
    }
    for (const button of list.querySelectorAll('button')) {
      if (button.disabled !== disabled) button.disabled = disabled;
      const name = files[Number(button.dataset.fileRemove)]?.name;
      const label = `${root.dataset.removeLabel ?? '取り除く'}: ${name ?? ''}`;
      if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
    }
  };
  const scan = () => {
    for (const root of textControls) if (!root.isConnected) textControls.delete(root);
    for (const root of fileControls.keys()) if (!root.isConnected) release(root);
    for (const [input, height] of resizeOriginal) if (!input.isConnected || !input.hasAttribute('data-autoresize')) {
      input.style.height = height; resizeOriginal.delete(input);
    }
    for (const root of doc.querySelectorAll<HTMLElement>(TEXT)) { textControls.add(root); syncText(root); }
    for (const root of doc.querySelectorAll<HTMLElement>(FILE)) syncFiles(root);
    for (const input of doc.querySelectorAll<HTMLTextAreaElement>('textarea[data-autoresize]')) resize(input);
  };
  const onInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof win.Element)) return;
    const text = target.closest<HTMLElement>(TEXT), file = target.closest<HTMLElement>(FILE);
    if (text) syncText(text);
    if (target instanceof win.HTMLTextAreaElement) resize(target);
    if (file) {
      syncFiles(file, true);
    }
  };
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof win.Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-file-remove]');
    const root = button?.closest<HTMLElement>(FILE), input = root?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!button || !root || !input || input.matches(':disabled')) return;
    const index = Number(button.dataset.fileRemove), transfer = new win.DataTransfer();
    Array.from(input.files ?? []).forEach((file, i) => { if (i !== index) transfer.items.add(file); });
    input.files = transfer.files;
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
    input.dispatchEvent(new win.Event('change', { bubbles: true }));
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-file-remove]');
    (buttons[Math.min(index, buttons.length - 1)] ?? input).focus({ preventScroll: true });
  };
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  const onReset = () => { clearTimeout(resetTimer); resetTimer = setTimeout(scan, 0); };
  const observer = new win.MutationObserver(scan);
  observer.observe(doc.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'maxlength', 'rows', 'data-autoresize', 'data-remove-label'] });
  doc.addEventListener('input', onInput); doc.addEventListener('change', onInput); doc.addEventListener('click', onClick); doc.addEventListener('reset', onReset);
  // Width changes also wrap text in browsers without field-sizing.
  win.addEventListener('resize', scan); doc.addEventListener('toggle', scan, true);
  scan();
  return () => {
    observer.disconnect(); clearTimeout(resetTimer);
    doc.removeEventListener('input', onInput); doc.removeEventListener('change', onInput); doc.removeEventListener('click', onClick); doc.removeEventListener('reset', onReset);
    win.removeEventListener('resize', scan); doc.removeEventListener('toggle', scan, true);
    for (const root of textControls) { const budget = root.querySelector<HTMLElement>('[data-slot="textarea-budget"]'); if (budget) budget.hidden = true; }
    for (const [input, height] of resizeOriginal) input.style.height = height;
    for (const root of fileControls.keys()) { release(root); const list = root.querySelector<HTMLElement>('[data-slot="file-input-list"]'); if (list) { list.hidden = true; list.replaceChildren(); } const status = root.querySelector('[data-file-status]'); if (status) status.textContent = ''; }
  };
}

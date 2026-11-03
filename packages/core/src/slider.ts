const CONTROL = '[data-slot="slider-control"]';

/** Value feedback and labelled stops, without replacing native range behavior. */
export function installSliders(doc: Document = document): () => void {
  const controls = new Set<HTMLElement>();
  const sync = (root: HTMLElement) => {
    const input = root.querySelector<HTMLInputElement>('input[type="range"]');
    if (!input) return;
    const value = input.valueAsNumber, min = Number(input.min || 0), max = Number(input.max || 100);
    const percent = max <= min ? 0 : Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
    const position = `${percent}%`;
    if (root.style.getPropertyValue('--ur-slider-progress') !== position) root.style.setProperty('--ur-slider-progress', position);
    const disabled = input.matches(':disabled');
    root.toggleAttribute('data-disabled', disabled);
    root.dataset.enhanced = '';
    const output = root.querySelector<HTMLOutputElement>('[data-slot="slider-value"]');
    const text = `${input.value}${root.dataset.suffix ?? ''}`;
    if (output && output.textContent !== text) output.textContent = text;
    for (const mark of root.querySelectorAll<HTMLButtonElement>('[data-slot="slider-mark"]')) {
      if (mark.disabled !== disabled) mark.disabled = disabled;
      const selected = String(Number(mark.dataset.value) === value);
      if (mark.getAttribute('aria-pressed') !== selected) mark.setAttribute('aria-pressed', selected);
    }
  };
  const discover = () => {
    for (const root of controls) if (!root.isConnected) controls.delete(root);
    for (const root of doc.querySelectorAll<HTMLElement>(CONTROL)) { controls.add(root); sync(root); }
  };
  const observer = new MutationObserver(discover);
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['value', 'min', 'max', 'disabled', 'data-suffix'] });
  const onInput = (event: Event) => {
    const root = (event.target as Element | null)?.closest<HTMLElement>(CONTROL);
    if (root) sync(root);
  };
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    const mark = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-slot="slider-mark"]');
    const root = mark?.closest<HTMLElement>(CONTROL), input = root?.querySelector<HTMLInputElement>('input[type="range"]');
    if (!mark || mark.disabled || !root || !input || input.matches(':disabled')) return;
    // Bypass React's value tracker so controlled onChange handlers see a real edit.
    const setter = Object.getOwnPropertyDescriptor(doc.defaultView!.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, mark.dataset.value!);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    sync(root);
  };
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  const onReset = () => { clearTimeout(resetTimer); resetTimer = setTimeout(discover, 0); };
  doc.addEventListener('input', onInput); doc.addEventListener('change', onInput); doc.addEventListener('click', onClick); doc.addEventListener('reset', onReset);
  discover();
  return () => {
    observer.disconnect(); clearTimeout(resetTimer);
    doc.removeEventListener('input', onInput); doc.removeEventListener('change', onInput); doc.removeEventListener('click', onClick); doc.removeEventListener('reset', onReset);
    for (const root of controls) {
      delete root.dataset.enhanced;
      for (const mark of root.querySelectorAll<HTMLButtonElement>('[data-slot="slider-mark"]')) mark.disabled = true;
    }
    controls.clear();
  };
}

/**
 * Context menus for `[data-slot~="context-menu-area"]`. A right-click, a long
 * press on touch, or Shift+F10 / the Menu key inside an area opens the menu it
 * names. The menu is anchored to an empty fixed point
 * (`[data-slot="context-menu-anchor"]`): this moves the point to the pointer,
 * or under the focused element for the keyboard, and anchor positioning flips
 * the menu at the viewport edges. Everything inside the menu is Menu's
 * behavior (installMenus). Without this script the browser's own menu shows.
 */
const AREA = '[data-slot~="context-menu-area"]';
const LONG_PRESS = 500;
const SLOP = 10;

export function installContextMenus(doc: Document = document): () => void {
  let press: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | undefined;
  // A keyboard open must not be repeated by the contextmenu event some browsers send after the key.
  let keyboardAt = 0;
  // Most browsers send contextmenu while the right button (or Ctrl+click on macOS, or a
  // finger) is still down. Releasing it would then light-dismiss the menu, so the menu
  // opens once the pointer is up.
  let pointerDown = false;
  let pending: (() => void) | undefined;

  const menuOf = (area: Element) => {
    const menu = doc.getElementById(area.getAttribute("data-menu") ?? "");
    return menu?.matches('[data-slot~="context-menu"]') ? menu : null;
  };

  function openAt(area: Element, x: number, y: number) {
    const menu = menuOf(area);
    const anchor = menu && doc.querySelector<HTMLElement>(`[data-slot="context-menu-anchor"][data-menu="${CSS.escape(menu.id)}"]`);
    if (!menu || !anchor) return false;
    anchor.style.setProperty("--_x", `${x}px`);
    anchor.style.setProperty("--_y", `${y}px`);
    // Reopen so focus starts on the first item again (Menu's toggle handler). The hide and
    // the show coalesce into one "open" toggle, so close the submenus here.
    if (menu.matches(":popover-open")) {
      for (const sub of menu.querySelectorAll<HTMLElement>("[data-sub]")) {
        if (sub.matches(":popover-open")) sub.hidePopover();
        sub.removeAttribute("data-inline-open");
      }
      for (const trigger of menu.querySelectorAll('[data-slot~="menu-sub-trigger"][aria-expanded="true"]')) trigger.setAttribute("aria-expanded", "false");
      menu.hidePopover();
    }
    menu.showPopover();
    return true;
  }

  const cancelPress = () => {
    if (press) clearTimeout(press.timer);
    press = undefined;
  };

  const onContextMenu = (event: MouseEvent) => {
    const area = (event.target as Element | null)?.closest?.(AREA);
    if (!area || event.defaultPrevented) return;
    cancelPress();
    if (Date.now() - keyboardAt < 500) return event.preventDefault();
    if (!menuOf(area)) return;
    event.preventDefault();
    const { clientX: x, clientY: y } = event;
    if (pointerDown) pending = () => openAt(area, x, y);
    else openAt(area, x, y);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!(event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))) return;
    const target = event.target as Element | null;
    const area = target?.closest?.(AREA);
    if (!area || !target) return;
    const r = target.getBoundingClientRect();
    const rtl = getComputedStyle(target).direction === "rtl";
    if (!openAt(area, rtl ? r.right : r.left, r.bottom)) return;
    event.preventDefault();
    keyboardAt = Date.now();
  };

  // iOS sends no contextmenu event for a long press; Android does, and then the timer is cancelled.
  const onPointerDown = (event: PointerEvent) => {
    cancelPress();
    pointerDown = true;
    pending = undefined;
    if (event.pointerType !== "touch") return;
    const area = (event.target as Element | null)?.closest?.(AREA);
    if (!area || !menuOf(area)) return;
    const { clientX: x, clientY: y } = event;
    press = { x, y, timer: setTimeout(() => { press = undefined; pending = () => openAt(area, x, y); }, LONG_PRESS) };
  };
  const onPointerMove = (event: PointerEvent) => {
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > SLOP) cancelPress();
  };

  const onPointerUp = () => {
    cancelPress();
    pointerDown = false;
    const open = pending;
    pending = undefined;
    // After this release has been handled, including its light dismiss.
    if (open) setTimeout(open);
  };

  doc.addEventListener("contextmenu", onContextMenu);
  doc.addEventListener("keydown", onKeyDown);
  doc.addEventListener("pointerdown", onPointerDown);
  doc.addEventListener("pointermove", onPointerMove);
  doc.addEventListener("pointerup", onPointerUp);
  doc.addEventListener("pointercancel", onPointerUp);
  return () => {
    cancelPress();
    doc.removeEventListener("contextmenu", onContextMenu);
    doc.removeEventListener("keydown", onKeyDown);
    doc.removeEventListener("pointerdown", onPointerDown);
    doc.removeEventListener("pointermove", onPointerMove);
    doc.removeEventListener("pointerup", onPointerUp);
    doc.removeEventListener("pointercancel", onPointerUp);
  };
}

"use client";

import { useCallback, useRef, type KeyboardEvent, type ReactNode } from "react";
import { IconButton, Tooltip } from "@yourlib/react";

type ToolbarAction = {
  id: "bold" | "italic" | "link" | "copy";
  label: string;
  shortcutLabel: string;
  ariaKeyShortcuts: string;
  icon: ReactNode;
};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const BoldIcon = () => (
  <svg {...iconProps}>
    <path d="M7 4h6.5a4 4 0 0 1 0 8H7z" />
    <path d="M7 12h7.5a4 4 0 0 1 0 8H7z" />
  </svg>
);

const ItalicIcon = () => (
  <svg {...iconProps}>
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const LinkIcon = () => (
  <svg {...iconProps}>
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
  </svg>
);

const CopyIcon = () => (
  <svg {...iconProps}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
);

const ACTIONS: ToolbarAction[] = [
  { id: "bold", label: "太字", shortcutLabel: "⌘B", ariaKeyShortcuts: "Meta+B", icon: <BoldIcon /> },
  { id: "italic", label: "斜体", shortcutLabel: "⌘I", ariaKeyShortcuts: "Meta+I", icon: <ItalicIcon /> },
  { id: "link", label: "リンク", shortcutLabel: "⌘K", ariaKeyShortcuts: "Meta+K", icon: <LinkIcon /> },
  { id: "copy", label: "コピー", shortcutLabel: "⌘C", ariaKeyShortcuts: "Meta+C", icon: <CopyIcon /> },
];

export type EditorToolbarProps = {
  onBold?: () => void;
  onItalic?: () => void;
  onLink?: () => void;
  onCopy?: () => void;
};

export function EditorToolbar({ onBold, onItalic, onLink, onCopy }: EditorToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handlers: Record<ToolbarAction["id"], (() => void) | undefined> = {
    bold: onBold,
    italic: onItalic,
    link: onLink,
    copy: onCopy,
  };

  // WAI-ARIA toolbar pattern: one Tab stop, arrow keys move between buttons.
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const root = toolbarRef.current;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
    const currentIndex = buttons.findIndex((b) => b === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % buttons.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = buttons.length - 1;
        break;
    }
    if (nextIndex === null) return;

    event.preventDefault();
    buttons.forEach((b, i) => (b.tabIndex = i === nextIndex ? 0 : -1));
    buttons[nextIndex].focus();
  }, []);

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="書式設定"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-md bg-gray-100 p-1"
    >
      {ACTIONS.map((action, index) => (
        <Tooltip key={action.id} content={`${action.label}（${action.shortcutLabel}）`}>
          <IconButton
            aria-label={action.label}
            aria-keyshortcuts={action.ariaKeyShortcuts}
            tabIndex={index === 0 ? 0 : -1}
            onClick={handlers[action.id]}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      ))}
    </div>
  );
}

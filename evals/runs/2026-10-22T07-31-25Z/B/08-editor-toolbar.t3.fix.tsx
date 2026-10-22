"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, Tooltip } from "@yourlib/react";

type ToolbarAction = "bold" | "italic" | "link" | "copy";

type ToolbarItem = {
  action: ToolbarAction;
  label: string;
  shortcut: string;
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
  focusable: "false" as const,
};

const BoldIcon = () => (
  <svg {...iconProps}>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
    <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
  </svg>
);

const ItalicIcon = () => (
  <svg {...iconProps}>
    <line x1="19" y1="5" x2="10" y2="5" />
    <line x1="14" y1="19" x2="5" y2="19" />
    <line x1="15" y1="5" x2="9" y2="19" />
  </svg>
);

const LinkIcon = () => (
  <svg {...iconProps}>
    <path d="M10 14a4.5 4.5 0 0 0 6.36 0l3-3a4.5 4.5 0 0 0-6.36-6.36l-1.5 1.5" />
    <path d="M14 10a4.5 4.5 0 0 0-6.36 0l-3 3a4.5 4.5 0 0 0 6.36 6.36l1.5-1.5" />
  </svg>
);

const CopyIcon = () => (
  <svg {...iconProps}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </svg>
);

const ITEMS: ToolbarItem[] = [
  { action: "bold", label: "太字", shortcut: "⌘B", ariaKeyShortcuts: "Meta+B", icon: <BoldIcon /> },
  { action: "italic", label: "斜体", shortcut: "⌘I", ariaKeyShortcuts: "Meta+I", icon: <ItalicIcon /> },
  { action: "link", label: "リンク", shortcut: "⌘K", ariaKeyShortcuts: "Meta+K", icon: <LinkIcon /> },
  { action: "copy", label: "コピー", shortcut: "⌘C", ariaKeyShortcuts: "Meta+C", icon: <CopyIcon /> },
];

export type EditorToolbarProps = {
  onAction?: (action: ToolbarAction) => void;
};

export function EditorToolbar({ onAction }: EditorToolbarProps) {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (index: number) => {
    const next = (index + ITEMS.length) % ITEMS.length;
    setActiveIndex(next);
    buttonRefs.current[next]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(activeIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveFocus(0);
        break;
      case "End":
        event.preventDefault();
        moveFocus(ITEMS.length - 1);
        break;
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="書式"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-md p-1"
      style={{ backgroundColor: "var(--yl-color-surface)" }}
    >
      {ITEMS.map((item, index) => (
        <Tooltip
          key={item.action}
          id={`${baseId}-tooltip-${item.action}`}
          content={`${item.label}（${item.shortcut}）`}
        >
          <Button
            ref={(el: HTMLButtonElement | null) => {
              buttonRefs.current[index] = el;
            }}
            aria-label={item.label}
            aria-keyshortcuts={item.ariaKeyShortcuts}
            tabIndex={index === activeIndex ? 0 : -1}
            onFocus={() => setActiveIndex(index)}
            onClick={() => onAction?.(item.action)}
          >
            {item.icon}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}

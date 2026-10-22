"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconButton, Tooltip } from "@yourlib/react";

type ToolbarAction = "bold" | "italic" | "link" | "copy";

type ToolbarItem = {
  id: ToolbarAction;
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

const ITEMS: ToolbarItem[] = [
  { id: "bold", label: "太字", shortcutLabel: "⌘B", ariaKeyShortcuts: "Meta+B", icon: <BoldIcon /> },
  { id: "italic", label: "斜体", shortcutLabel: "⌘I", ariaKeyShortcuts: "Meta+I", icon: <ItalicIcon /> },
  { id: "link", label: "リンク", shortcutLabel: "⌘K", ariaKeyShortcuts: "Meta+K", icon: <LinkIcon /> },
  { id: "copy", label: "コピー", shortcutLabel: "⌘C", ariaKeyShortcuts: "Meta+C", icon: <CopyIcon /> },
];

export type EditorToolbarProps = {
  onAction?: (action: ToolbarAction) => void;
  "aria-controls"?: string;
};

export function EditorToolbar({ onAction, "aria-controls": ariaControls }: EditorToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const focusItem = (index: number) => {
    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>("[data-toolbar-item]");
    if (!buttons || buttons.length === 0) return;
    const next = (index + buttons.length) % buttons.length;
    setActiveIndex(next);
    buttons[next]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusItem(activeIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusItem(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(ITEMS.length - 1);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      role="toolbar"
      aria-label="書式設定"
      aria-orientation="horizontal"
      aria-controls={ariaControls}
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-md bg-gray-100 p-1"
    >
      {ITEMS.map((item, index) => (
        <Tooltip key={item.id} content={`${item.label}（${item.shortcutLabel}）`}>
          <IconButton
            data-toolbar-item
            aria-label={item.label}
            aria-keyshortcuts={item.ariaKeyShortcuts}
            tabIndex={index === activeIndex ? 0 : -1}
            onFocus={() => setActiveIndex(index)}
            onClick={() => onAction?.(item.id)}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}
    </div>
  );
}

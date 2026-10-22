"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconButton, Tooltip } from "@yourlib/react";

type ToolbarAction = {
  id: "bold" | "italic" | "link" | "copy";
  label: string;
  shortcut: string;
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
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ACTIONS: ToolbarAction[] = [
  { id: "bold", label: "太字", shortcut: "⌘B", icon: <BoldIcon /> },
  { id: "italic", label: "斜体", shortcut: "⌘I", icon: <ItalicIcon /> },
  { id: "link", label: "リンク", shortcut: "⌘K", icon: <LinkIcon /> },
  { id: "copy", label: "コピー", shortcut: "⌘C", icon: <CopyIcon /> },
];

export type EditorToolbarProps = {
  onBold?: () => void;
  onItalic?: () => void;
  onLink?: () => void;
  onCopy?: () => void;
  className?: string;
};

export function EditorToolbar({
  onBold,
  onItalic,
  onLink,
  onCopy,
  className = "",
}: EditorToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlers: Record<ToolbarAction["id"], (() => void) | undefined> = {
    bold: onBold,
    italic: onItalic,
    link: onLink,
    copy: onCopy,
  };

  // WAI-ARIA の toolbar パターンに沿った矢印キー移動（ロービングタブインデックス）
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = ACTIONS.length - 1;
    let next: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        next = activeIndex === last ? 0 : activeIndex + 1;
        break;
      case "ArrowLeft":
        next = activeIndex === 0 ? last : activeIndex - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveIndex(next);
    const buttons =
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-toolbar-item]"
      );
    buttons?.[next]?.focus();
  };

  return (
    <div
      ref={containerRef}
      role="toolbar"
      aria-label="文字の書式"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center gap-1 rounded-md bg-gray-100 p-1 ${className}`}
    >
      {ACTIONS.map((action, index) => {
        const description = `${action.label}（${action.shortcut}）`;
        return (
          <Tooltip key={action.id} content={description}>
            <IconButton
              data-toolbar-item=""
              aria-label={action.label}
              aria-keyshortcuts={action.shortcut.replace("⌘", "Meta+")}
              tabIndex={index === activeIndex ? 0 : -1}
              onFocus={() => setActiveIndex(index)}
              onClick={() => handlers[action.id]?.()}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
}

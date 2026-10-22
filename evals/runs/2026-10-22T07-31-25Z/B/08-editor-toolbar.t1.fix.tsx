"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Button, Tooltip } from "@yourlib/react";

type EditorToolbarProps = {
  onBold?: () => void;
  onItalic?: () => void;
  onLink?: () => void;
  onCopy?: () => void;
};

type ToolbarAction = {
  id: string;
  label: string;
  shortcutLabel: string;
  ariaKeyShortcuts: string;
  icon: ReactNode;
  onClick?: () => void;
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

function BoldIcon() {
  return (
    <svg {...iconProps}>
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg {...iconProps}>
      <line x1="19" y1="5" x2="10" y2="5" />
      <line x1="14" y1="19" x2="5" y2="19" />
      <line x1="15" y1="5" x2="9" y2="19" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

export function EditorToolbar({
  onBold,
  onItalic,
  onLink,
  onCopy,
}: EditorToolbarProps) {
  const baseId = useId();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const actions: ToolbarAction[] = [
    {
      id: "bold",
      label: "太字",
      shortcutLabel: "⌘B",
      ariaKeyShortcuts: "Meta+B",
      icon: <BoldIcon />,
      onClick: onBold,
    },
    {
      id: "italic",
      label: "斜体",
      shortcutLabel: "⌘I",
      ariaKeyShortcuts: "Meta+I",
      icon: <ItalicIcon />,
      onClick: onItalic,
    },
    {
      id: "link",
      label: "リンク",
      shortcutLabel: "⌘K",
      ariaKeyShortcuts: "Meta+K",
      icon: <LinkIcon />,
      onClick: onLink,
    },
    {
      id: "copy",
      label: "コピー",
      shortcutLabel: "⌘C",
      ariaKeyShortcuts: "Meta+C",
      icon: <CopyIcon />,
      onClick: onCopy,
    },
  ];

  const focusButtonAt = (index: number) => {
    const buttons =
      toolbarRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-toolbar-item]",
      );
    if (!buttons || buttons.length === 0) return;
    const next = (index + buttons.length) % buttons.length;
    setActiveIndex(next);
    buttons[next]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusButtonAt(activeIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusButtonAt(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusButtonAt(0);
        break;
      case "End":
        event.preventDefault();
        focusButtonAt(actions.length - 1);
        break;
    }
  };

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="文字書式"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-md p-1"
      style={{ backgroundColor: "var(--yl-color-secondary)" }}
    >
      {actions.map((action, index) => {
        const tooltipId = `${baseId}-${action.id}-tooltip`;
        return (
          <Tooltip
            key={action.id}
            id={tooltipId}
            content={`${action.label}（${action.shortcutLabel}）`}
          >
            <Button
              data-toolbar-item=""
              aria-label={action.label}
              aria-describedby={tooltipId}
              aria-keyshortcuts={action.ariaKeyShortcuts}
              tabIndex={index === activeIndex ? 0 : -1}
              onFocus={() => setActiveIndex(index)}
              onClick={action.onClick}
            >
              {action.icon}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}

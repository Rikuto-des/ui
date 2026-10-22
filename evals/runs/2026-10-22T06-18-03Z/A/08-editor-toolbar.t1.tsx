"use client";

import { Tooltip } from "@yourlib/react";

type EditorToolbarProps = {
  /** id prefix so several toolbars can sit on one page without id clashes */
  idPrefix?: string;
  onBold?: () => void;
  onItalic?: () => void;
  onLink?: () => void;
  onCopy?: () => void;
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
      <line x1="10" y1="5" x2="18" y2="5" />
      <line x1="6" y1="19" x2="14" y2="19" />
      <line x1="14" y1="5" x2="10" y2="19" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

export function EditorToolbar({
  idPrefix = "editor-toolbar",
  onBold,
  onItalic,
  onLink,
  onCopy,
}: EditorToolbarProps) {
  const tools = [
    { key: "bold", label: "太字", hint: "太字（⌘B）", icon: <BoldIcon />, onClick: onBold },
    { key: "italic", label: "斜体", hint: "斜体（⌘I）", icon: <ItalicIcon />, onClick: onItalic },
    { key: "link", label: "リンク", hint: "リンクを挿入（⌘K）", icon: <LinkIcon />, onClick: onLink },
    { key: "copy", label: "コピー", hint: "クリップボードにコピー（⌘C）", icon: <CopyIcon />, onClick: onCopy },
  ];

  return (
    // Pack and density are inherited from the page (data-pack on <html>).
    // Light gray background uses a semantic surface token instead of a raw color.
    <div
      role="toolbar"
      aria-label="書式"
      className="flex items-center gap-1 rounded-md p-1"
      style={{ background: "var(--yl-color-surface-muted)" }}
    >
      {tools.map((tool) => {
        const tooltipId = `${idPrefix}-tip-${tool.key}`;
        return (
          <span key={tool.key} className="contents">
            <Tooltip.Trigger
              tooltip={tooltipId}
              variant="ghost"
              size="sm"
              type="button"
              aria-label={tool.label}
              onClick={tool.onClick}
            >
              {tool.icon}
            </Tooltip.Trigger>
            <Tooltip id={tooltipId} side="bottom">
              {tool.hint}
            </Tooltip>
          </span>
        );
      })}
    </div>
  );
}

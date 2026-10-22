"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconButton, Tooltip } from "@yourlib/react";

type ToolbarAction = "bold" | "italic" | "link" | "copy";

export type EditorToolbarProps = {
  /** 太字ボタンが押されたとき */
  onBold?: () => void;
  /** 斜体ボタンが押されたとき */
  onItalic?: () => void;
  /** リンクボタンが押されたとき */
  onLink?: () => void;
  /** コピーボタンが押されたとき。未指定なら getCopyText の内容をクリップボードへコピー */
  onCopy?: () => void | Promise<void>;
  /** コピー対象のテキストを返す関数 */
  getCopyText?: () => string;
  /** 太字が有効な状態か */
  boldActive?: boolean;
  /** 斜体が有効な状態か */
  italicActive?: boolean;
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
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

type ToolbarItem = {
  id: ToolbarAction;
  label: string;
  shortcut: string;
  ariaShortcut: string;
  icon: ReactNode;
};

const ITEMS: ToolbarItem[] = [
  { id: "bold", label: "太字", shortcut: "⌘B", ariaShortcut: "Meta+B", icon: <BoldIcon /> },
  { id: "italic", label: "斜体", shortcut: "⌘I", ariaShortcut: "Meta+I", icon: <ItalicIcon /> },
  { id: "link", label: "リンク", shortcut: "⌘K", ariaShortcut: "Meta+K", icon: <LinkIcon /> },
  { id: "copy", label: "コピー", shortcut: "⌘C", ariaShortcut: "Meta+C", icon: <CopyIcon /> },
];

export function EditorToolbar({
  onBold,
  onItalic,
  onLink,
  onCopy,
  getCopyText,
  boldActive = false,
  italicActive = false,
}: EditorToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [status, setStatus] = useState("");

  const handleCopy = useCallback(async () => {
    try {
      if (onCopy) {
        await onCopy();
      } else {
        await navigator.clipboard.writeText(getCopyText?.() ?? "");
      }
      setStatus("コピーしました");
    } catch {
      setStatus("コピーできませんでした");
    }
    window.setTimeout(() => setStatus(""), 2000);
  }, [onCopy, getCopyText]);

  const handleAction = (id: ToolbarAction) => {
    switch (id) {
      case "bold":
        onBold?.();
        break;
      case "italic":
        onItalic?.();
        break;
      case "link":
        onLink?.();
        break;
      case "copy":
        void handleCopy();
        break;
    }
  };

  // WAI-ARIA toolbar パターン：矢印キー / Home / End でボタン間を移動
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = ITEMS.length - 1;
    let next: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        next = focusIndex === last ? 0 : focusIndex + 1;
        break;
      case "ArrowLeft":
        next = focusIndex === 0 ? last : focusIndex - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
    }

    if (next === null) return;
    event.preventDefault();
    setFocusIndex(next);
    const buttons = toolbarRef.current?.querySelectorAll<HTMLButtonElement>("[data-toolbar-item]");
    buttons?.[next]?.focus();
  };

  const pressedState = (id: ToolbarAction): boolean | undefined => {
    if (id === "bold") return boldActive;
    if (id === "italic") return italicActive;
    return undefined;
  };

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="文章の書式"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-md bg-gray-100 p-1"
    >
      {ITEMS.map((item, index) => {
        const tooltipText =
          item.id === "copy" && status ? status : `${item.label}（${item.shortcut}）`;

        return (
          <Tooltip key={item.id} content={tooltipText}>
            <IconButton
              data-toolbar-item=""
              variant="ghost"
              size="sm"
              aria-label={item.label}
              aria-keyshortcuts={item.ariaShortcut}
              aria-pressed={pressedState(item.id)}
              tabIndex={index === focusIndex ? 0 : -1}
              onFocus={() => setFocusIndex(index)}
              onClick={() => handleAction(item.id)}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        );
      })}

      <span role="status" aria-live="polite" className="sr-only">
        {status}
      </span>
    </div>
  );
}

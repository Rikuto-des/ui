"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Button, Tooltip } from "@yourlib/react";

type EditorToolbarProps = {
  onBold?: () => void;
  onItalic?: () => void;
  onLink?: () => void;
  /** Called when the copy button is pressed. If it returns a Promise, the "copied" message appears after it resolves. */
  onCopy?: () => void | Promise<void>;
  className?: string;
};

function BoldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="19" y1="5" x2="10" y2="5" />
      <line x1="14" y1="19" x2="5" y2="19" />
      <line x1="15" y1="5" x2="9" y2="19" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function EditorToolbar({
  onBold,
  onItalic,
  onLink,
  onCopy,
  className = "",
}: EditorToolbarProps) {
  const baseId = useId();
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await onCopy?.();
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const items = [
    {
      key: "bold",
      label: "太字",
      shortcut: "⌘B",
      ariaShortcut: "Meta+B",
      icon: <BoldIcon />,
      onClick: onBold,
    },
    {
      key: "italic",
      label: "斜体",
      shortcut: "⌘I",
      ariaShortcut: "Meta+I",
      icon: <ItalicIcon />,
      onClick: onItalic,
    },
    {
      key: "link",
      label: "リンク",
      shortcut: "⌘K",
      ariaShortcut: "Meta+K",
      icon: <LinkIcon />,
      onClick: onLink,
    },
    {
      key: "copy",
      label: "コピー",
      shortcut: "⌘C",
      ariaShortcut: "Meta+C",
      icon: <CopyIcon />,
      onClick: handleCopy,
    },
  ];

  // Roving tabindex: Tab enters/leaves the toolbar; arrow keys move between buttons
  const focusButton = (index: number) => {
    const buttons =
      toolbarRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!buttons || buttons.length === 0) return;
    const next = (index + buttons.length) % buttons.length;
    setActiveIndex(next);
    buttons[next]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusButton(activeIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusButton(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusButton(0);
        break;
      case "End":
        event.preventDefault();
        focusButton(items.length - 1);
        break;
    }
  };

  return (
    <>
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="書式設定"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-1 rounded-md p-1 ${className}`}
        style={{ backgroundColor: "var(--yl-color-secondary)" }}
      >
        {items.map((item, index) => {
          const tooltipId = `${baseId}-${item.key}-tooltip`;
          const tooltipText =
            item.key === "copy" && copied
              ? "コピーしました"
              : `${item.label}（${item.shortcut}）`;

          return (
            <Tooltip key={item.key} id={tooltipId} content={tooltipText}>
              <Button
                aria-label={item.label}
                aria-keyshortcuts={item.ariaShortcut}
                tabIndex={index === activeIndex ? 0 : -1}
                onFocus={() => setActiveIndex(index)}
                onClick={item.onClick}
              >
                {item.icon}
              </Button>
            </Tooltip>
          );
        })}
      </div>

      {/* Announces the copy result to screen readers */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "コピーしました" : ""}
      </span>
    </>
  );
}

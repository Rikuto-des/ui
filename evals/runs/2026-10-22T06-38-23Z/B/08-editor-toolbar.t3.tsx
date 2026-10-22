"use client";

import type { ReactNode, SVGProps } from "react";
import { IconButton, Tooltip } from "@yourlib/react";

type IconProps = SVGProps<SVGSVGElement>;

function BoldIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  );
}

function ItalicIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function LinkIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function CopyIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

type ToolbarAction = {
  id: "bold" | "italic" | "link" | "copy";
  label: string;
  shortcutLabel: string;
  ariaKeyShortcuts: string;
  icon: ReactNode;
};

const ACTIONS: ToolbarAction[] = [
  {
    id: "bold",
    label: "太字",
    shortcutLabel: "⌘B",
    ariaKeyShortcuts: "Meta+B",
    icon: <BoldIcon />,
  },
  {
    id: "italic",
    label: "斜体",
    shortcutLabel: "⌘I",
    ariaKeyShortcuts: "Meta+I",
    icon: <ItalicIcon />,
  },
  {
    id: "link",
    label: "リンク",
    shortcutLabel: "⌘K",
    ariaKeyShortcuts: "Meta+K",
    icon: <LinkIcon />,
  },
  {
    id: "copy",
    label: "コピー",
    shortcutLabel: "⌘C",
    ariaKeyShortcuts: "Meta+C",
    icon: <CopyIcon />,
  },
];

export type EditorToolbarProps = {
  onBold?: () => void;
  onItalic?: () => void;
  onLink?: () => void;
  onCopy?: () => void;
};

export function EditorToolbar({
  onBold,
  onItalic,
  onLink,
  onCopy,
}: EditorToolbarProps) {
  const handlers: Record<ToolbarAction["id"], (() => void) | undefined> = {
    bold: onBold,
    italic: onItalic,
    link: onLink,
    copy: onCopy,
  };

  return (
    <div
      role="toolbar"
      aria-label="文章の書式"
      className="inline-flex items-center gap-1 rounded-md bg-gray-100 p-1"
    >
      {ACTIONS.map((action) => {
        const tooltipText = `${action.label}（${action.shortcutLabel}）`;
        return (
          <Tooltip key={action.id} content={tooltipText}>
            <IconButton
              aria-label={action.label}
              aria-keyshortcuts={action.ariaKeyShortcuts}
              onClick={handlers[action.id]}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
}

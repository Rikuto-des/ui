import { Tooltip } from "@yourlib/react";

type ToolbarAction = {
  id: string;
  label: string;
  hint: string;
  shortcut: string;
  icon: React.ReactNode;
};

function IconBold() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 4h6.5a4 4 0 0 1 0 8H7z" />
      <path d="M7 12h7.5a4 4 0 0 1 0 8H7z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg
      width="16"
      height="16"
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

function IconCopy() {
  return (
    <svg
      width="16"
      height="16"
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

const actions: ToolbarAction[] = [
  { id: "bold", label: "太字", hint: "太字（⌘B）", shortcut: "Meta+B", icon: <IconBold /> },
  { id: "italic", label: "斜体", hint: "斜体（⌘I）", shortcut: "Meta+I", icon: <IconItalic /> },
  { id: "link", label: "リンク", hint: "リンク（⌘K）", shortcut: "Meta+K", icon: <IconLink /> },
  { id: "copy", label: "コピー", hint: "コピー（⌘C）", shortcut: "Meta+C", icon: <IconCopy /> },
];

export function EditorToolbar() {
  return (
    <div
      role="toolbar"
      aria-label="書式"
      className="flex items-center gap-1 p-1"
      style={{
        // 薄いグレーの背景はパックのトークンから取る（生の色値や Tailwind のパレット色は使わない）
        background: "var(--yl-color-surface)",
        border: "var(--yl-border-width) solid var(--yl-color-border)",
        borderRadius: "var(--yl-radius-panel)",
      }}
    >
      {actions.map((action) => (
        <span key={action.id} className="contents">
          <Tooltip.Trigger
            tooltip={`tip-editor-${action.id}`}
            variant="ghost"
            size="sm"
            aria-label={action.label}
            aria-keyshortcuts={action.shortcut}
          >
            {action.icon}
          </Tooltip.Trigger>
          <Tooltip id={`tip-editor-${action.id}`} side="bottom">
            {action.hint}
          </Tooltip>
        </span>
      ))}
    </div>
  );
}

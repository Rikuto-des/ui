// 文章エディタ上部のツールバー。
// 背景の「薄いグレー」は、生の色や Tailwind のパレット色（bg-gray-100 など）を使わず、
// パックのトークン --yl-color-surface で指定しています。
// そのため実際の色は有効なパックによって変わります。
// ボタン同士の 4px の間隔は Tailwind の gap-1 で空けています。
import { Tooltip } from "@yourlib/react";

type ToolbarAction = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
};

function BoldIcon() {
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
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  );
}

function ItalicIcon() {
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
      <line x1="19" y1="5" x2="10" y2="5" />
      <line x1="14" y1="19" x2="5" y2="19" />
      <line x1="15" y1="5" x2="9" y2="19" />
    </svg>
  );
}

function LinkIcon() {
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

function CopyIcon() {
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
  { id: "bold", label: "太字", hint: "太字（⌘B）", icon: <BoldIcon /> },
  { id: "italic", label: "斜体", hint: "斜体（⌘I）", icon: <ItalicIcon /> },
  { id: "link", label: "リンク", hint: "リンクを挿入（⌘K）", icon: <LinkIcon /> },
  { id: "copy", label: "コピー", hint: "クリップボードにコピー（⌘C）", icon: <CopyIcon /> },
];

export function EditorToolbar() {
  return (
    <div
      role="toolbar"
      aria-label="書式"
      className="flex items-center gap-1 p-1"
      style={{
        background: "var(--yl-color-surface)",
        borderBottom: "var(--yl-border-width) solid var(--yl-color-border)",
        borderRadius: "var(--yl-radius-control)",
      }}
    >
      {actions.map((action) => {
        const tooltipId = `editor-toolbar-tip-${action.id}`;
        return (
          <div key={action.id}>
            <Tooltip.Trigger
              tooltip={tooltipId}
              aria-label={action.label}
              variant="ghost"
              size="sm"
            >
              {action.icon}
            </Tooltip.Trigger>
            <Tooltip id={tooltipId} side="bottom">
              {action.hint}
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

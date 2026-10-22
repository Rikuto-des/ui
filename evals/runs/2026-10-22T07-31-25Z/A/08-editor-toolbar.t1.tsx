import { Tooltip } from "@yourlib/react";

type ToolbarAction = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
};

const iconProps = {
  width: 16,
  height: 16,
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
      aria-orientation="horizontal"
      // 薄いグレーの背景はパックのトークン（surface）から取ります。生の色や Tailwind のパレット色は使いません。
      className="inline-flex items-center gap-1 p-1"
      style={{
        background: "var(--yl-color-surface)",
        border: "var(--yl-border-width) solid var(--yl-color-border)",
        borderRadius: "var(--yl-radius-control)",
      }}
    >
      {actions.map((action) => (
        <span key={action.id} className="contents">
          <Tooltip.Trigger
            tooltip={`tip-editor-${action.id}`}
            aria-label={action.label}
            variant="ghost"
            size="sm"
            type="button"
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

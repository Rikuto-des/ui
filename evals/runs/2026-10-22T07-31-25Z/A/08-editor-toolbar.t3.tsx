import { Tooltip } from "@yourlib/react";

type ToolbarItem = {
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

const items: ToolbarItem[] = [
  {
    id: "tip-editor-bold",
    label: "太字",
    hint: "太字（⌘B）",
    icon: (
      <svg {...iconProps}>
        <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
        <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
      </svg>
    ),
  },
  {
    id: "tip-editor-italic",
    label: "斜体",
    hint: "斜体（⌘I）",
    icon: (
      <svg {...iconProps}>
        <line x1="19" y1="5" x2="10" y2="5" />
        <line x1="14" y1="19" x2="5" y2="19" />
        <line x1="15" y1="5" x2="9" y2="19" />
      </svg>
    ),
  },
  {
    id: "tip-editor-link",
    label: "リンク",
    hint: "リンクを挿入（⌘K）",
    icon: (
      <svg {...iconProps}>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </svg>
    ),
  },
  {
    id: "tip-editor-copy",
    label: "コピー",
    hint: "クリップボードにコピー（⌘C）",
    icon: (
      <svg {...iconProps}>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
      </svg>
    ),
  },
];

export function EditorToolbar() {
  return (
    <div
      role="toolbar"
      aria-label="書式"
      className="inline-flex items-center gap-1 p-1"
      style={{
        // 薄いグレーの背景はパックのトークンから取る（生の色値やパレット色は使わない）
        background: "var(--yl-color-surface)",
        borderRadius: "var(--yl-radius-control)",
        border: "var(--yl-border-width) solid var(--yl-color-border)",
      }}
    >
      {items.map((item) => (
        <span key={item.id} className="contents">
          <Tooltip.Trigger
            tooltip={item.id}
            aria-label={item.label}
            variant="ghost"
            size="sm"
            type="button"
          >
            {item.icon}
          </Tooltip.Trigger>
          <Tooltip id={item.id} side="bottom">
            {item.hint}
          </Tooltip>
        </span>
      ))}
    </div>
  );
}

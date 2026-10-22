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

const actions: ToolbarAction[] = [
  {
    id: "editor-tip-bold",
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
    id: "editor-tip-italic",
    label: "斜体",
    hint: "斜体（⌘I）",
    icon: (
      <svg {...iconProps}>
        <path d="M10 5h8" />
        <path d="M6 19h8" />
        <path d="M14 5l-4 14" />
      </svg>
    ),
  },
  {
    id: "editor-tip-link",
    label: "リンク",
    hint: "リンク（⌘K）",
    icon: (
      <svg {...iconProps}>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </svg>
    ),
  },
  {
    id: "editor-tip-copy",
    label: "コピー",
    hint: "コピー（⌘C）",
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
      aria-label="文章の書式"
      className="inline-flex items-center gap-1 p-1"
      style={{
        // 薄いグレーの面は pack のトークンから取る（生の色値や Tailwind のパレット色は使わない）
        background: "var(--yl-color-surface)",
        border: "var(--yl-border-width) solid var(--yl-color-border)",
        borderRadius: "var(--yl-radius-control)",
      }}
    >
      {actions.map((action) => (
        <span key={action.id}>
          <Tooltip.Trigger
            tooltip={action.id}
            variant="ghost"
            size="sm"
            type="button"
            aria-label={action.label}
          >
            {action.icon}
          </Tooltip.Trigger>
          <Tooltip id={action.id} side="bottom">
            {action.hint}
          </Tooltip>
        </span>
      ))}
    </div>
  );
}

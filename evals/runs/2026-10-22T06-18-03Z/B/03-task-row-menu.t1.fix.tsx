"use client";

import {
  Badge,
  IconButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@yourlib/react";

export type TaskStatus = "未着手" | "対応中" | "完了";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
};

export type TaskListProps = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

const statusTone: Record<TaskStatus, "neutral" | "info" | "success"> = {
  未着手: "neutral",
  対応中: "info",
  完了: "success",
};

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

export function TaskList({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--yl-color-text-subtle)]">
        タスクはありません。
      </p>
    );
  }

  return (
    <ul
      aria-label="タスク一覧"
      className="divide-y divide-[var(--yl-color-border)] rounded-md border border-[var(--yl-color-border)]"
    >
      {tasks.map((task) => {
        const menuLabel = `「${task.title}」の操作`;

        return (
          <li key={task.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[var(--yl-color-text)]">
                {task.title}
              </p>
              <p className="text-sm text-[var(--yl-color-text-subtle)]">
                <span className="sr-only">担当者: </span>
                {task.assignee}
              </p>
            </div>

            <Badge tone={statusTone[task.status]}>
              <span className="sr-only">状態: </span>
              {task.status}
            </Badge>

            <Menu id={`task-menu-${task.id}`} label={menuLabel}>
              <MenuTrigger>
                <IconButton variant="ghost" aria-label={menuLabel}>
                  <MoreIcon />
                </IconButton>
              </MenuTrigger>
              <MenuContent align="end">
                <MenuItem onSelect={() => onEdit?.(task)}>編集</MenuItem>
                <MenuItem onSelect={() => onDuplicate?.(task)}>複製</MenuItem>
                <MenuItem tone="danger" onSelect={() => onDelete?.(task)}>
                  削除
                </MenuItem>
              </MenuContent>
            </Menu>
          </li>
        );
      })}
    </ul>
  );
}

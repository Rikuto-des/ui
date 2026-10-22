"use client";

import { Badge, Button, Menu } from "@yourlib/react";

export type TaskStatus = "未着手" | "対応中" | "完了";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeName: string;
};

export type TaskListProps = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

const statusBadgeVariant: Record<TaskStatus, "neutral" | "info" | "success"> = {
  未着手: "neutral",
  対応中: "info",
  完了: "success",
};

const mutedTextStyle = { color: "var(--yl-color-text-muted)" } as const;

export function TaskList({ tasks, onEdit, onDuplicate, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p
        className="rounded-md border border-dashed px-4 py-8 text-center text-sm"
        style={mutedTextStyle}
      >
        タスクはありません
      </p>
    );
  }

  return (
    <ul aria-label="タスク一覧" className="divide-y rounded-md border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 px-4 py-3">
          <Badge variant={statusBadgeVariant[task.status]} className="shrink-0">
            {task.status}
          </Badge>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{task.title}</p>
            <p className="truncate text-sm" style={mutedTextStyle}>
              担当: {task.assigneeName}
            </p>
          </div>

          <Menu
            id={`task-menu-${task.id}`}
            label={`「${task.title}」の操作`}
          >
            <Menu.Trigger>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`「${task.title}」の操作メニュー`}
              >
                <span aria-hidden="true">…</span>
              </Button>
            </Menu.Trigger>
            <Menu.Item onSelect={() => onEdit?.(task)}>編集</Menu.Item>
            <Menu.Item onSelect={() => onDuplicate?.(task)}>複製</Menu.Item>
            <Menu.Item variant="danger" onSelect={() => onDelete?.(task)}>
              削除
            </Menu.Item>
          </Menu>
        </li>
      ))}
    </ul>
  );
}

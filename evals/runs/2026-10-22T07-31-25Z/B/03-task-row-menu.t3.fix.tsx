"use client";

import { Badge, Button, Menu } from "@yourlib/react";

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

const statusTone: Record<TaskStatus, "neutral" | "accent" | "ok"> = {
  未着手: "neutral",
  対応中: "accent",
  完了: "ok",
};

export function TaskList({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p
        className="rounded-md border border-dashed p-6 text-center text-sm"
        style={{
          borderColor: "var(--yl-color-border-strong)",
          color: "var(--yl-color-text-muted)",
        }}
      >
        タスクはありません
      </p>
    );
  }

  return (
    <ul
      aria-label="タスク一覧"
      className="rounded-md border"
      style={{ borderColor: "var(--yl-color-border)" }}
    >
      {tasks.map((task) => {
        const menuId = `task-menu-${task.id}`;

        return (
          <li
            key={task.id}
            className="flex items-center gap-4 border-t px-4 py-3 first:border-t-0"
            style={{ borderColor: "var(--yl-color-border)" }}
          >
            <Badge tone={statusTone[task.status]} className="shrink-0">
              {task.status}
            </Badge>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-medium"
                style={{ color: "var(--yl-color-text)" }}
              >
                {task.title}
              </p>
              <p
                className="truncate text-xs"
                style={{ color: "var(--yl-color-text-muted)" }}
              >
                担当: {task.assignee}
              </p>
            </div>

            <Menu.Trigger menu={menuId}>
              <Button aria-label={`「${task.title}」の操作メニュー`}>
                <span aria-hidden="true">…</span>
              </Button>
            </Menu.Trigger>

            <Menu id={menuId} label={`「${task.title}」の操作`}>
              <Menu.Item onSelect={() => onEdit?.(task)}>編集</Menu.Item>
              <Menu.Item onSelect={() => onDuplicate?.(task)}>複製</Menu.Item>
              <Menu.Item onSelect={() => onDelete?.(task)}>削除</Menu.Item>
            </Menu>
          </li>
        );
      })}
    </ul>
  );
}

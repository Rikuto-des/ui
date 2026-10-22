"use client";

import { Badge, Menu } from "@yourlib/react";

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

export function TaskList({ tasks, onEdit, onDuplicate, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p
        className="rounded-md border border-dashed px-4 py-8 text-center text-sm"
        style={{ color: "var(--yl-color-text-muted)" }}
      >
        タスクはまだありません。
      </p>
    );
  }

  return (
    <ul aria-label="タスク一覧" className="divide-y rounded-md border">
      {tasks.map((task) => {
        const menuId = `task-menu-${task.id}`;
        return (
          <li key={task.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-medium"
                style={{ color: "var(--yl-color-text)" }}
                title={task.title}
              >
                {task.title}
              </p>
              <p
                className="truncate text-sm"
                style={{ color: "var(--yl-color-text-muted)" }}
              >
                <span className="sr-only">担当者: </span>
                {task.assignee}
              </p>
            </div>

            <Badge tone={statusTone[task.status]}>
              <span className="sr-only">状態: </span>
              {task.status}
            </Badge>

            <Menu.Trigger
              menu={menuId}
              aria-label={`「${task.title}」の操作メニュー`}
            >
              <span aria-hidden="true">…</span>
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

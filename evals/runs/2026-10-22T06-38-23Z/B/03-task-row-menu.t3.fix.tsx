"use client";

import { useId } from "react";
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

const statusVariant: Record<TaskStatus, "neutral" | "info" | "success"> = {
  未着手: "neutral",
  対応中: "info",
  完了: "success",
};

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

type TaskRowProps = {
  task: Task;
  onEdit?: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

function TaskRow({ task, onEdit, onDuplicate, onDelete }: TaskRowProps) {
  const menuId = useId();
  const menuLabel = `「${task.title}」の操作メニュー`;

  return (
    <li
      className="flex items-center gap-4 border-t px-4 py-3 first:border-t-0"
      style={{ borderColor: "var(--yl-color-border)" }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="truncate font-medium"
          style={{ color: "var(--yl-color-text)" }}
        >
          {task.title}
        </p>
        <p
          className="mt-0.5 text-sm"
          style={{ color: "var(--yl-color-text-muted)" }}
        >
          <span className="sr-only">担当者: </span>
          {task.assignee}
        </p>
      </div>

      <Badge variant={statusVariant[task.status]}>
        <span className="sr-only">状態: </span>
        {task.status}
      </Badge>

      <Menu id={menuId} label={menuLabel}>
        <Menu.Trigger>
          <Button variant="ghost" aria-label={menuLabel}>
            <MoreIcon />
          </Button>
        </Menu.Trigger>
        <Menu.Item onSelect={() => onEdit?.(task)}>編集</Menu.Item>
        <Menu.Item onSelect={() => onDuplicate?.(task)}>複製</Menu.Item>
        <Menu.Item
          onSelect={() => onDelete?.(task)}
          style={{ color: "var(--yl-color-danger)" }}
        >
          削除
        </Menu.Item>
      </Menu>
    </li>
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
      <p
        className="py-8 text-center text-sm"
        style={{ color: "var(--yl-color-text-muted)" }}
      >
        タスクはありません。
      </p>
    );
  }

  return (
    <ul
      className="rounded-md border"
      style={{ borderColor: "var(--yl-color-border)" }}
    >
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

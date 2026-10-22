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

const statusTone: Record<TaskStatus, "neutral" | "accent" | "ok"> = {
  未着手: "neutral",
  対応中: "accent",
  完了: "ok",
};

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
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
  isFirst: boolean;
  onEdit?: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

function TaskRow({ task, isFirst, onEdit, onDuplicate, onDelete }: TaskRowProps) {
  const menuId = `task-menu-${useId()}`;

  return (
    <li
      className={`flex items-center gap-4 px-4 py-3 ${isFirst ? "" : "border-t"}`}
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
          className="truncate text-sm"
          style={{ color: "var(--yl-color-text-muted)" }}
        >
          担当: {task.assignee}
        </p>
      </div>

      <Badge tone={statusTone[task.status]}>{task.status}</Badge>

      <Menu.Trigger menu={menuId}>
        <Button aria-label={`「${task.title}」の操作メニュー`}>
          <MoreIcon />
        </Button>
      </Menu.Trigger>
      <Menu id={menuId} label={`「${task.title}」の操作`}>
        <Menu.Item onSelect={() => onEdit?.(task)}>編集</Menu.Item>
        <Menu.Item onSelect={() => onDuplicate?.(task)}>複製</Menu.Item>
        <Menu.Item onSelect={() => onDelete?.(task)}>削除</Menu.Item>
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
        タスクはありません
      </p>
    );
  }

  return (
    <ul
      aria-label="タスク一覧"
      className="rounded-lg border"
      style={{ borderColor: "var(--yl-color-border)" }}
    >
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          isFirst={index === 0}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

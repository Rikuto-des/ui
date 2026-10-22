"use client";

import * as React from "react";
import { Badge, Button, Menu } from "@yourlib/react";

export type TaskStatus = "todo" | "in_progress" | "done";

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

const STATUS_META: Record<
  TaskStatus,
  { label: string; variant: "neutral" | "info" | "success" }
> = {
  todo: { label: "未着手", variant: "neutral" },
  in_progress: { label: "対応中", variant: "info" },
  done: { label: "完了", variant: "success" },
};

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <circle cx="4" cy="10" r="1.75" />
      <circle cx="10" cy="10" r="1.75" />
      <circle cx="16" cy="10" r="1.75" />
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
      aria-label="タスク一覧"
      className="rounded-md border"
      style={{ borderColor: "var(--yl-color-border)" }}
    >
      {tasks.map((task, index) => {
        const status = STATUS_META[task.status];
        const menuId = `task-menu-${task.id}`;
        return (
          <li
            key={task.id}
            className="flex items-center gap-4 px-4 py-3"
            style={
              index > 0
                ? {
                    borderTopWidth: 1,
                    borderTopStyle: "solid",
                    borderTopColor: "var(--yl-color-border)",
                  }
                : undefined
            }
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
                <span className="sr-only">担当者: </span>
                {task.assignee}
              </p>
            </div>

            <Badge variant={status.variant}>
              <span className="sr-only">状態: </span>
              {status.label}
            </Badge>

            <Menu.Trigger target={menuId}>
              <Button variant="ghost" aria-label={`「${task.title}」の操作`}>
                <MoreIcon />
              </Button>
            </Menu.Trigger>
            <Menu id={menuId} label={`「${task.title}」の操作`}>
              <Menu.Item onSelect={() => onEdit?.(task)}>編集</Menu.Item>
              <Menu.Item onSelect={() => onDuplicate?.(task)}>複製</Menu.Item>
              <Menu.Separator />
              <Menu.Item onSelect={() => onDelete?.(task)}>削除</Menu.Item>
            </Menu>
          </li>
        );
      })}
    </ul>
  );
}

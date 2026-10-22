"use client";

import {
  Badge,
  IconButton,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
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

const statusVariant: Record<TaskStatus, "neutral" | "info" | "success"> = {
  未着手: "neutral",
  対応中: "info",
  完了: "success",
};

export function TaskList({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        タスクはありません
      </p>
    );
  }

  return (
    <ul
      aria-label="タスク一覧"
      className="divide-y divide-gray-200 rounded-md border border-gray-200"
    >
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-4 px-4 py-3">
          <Badge variant={statusVariant[task.status]} className="shrink-0">
            {task.status}
          </Badge>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {task.title}
            </p>
            <p className="truncate text-xs text-gray-500">
              担当: {task.assignee}
            </p>
          </div>

          <Menu>
            <MenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`「${task.title}」の操作メニュー`}
              >
                <span aria-hidden="true">…</span>
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
      ))}
    </ul>
  );
}

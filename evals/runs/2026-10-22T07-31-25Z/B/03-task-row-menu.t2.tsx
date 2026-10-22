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

const statusVariant: Record<TaskStatus, "neutral" | "info" | "success"> = {
  未着手: "neutral",
  対応中: "info",
  完了: "success",
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

export function TaskList({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        タスクはありません
      </p>
    );
  }

  return (
    <ul
      aria-label="タスク一覧"
      className="divide-y divide-gray-200 rounded-lg border border-gray-200"
    >
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900">{task.title}</p>
            <p className="truncate text-sm text-gray-500">
              担当: {task.assignee}
            </p>
          </div>

          <Badge variant={statusVariant[task.status]}>{task.status}</Badge>

          <Menu>
            <MenuTrigger asChild>
              <IconButton
                variant="ghost"
                aria-label={`「${task.title}」の操作メニュー`}
              >
                <MoreIcon />
              </IconButton>
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem onSelect={() => onEdit?.(task)}>編集</MenuItem>
              <MenuItem onSelect={() => onDuplicate?.(task)}>複製</MenuItem>
              <MenuItem variant="danger" onSelect={() => onDelete?.(task)}>
                削除
              </MenuItem>
            </MenuContent>
          </Menu>
        </li>
      ))}
    </ul>
  );
}

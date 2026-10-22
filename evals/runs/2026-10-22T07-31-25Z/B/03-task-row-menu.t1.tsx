"use client";

import {
  Badge,
  IconButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function TaskList({ tasks, onEdit, onDuplicate, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-gray-500">
        タスクはまだありません。
      </p>
    );
  }

  return (
    <ul aria-label="タスク一覧" className="divide-y rounded-md border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium" title={task.title}>
              {task.title}
            </p>
            <p className="truncate text-sm text-gray-500">
              <span className="sr-only">担当者: </span>
              {task.assignee}
            </p>
          </div>

          <Badge variant={statusVariant[task.status]}>
            <span className="sr-only">状態: </span>
            {task.status}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`「${task.title}」の操作メニュー`}
              >
                <span aria-hidden="true">…</span>
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit?.(task)}>編集</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDuplicate?.(task)}>複製</DropdownMenuItem>
              <DropdownMenuItem variant="danger" onSelect={() => onDelete?.(task)}>
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      ))}
    </ul>
  );
}

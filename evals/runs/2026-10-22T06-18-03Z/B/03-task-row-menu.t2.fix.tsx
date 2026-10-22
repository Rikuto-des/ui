"use client";

import {
  Badge,
  IconButton,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@yourlib/react";

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

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "対応中",
  done: "完了",
};

const STATUS_VARIANT: Record<TaskStatus, "neutral" | "info" | "success"> = {
  todo: "neutral",
  in_progress: "info",
  done: "success",
};

export function TaskList({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--yl-color-text-muted)]">
        タスクはありません
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--yl-color-border)] rounded-md border border-[var(--yl-color-border)]">
      {tasks.map((task) => {
        const menuId = `task-menu-${task.id}`;

        return (
          <li key={task.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[var(--yl-color-text)]">
                {task.title}
              </p>
              <p className="truncate text-sm text-[var(--yl-color-text-muted)]">
                担当: {task.assignee}
              </p>
            </div>

            <Badge variant={STATUS_VARIANT[task.status]}>
              {STATUS_LABEL[task.status]}
            </Badge>

            <Menu id={menuId} label={`「${task.title}」の操作`}>
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
        );
      })}
    </ul>
  );
}

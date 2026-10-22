"use client";

import {
  Badge,
  IconButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Text,
} from "@yourlib/react";

export type TaskStatus = "todo" | "in_progress" | "done";

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

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; variant: "neutral" | "info" | "success" }
> = {
  todo: { label: "未着手", variant: "neutral" },
  in_progress: { label: "対応中", variant: "info" },
  done: { label: "完了", variant: "success" },
};

function MoreHorizontalIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
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
      <div className="rounded-md border border-dashed px-4 py-8 text-center">
        <Text>タスクはありません。</Text>
      </div>
    );
  }

  return (
    <ul aria-label="タスク一覧" className="divide-y rounded-md border">
      {tasks.map((task) => {
        const status = STATUS_CONFIG[task.status];

        return (
          <li key={task.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <Text className="block truncate font-medium">{task.title}</Text>
              <Text size="sm" className="block truncate text-gray-600">
                担当: {task.assigneeName}
              </Text>
            </div>

            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>

            <Menu>
              <MenuTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={`「${task.title}」の操作`}
                >
                  <MoreHorizontalIcon />
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

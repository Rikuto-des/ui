import { Badge, Menu } from "@yourlib/react";

export type TaskStatus = "未着手" | "対応中" | "完了";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
};

type TaskListProps = {
  tasks: Task[];
};

const statusTone: Record<TaskStatus, "neutral" | "accent" | "ok"> = {
  未着手: "neutral",
  対応中: "accent",
  完了: "ok",
};

function menuIdFor(taskId: string) {
  return `task-actions-${taskId.replace(/[^A-Za-z0-9_-]/g, "_")}`;
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="py-6 text-center">タスクはまだありません。</p>;
  }

  return (
    <ul className="flex flex-col" aria-label="タスク一覧">
      {tasks.map((task) => {
        const menuId = menuIdFor(task.id);

        return (
          <li key={task.id} className="flex items-center gap-3 py-3">
            <Badge tone={statusTone[task.status]} className="shrink-0">
              {task.status}
            </Badge>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{task.title}</span>
              <span className="truncate text-sm">担当: {task.assignee}</span>
            </div>

            <Menu.Trigger
              menu={menuId}
              variant="ghost"
              size="sm"
              aria-label={`「${task.title}」の操作`}
              className="shrink-0"
            >
              <span aria-hidden="true">…</span>
            </Menu.Trigger>
            <Menu id={menuId} label={`「${task.title}」の操作`} side="bottom" align="end">
              <Menu.Item>編集</Menu.Item>
              <Menu.Item>複製</Menu.Item>
              <Menu.Separator />
              <Menu.Item variant="danger">削除</Menu.Item>
            </Menu>
          </li>
        );
      })}
    </ul>
  );
}

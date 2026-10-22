import { Badge, Card, Menu } from "@yourlib/react";

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

function menuIdFor(taskId: string): string {
  return `task-actions-${taskId.replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <Card title="タスク" headingLevel="h2">
      {tasks.length === 0 ? (
        <p>タスクはまだありません。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => {
            const menuId = menuIdFor(task.id);
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 py-2"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate">{task.title}</span>
                  <span className="text-sm">担当: {task.assignee}</span>
                </div>
                <Badge tone={statusTone[task.status]} dot>
                  {task.status}
                </Badge>
                <Menu.Trigger
                  menu={menuId}
                  variant="ghost"
                  size="sm"
                  aria-label={`「${task.title}」の操作`}
                >
                  <span aria-hidden="true">…</span>
                </Menu.Trigger>
                <Menu
                  id={menuId}
                  label={`「${task.title}」の操作`}
                  side="bottom"
                  align="end"
                >
                  <Menu.Item>編集</Menu.Item>
                  <Menu.Item>複製</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item variant="danger">削除</Menu.Item>
                </Menu>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

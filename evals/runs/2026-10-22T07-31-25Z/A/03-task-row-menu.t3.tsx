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

export function TaskList({ tasks }: TaskListProps) {
  return (
    <Card title="タスク" headingLevel="h2" className="w-full max-w-3xl">
      {tasks.length === 0 ? (
        <p
          className="py-6 text-center"
          style={{
            color: "var(--yl-color-text-muted)",
            fontSize: "var(--yl-font-size-body)",
          }}
        >
          タスクはまだありません。
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {tasks.map((task, index) => {
            const menuId = `task-actions-${task.id}`;
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 py-3"
                style={
                  index === 0
                    ? undefined
                    : {
                        borderTop:
                          "var(--yl-border-width) solid var(--yl-color-border)",
                      }
                }
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    className="truncate"
                    style={{
                      color: "var(--yl-color-text)",
                      fontSize: "var(--yl-font-size-body)",
                    }}
                  >
                    {task.title}
                  </span>
                  <span
                    style={{
                      color: "var(--yl-color-text-subtle)",
                      fontSize: "var(--yl-font-size-small)",
                    }}
                  >
                    担当: {task.assignee}
                  </span>
                </div>

                <Badge tone={statusTone[task.status]}>{task.status}</Badge>

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

import { Badge, Card, Menu, Separator } from "@yourlib/react";

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
    <Card title="タスク" headingLevel="h2" padding="md">
      {tasks.length === 0 ? (
        <p>タスクはまだありません。</p>
      ) : (
        <ul className="flex flex-col">
          {tasks.map((task, index) => {
            const menuId = `task-actions-${task.id}`;
            return (
              <li key={task.id} className="flex flex-col">
                {index > 0 && <Separator decorative />}
                <div className="flex items-center gap-3 py-3">
                  <Badge tone={statusTone[task.status]} dot>
                    {task.status}
                  </Badge>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{task.title}</span>
                    <span className="text-sm">担当: {task.assignee}</span>
                  </div>
                  <Menu.Trigger
                    menu={menuId}
                    variant="ghost"
                    size="sm"
                    aria-label={`「${task.title}」の操作`}
                  >
                    …
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

"use client";
import { useState } from "react";
import { Button, Drawer, RadioGroup } from "@urushi/react";
const tasks = ["告知メールの文面を確定する", "申し込みページの画像を差し替える", "問い合わせフォームを見直す"];
const states = ["未着手", "進行中", "完了"] as const;
export default function DrawerExample() {
  const [status, setStatus] = useState<Record<string, string>>({ [tasks[0]]: "進行中", [tasks[1]]: "未着手", [tasks[2]]: "未着手" });
  const [editing, setEditing] = useState(tasks[0]);
  const [draft, setDraft] = useState(status[tasks[0]]);
  return (
    <div className="interaction-study">
      <header>
        <h3>タスクの状態を変える</h3>
      </header>
      <ul className="study-drawer-list">
        {tasks.map((task) => (
          <li key={task}>
            <span>{task}</span>
            <Drawer.Trigger
              drawer="study-drawer"
              size="sm"
              variant="secondary"
              aria-label={`${status[task]}（${task}の状態を変える）`}
              onClick={() => {
                setEditing(task);
                setDraft(status[task]);
              }}
            >
              {status[task]}
            </Drawer.Trigger>
          </li>
        ))}
      </ul>
      <Drawer id="study-drawer" title="状態を変える" description={editing}>
        <form
          className="study-sheet-form"
          onSubmit={(e) => {
            e.preventDefault();
            setStatus({ ...status, [editing]: draft });
            e.currentTarget.closest("dialog")?.close();
          }}
        >
          <RadioGroup key={`${editing}-${status[editing]}`} name="study-drawer-status" legend="状態" defaultValue={status[editing]} onChange={(e) => setDraft((e.nativeEvent.target as HTMLInputElement).value)}>
            {states.map((state) => (
              <RadioGroup.Item key={state} value={state}>
                {state}
              </RadioGroup.Item>
            ))}
          </RadioGroup>
          <div className="study-actions">
            <Drawer.Close drawer="study-drawer" variant="ghost">
              やめる
            </Drawer.Close>
            <Button type="submit" variant="primary">
              変える
            </Button>
          </div>
        </form>
      </Drawer>
      <p className="study-caption" role="status">
        {tasks.filter((task) => status[task] === "完了").length} / {tasks.length} 件が完了
      </p>
    </div>
  );
}

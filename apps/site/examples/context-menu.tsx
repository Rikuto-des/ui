"use client";
import { useState } from "react";
import { Button, ContextMenu, Menu } from "@urushi/react";
const initial = [
  { name: "週次レポート", pinned: true },
  { name: "採用面接のメモ", pinned: false },
  { name: "旅行の計画", pinned: false },
];
export default function ContextMenuExample() {
  const [notes, setNotes] = useState(initial),
    [target, setTarget] = useState(initial[0].name),
    [status, setStatus] = useState("ノートを右クリックするか、選んで Shift+F10 を押してください。");
  const current = notes.find((note) => note.name === target);
  const update = (next: typeof notes, message: string) => {
    setNotes(next);
    setStatus(message);
  };
  return (
    <div className="interaction-study">
      <header>
        <small>RIGHT-CLICK ACTIONS</small>
        <h3>ノートを右クリックして操作する</h3>
      </header>
      <ContextMenu.Area menu="study-context-menu">
        <ul className="study-context-list">
          {notes.map((note) => (
            <li key={note.name}>
              <button
                type="button"
                className="study-context-row"
                onContextMenu={() => setTarget(note.name)}
                onKeyDown={(event) => {
                  if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) setTarget(note.name);
                }}
                onClick={() => setStatus(`「${note.name}」を開きました。`)}
              >
                <strong>{note.name}</strong>
                <small>{note.pinned ? "ピン留め中" : "メモ"}</small>
              </button>
            </li>
          ))}
        </ul>
      </ContextMenu.Area>
      <ContextMenu id="study-context-menu" label="ノートの操作">
        <Menu.Item onClick={() => setStatus(`「${target}」を開きました。`)}>開く</Menu.Item>
        <Menu.Item
          onClick={() =>
            update(
              notes.map((note) => (note.name === target ? { ...note, pinned: !note.pinned } : note)),
              current?.pinned ? `「${target}」のピン留めを外しました。` : `「${target}」をピン留めしました。`,
            )
          }
        >
          {current?.pinned ? "ピン留めを外す" : "ピン留め"}
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            const copy = `${target}のコピー`;
            if (notes.some((note) => note.name === copy)) return setStatus(`「${copy}」はもうあります。`);
            update([...notes, { name: copy, pinned: false }], `「${copy}」を作りました。`);
          }}
        >
          複製
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          variant="danger"
          onClick={() => update(notes.filter((note) => note.name !== target), `「${target}」を削除しました。元に戻せます。`)}
        >
          削除
        </Menu.Item>
      </ContextMenu>
      <div className="study-actions">
        <Button
          variant="ghost"
          onClick={() => update(initial, "最初の状態に戻しました。")}
        >
          元に戻す
        </Button>
        <p className="study-caption" role="status">
          {status}
        </p>
      </div>
    </div>
  );
}

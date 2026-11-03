"use client";
import { NotebookIcon } from "@urushi/react/icons";
import { useState } from "react";
import { Button, Menu } from "@urushi/react";
export default function MenuExample() {
  const [copies, setCopies] = useState(1),
    [archived, setArchived] = useState(false),
    [folder, setFolder] = useState("仕事");
  return (
    <div className="interaction-study">
      <header>
        <small>CONTEXTUAL ACTIONS</small>
        <h3>ノートの操作をメニューから選ぶ</h3>
      </header>
      <div className="study-file">
        <span aria-hidden="true"><NotebookIcon size={24} /></span>
        <div>
          <strong>Field notes</strong>
          <p>{archived ? "アーカイブ済み" : `${folder}・${copies}冊のノート`}</p>
        </div>
        <Menu.Trigger
          menu="study-menu"
          aria-label="ノートの操作"
          variant="ghost"
        >
          •••
        </Menu.Trigger>
      </div>
      <Menu id="study-menu" label="ノートの操作">
        <Menu.Item
          description="同じ内容のノートを追加します"
          onClick={() => {
            setCopies(copies + 1);
            setArchived(false);
          }}
        >
          複製
        </Menu.Item>
        <Menu.Sub label="フォルダーを移動">
          {["仕事", "個人", "あとで読む"].map((name) => (
            <Menu.Item
              key={name}
              onClick={() => {
                setFolder(name);
                setArchived(false);
              }}
            >
              {name}
            </Menu.Item>
          ))}
        </Menu.Sub>
        <Menu.Separator />
        <Menu.Item
          variant="danger"
          description="このプレビューから一時的に移動します"
          onClick={() => setArchived(true)}
        >
          アーカイブ
        </Menu.Item>
      </Menu>
      <div className="study-actions">
        <Button
          variant="ghost"
          onClick={() => {
            setCopies(1);
            setArchived(false);
            setFolder("仕事");
          }}
        >
          元に戻す
        </Button>
        <p className="study-caption" role="status">
          {archived
            ? "アーカイブしました。元に戻せます。"
            : `${copies}冊を表示中`}
        </p>
      </div>
    </div>
  );
}

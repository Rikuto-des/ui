"use client";
import { useState } from "react";
import { Button, Menu, Menubar } from "@urushi/react";
const sizes = ["小", "中", "大"] as const;
export default function MenubarExample() {
  const [size, setSize] = useState(1),
    [outline, setOutline] = useState(true),
    [notes, setNotes] = useState(1),
    [status, setStatus] = useState("メニューを開いて、左右の矢印かポインタで隣のメニューに移れます。");
  return (
    <div className="interaction-study">
      <header>
        <small>APPLICATION MENUS</small>
        <h3>エディターのメニューから操作する</h3>
      </header>
      <Menubar label="エディターのメニュー">
        <Menubar.Menu label="ファイル">
          <Menu.Item
            shortcut="⌘N"
            onClick={() => {
              setNotes(notes + 1);
              setStatus(`新しいノートを作りました（${notes + 1}冊）。`);
            }}
          >
            新しいノート
          </Menu.Item>
          <Menu.Sub label="書き出す">
            {["PDF", "Markdown"].map((format) => (
              <Menu.Item key={format} onClick={() => setStatus(`${format} で書き出しました。`)}>
                {format}
              </Menu.Item>
            ))}
          </Menu.Sub>
        </Menubar.Menu>
        <Menubar.Menu label="表示">
          <Menu.Item onClick={() => setOutline(!outline)}>{outline ? "目次を隠す" : "目次を表示"}</Menu.Item>
          <Menu.Separator />
          <Menu.Item shortcut="⌘+" disabled={size === sizes.length - 1} onClick={() => setSize(size + 1)}>
            文字を大きく
          </Menu.Item>
          <Menu.Item shortcut="⌘−" disabled={size === 0} onClick={() => setSize(size - 1)}>
            文字を小さく
          </Menu.Item>
        </Menubar.Menu>
        <Menubar.Menu label="ヘルプ">
          <Menu.Link href="/components/menubar/#keyboard">キーボード操作</Menu.Link>
        </Menubar.Menu>
      </Menubar>
      <div className="study-editor" data-size={size}>
        {outline && (
          <ol aria-label="目次">
            <li>今週やったこと</li>
            <li>来週の予定</li>
          </ol>
        )}
        <p>今週は申し込みページの画像を差し替え、告知メールの文面を確定しました。</p>
      </div>
      <div className="study-actions">
        <Button
          variant="ghost"
          onClick={() => {
            setSize(1);
            setOutline(true);
            setNotes(1);
            setStatus("最初の状態に戻しました。");
          }}
        >
          元に戻す
        </Button>
        <p className="study-caption" role="status">
          {status}
          {` 文字の大きさ：${sizes[size]}・ノート ${notes}冊`}
        </p>
      </div>
    </div>
  );
}

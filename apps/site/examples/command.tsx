"use client";
import { useRef, useState } from "react";
import { Button, Field, Input, Kbd } from "@urushi/react";
import { Command } from "@urushi/react/command";
export default function CommandExample({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [view, setView] = useState("notes"),
    [recent, setRecent] = useState(""),
    [title, setTitle] = useState("Field notes"),
    [result, setResult] = useState("実行前に内容を確認できます。");
  const trigger = useRef<HTMLButtonElement>(null);
  const execute = (id: string) => {
    setRecent(id);
    setView(id);
    setResult(
      id === "settings"
        ? "設定を選択しました。タイトルを編集できます。"
        : "ノートを選択しました。",
    );
  };
  return (
    <div
      className="interaction-study"
      onKeyDown={(e) => {
        if (
          (e.metaKey || e.ctrlKey) &&
          e.key.toLowerCase() === "k" &&
          !e.nativeEvent.isComposing
        ) {
          e.preventDefault();
          trigger.current?.focus();
          setOpen(true);
        }
      }}
    >
      {!compact && (
        <header>
          <small>PREVIEW BEFORE YOU ACT</small>
          <h3>コマンドの内容を確認して実行する</h3>
        </header>
      )}
      {!compact && (
        <div className="study-command-destination">
          {view === "settings" ? (
            <Field id="command-title" label="ノートのタイトル">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
          ) : (
            <div className="study-cover">
              <small>NOTEBOOK</small>
              <strong>{title}</strong>
              <span>Ideas worth keeping.</span>
            </div>
          )}
        </div>
      )}
      <Button
        ref={trigger}
        onClick={(e) => {
          e.currentTarget.focus();
          setOpen(true);
        }}
      >
        コマンドを開く{" "}
        <span aria-hidden="true">
          <Kbd>⌘ K</Kbd>
        </span>
      </Button>
      <p className="study-caption" role="status">
        {result}
      </p>
      <Command
        label="コマンドを検索"
        open={open}
        onOpenChange={setOpen}
        placeholder="ノート、設定…"
        emptyText="該当するコマンドがありません。"
        closeLabel="コマンドを閉じる"
        navigationHint="移動"
        actionHint="実行"
        items={[
          {
            id: "notes",
            label: "ノートを開く",
            description:
              recent === "notes"
                ? "最近使用 / ノートの表紙へ"
                : "ノートの表紙へ戻る",
            keywords: "notes notebook",
            preview: (
              <div className="study-command-preview">
                <small>NOTEBOOK</small>
                <strong>{title}</strong>
                <p>入力した内容を保ったまま表紙に戻ります。</p>
              </div>
            ),
            onSelect: () => execute("notes"),
          },
          {
            id: "settings",
            label: "設定を開く",
            description:
              recent === "settings"
                ? "最近使用 / タイトルを編集"
                : "ノートのタイトルを編集",
            keywords: "settings title",
            preview: (
              <div className="study-command-preview">
                <small>SETTINGS</small>
                <strong>ノートの設定</strong>
                <p>このプレビューのタイトルをその場で編集できます。</p>
              </div>
            ),
            onSelect: () => execute("settings"),
          },
          {
            id: "export",
            label: "書き出す",
            description: "このプレビューでは利用できません",
            disabled: true,
            onSelect: () => {},
          },
        ]}
      />
    </div>
  );
}

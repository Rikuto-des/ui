"use client";
import { useState } from "react";
import { Button, Field, Input, Sheet, Switch } from "@urushi/react";
export default function SheetExample() {
  const [saved, setSaved] = useState({ name: "Field notes", grid: true }),
    [draft, setDraft] = useState(saved);
  return (
    <div className="interaction-study">
      <header>
        <small>EDIT BESIDE YOUR WORK</small>
        <h3>背景を見ながら編集する</h3>
      </header>
      <div className="study-canvas" data-grid={saved.grid}>
        <strong>{saved.name}</strong>
        <span>PERSONAL SPACE</span>
      </div>
      <Sheet.Trigger sheet="study-sheet" onClick={() => setDraft({ ...saved })}>
        表示を編集
      </Sheet.Trigger>
      <Sheet
        id="study-sheet"
        title="表示を編集"
        description="保存するとプレビューに反映します。"
      >
        <form
          className="study-sheet-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved({ ...draft, name: draft.name.trim() });
            e.currentTarget.closest("dialog")?.close();
          }}
        >
          <Field id="sheet-title" label="タイトル">
            <Input
              value={draft.name}
              required
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <Switch
            checked={draft.grid}
            onChange={(e) => setDraft({ ...draft, grid: e.target.checked })}
          >
            グリッドを表示
          </Switch>
          <div className="study-canvas" data-grid={draft.grid}>
            <strong>{draft.name || "Untitled"}</strong>
            <span>PREVIEW</span>
          </div>
          <div className="study-actions">
            <Sheet.Close sheet="study-sheet" variant="ghost">
              キャンセル
            </Sheet.Close>
            <Button type="submit" disabled={!draft.name.trim()}>
              表示を保存
            </Button>
          </div>
        </form>
      </Sheet>
      <p className="study-caption" role="status">
        {saved.name} / グリッド{saved.grid ? "あり" : "なし"}
      </p>
    </div>
  );
}

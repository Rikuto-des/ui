"use client";
import { NotebookIcon } from "@urushi/react/icons";
import { useState } from "react";
import { AlertDialog, Button } from "@urushi/react";
export default function AlertDialogExample() {
  const [archived, setArchived] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>A SAFE WAY BACK</small>
        <h3>確認してからアーカイブする</h3>
      </header>
      <div className="study-file" data-muted={archived}>
        <span aria-hidden="true"><NotebookIcon size={24} /></span>
        <div>
          <strong>Field notes</strong>
          <p>
            {archived
              ? "アーカイブに移動しました"
              : "ノート 12件 / 最終更新：今日"}
          </p>
        </div>
      </div>
      <div className="study-actions">
        <AlertDialog.Trigger
          alertDialog="archive-confirm"
          variant="danger"
          aria-disabled={archived}
          onClick={(e) => {
            if (archived) e.preventDefault();
          }}
        >
          アーカイブする
        </AlertDialog.Trigger>
        <Button
          variant="ghost"
          onClick={() => setArchived(false)}
          aria-disabled={!archived}
        >
          元に戻す
        </Button>
      </div>
      <AlertDialog
        id="archive-confirm"
        title="ノートをアーカイブしますか？"
        description="一覧から移動します。確認後も「元に戻す」で復元できます。"
      >
        <AlertDialog.Cancel alertDialog="archive-confirm">
          キャンセル
        </AlertDialog.Cancel>
        <AlertDialog.Action
          alertDialog="archive-confirm"
          onClick={() => setArchived(true)}
        >
          アーカイブ
        </AlertDialog.Action>
      </AlertDialog>
      <p className="study-caption" role="status">
        {archived
          ? "アーカイブしました。元に戻せます。"
          : "このページだけで操作を試せます。"}
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button, Dialog } from "@yourlib/react";

export type DangerZoneSectionProps = {
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** ダイアログの見出しに表示するプロジェクト名（任意） */
  projectName?: string;
};

const DIALOG_ID = "delete-project-dialog";

export function DangerZoneSection({ onDelete, projectName }: DangerZoneSectionProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      aria-labelledby="danger-zone-heading"
      className="mt-12 rounded-2xl border p-6"
      style={{
        borderColor: "var(--yl-color-danger)",
        backgroundColor: "var(--yl-color-surface)",
      }}
    >
      <h2
        id="danger-zone-heading"
        className="text-lg font-semibold"
        style={{ color: "var(--yl-color-danger)" }}
      >
        危険な操作
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium" style={{ color: "var(--yl-color-text)" }}>
            プロジェクトを削除
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--yl-color-text-muted)" }}>
            プロジェクトとそれに含まれるすべてのデータが完全に削除されます。
          </p>
        </div>

        {/* ボタンの色は variant="danger" で赤に。角の丸みはパックが決めます。 */}
        <Dialog.Trigger dialogId={DIALOG_ID} variant="danger" className="self-start sm:self-center">
          プロジェクトを削除
        </Dialog.Trigger>
      </div>

      <Dialog
        id={DIALOG_ID}
        title={
          projectName ? `「${projectName}」を削除しますか？` : "プロジェクトを削除しますか？"
        }
        description="この操作は取り消せません。プロジェクトとそれに含まれるすべてのデータが完全に削除されます。"
      >
        <Dialog.Actions>
          <Dialog.Close dialogId={DIALOG_ID} variant="secondary" disabled={isDeleting}>
            キャンセル
          </Dialog.Close>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? "削除中…" : "削除する"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

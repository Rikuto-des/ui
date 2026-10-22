"use client";

import { Button, Dialog } from "@yourlib/react";

export type DangerZoneProps = {
  /** 表示用のプロジェクト名(任意) */
  projectName?: string;
  /** 「削除する」確定時に呼ばれる */
  onDelete: () => void | Promise<void>;
};

const DELETE_DIALOG_ID = "delete-project-dialog";

export function DangerZone({ projectName, onDelete }: DangerZoneProps) {
  const target = projectName ? `「${projectName}」` : "このプロジェクト";

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
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--yl-color-text-muted)" }}
          >
            {target}とそのすべてのデータが完全に削除されます。
          </p>
        </div>

        {/* 色は variant="danger" で赤に。角の丸みはパックが決めます */}
        <Dialog.Trigger dialog={DELETE_DIALOG_ID} variant="danger">
          プロジェクトを削除
        </Dialog.Trigger>
      </div>

      <Dialog
        id={DELETE_DIALOG_ID}
        title="プロジェクトを削除しますか?"
        description={`この操作は取り消せません。${target}に含まれるすべてのデータが完全に削除されます。`}
      >
        <Dialog.Actions>
          <Dialog.Close dialog={DELETE_DIALOG_ID} variant="secondary">
            キャンセル
          </Dialog.Close>
          <Dialog.Close
            dialog={DELETE_DIALOG_ID}
            variant="danger"
            onClick={() => {
              void onDelete();
            }}
          >
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

// Button は将来の拡張用に import を残さないよう、ここでは未使用にしない
export { Button as _DangerZoneButton };

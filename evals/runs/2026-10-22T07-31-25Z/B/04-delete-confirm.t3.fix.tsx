"use client";

import { Card, Dialog } from "@yourlib/react";

export type ProjectDangerZoneProps = {
  /** 削除が確定したときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** ダイアログの見出しに表示するプロジェクト名(任意) */
  projectName?: string;
};

const DIALOG_ID = "delete-project-dialog";

// 注意: ボタンの角の丸みは yourlib のパックが決めるため、このファイルからは変更できません。
// 「角をしっかり丸く」するには、角の丸いパックへの切り替えが必要です。
export function ProjectDangerZone({ onDelete, projectName }: ProjectDangerZoneProps) {
  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <Card padding="lg">
        <h2
          id="danger-zone-heading"
          className="text-lg font-semibold"
          style={{ color: "var(--yl-color-danger)" }}
        >
          危険な操作
        </h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold" style={{ color: "var(--yl-color-text)" }}>
              プロジェクトを削除
            </p>
            <p className="text-sm" style={{ color: "var(--yl-color-text-muted)" }}>
              プロジェクトとそのすべてのデータが完全に削除されます。
            </p>
          </div>

          <Dialog.Trigger dialog={DIALOG_ID} variant="danger" className="self-start sm:self-center">
            プロジェクトを削除
          </Dialog.Trigger>
        </div>
      </Card>

      <Dialog
        id={DIALOG_ID}
        title={
          projectName
            ? `「${projectName}」を削除しますか?`
            : "プロジェクトを削除しますか?"
        }
        description="この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。"
      >
        <Dialog.Actions>
          <Dialog.Close dialog={DIALOG_ID} variant="secondary">
            キャンセル
          </Dialog.Close>
          <Dialog.Close
            dialog={DIALOG_ID}
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

"use client";

/**
 * 注意: ご依頼の「削除ボタンの角をしっかり丸くする」は、このファイルでは実現していません。
 * yourlib ではボタンの角の丸みはパックが決めるため、className などで個別に変えられません。
 * 丸みの強い形が必要な場合は、角の丸いパックへの切り替えか、新しいバリアントの追加をご検討ください。
 * 赤い色は variant="danger" で指定しています。
 */

import { Button, Card, Dialog } from "@yourlib/react";

export type DangerZoneProps = {
  /** 「削除する」が押されたときに呼ばれます */
  onDelete: () => void | Promise<void>;
  /** 確認ダイアログに表示するプロジェクト名(任意) */
  projectName?: string;
};

const DIALOG_ID = "delete-project-dialog";

export function DangerZone({ onDelete, projectName }: DangerZoneProps) {
  const title = projectName
    ? `「${projectName}」を削除しますか?`
    : "プロジェクトを削除しますか?";

  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <Card padding="lg">
        <h2
          id="danger-zone-heading"
          className="text-lg font-bold"
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
              プロジェクトとそのすべてのデータを完全に削除します。
            </p>
          </div>

          <Dialog.Trigger dialog={DIALOG_ID} variant="danger">
            プロジェクトを削除
          </Dialog.Trigger>
        </div>
      </Card>

      <Dialog
        id={DIALOG_ID}
        title={title}
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

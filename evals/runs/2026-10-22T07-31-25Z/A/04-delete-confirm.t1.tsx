"use client";

// 「角をしっかり丸く」について:
// ボタンの角丸はアクティブなパックの --yl-radius-control で決まります。
// yourlib のルールでは className や style で角丸を上書きできず、
// 角丸を変える variant も Button の契約にはありません。
// そのため、ここでは赤い見た目だけを variant="danger" で指定しています。
// もっと丸いボタンが必要なら、新しい variant を契約とすべてのパックに追加する必要があります。
// 追加するかどうか、ご判断ください。

import { Button, Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  /** 「削除する」を押したときに呼ばれます。 */
  onDelete: () => void | Promise<void>;
};

const DIALOG_ID = "confirm-delete-project";

export function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <Card
      title="危険な操作"
      description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
      headingLevel="h2"
      className="mt-8 w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p style={{ color: "var(--yl-color-text)" }}>プロジェクトを削除</p>
          <p
            style={{
              color: "var(--yl-color-text-muted)",
              fontSize: "var(--yl-font-size-small)",
            }}
          >
            プロジェクトとそのすべてのデータを完全に削除します。
          </p>
        </div>

        <Dialog.Trigger dialog={DIALOG_ID} variant="danger">
          プロジェクトを削除
        </Dialog.Trigger>
      </div>

      <Dialog
        id={DIALOG_ID}
        title="プロジェクトを削除しますか？"
        description="この操作は取り消せません。プロジェクトとそのすべてのデータが完全に削除されます。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog={DIALOG_ID} autoFocus>
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
    </Card>
  );
}

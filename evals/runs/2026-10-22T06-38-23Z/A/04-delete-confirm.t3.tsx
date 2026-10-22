"use client";

import { Button, Card, Dialog } from "@yourlib/react";

// 注: 削除ボタンは variant="danger" で赤くしています。
// 「角をしっかり丸く」は反映していません。yourlib では角丸を pack の
// --yl-radius-control トークンで決めており、className や style で上書きすることは
// ルールで禁止されています。Button には角丸を変える variant もありません。
// 丸くしたい場合は次のどちらかになります。どちらにするか決めてください。
//   1. pack 側で --yl-radius-control を大きくする（全ボタンに反映されます）
//   2. Button の契約に角丸用の variant を追加し、すべての pack に実装する

type DangerZoneProps = {
  onDelete: () => void;
};

const DIALOG_ID = "confirm-delete-project";

export function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <Card
      title="危険な操作"
      description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
      headingLevel="h2"
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
            プロジェクトとそのデータがすべて完全に削除されます。
          </p>
        </div>

        <Dialog.Trigger dialog={DIALOG_ID} variant="danger">
          プロジェクトを削除
        </Dialog.Trigger>
      </div>

      <Dialog
        id={DIALOG_ID}
        title="プロジェクトを削除しますか？"
        description="この操作は取り消せません。プロジェクトとそのデータはすべて完全に削除されます。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog={DIALOG_ID} autoFocus>
            キャンセル
          </Dialog.Close>
          <Dialog.Close dialog={DIALOG_ID} variant="danger" onClick={onDelete}>
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Card>
  );
}

"use client";

import { Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void;
};

export function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <Card
      title="危険な操作"
      description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
      headingLevel="h2"
    >
      {/*
        赤い見た目は variant="danger" で指定しています。
        「角をしっかり丸く」は className では変更していません。
        ボタンの見た目はアクティブなパックが決めるため、className や style で上書きできないからです。
        角丸のボタンが必要な場合は、コントラクトとすべてのパックに新しい variant（例: 角丸の danger）を
        追加する必要があります。追加してよいかご確認ください。
      */}
      <Dialog.Trigger dialog="confirm-delete-project" variant="danger">
        プロジェクトを削除
      </Dialog.Trigger>

      <Dialog
        id="confirm-delete-project"
        title="プロジェクトを削除しますか？"
        description="この操作は取り消せません。プロジェクトとそのすべてのデータが完全に削除されます。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog="confirm-delete-project" variant="secondary" autoFocus>
            キャンセル
          </Dialog.Close>
          <Dialog.Close
            dialog="confirm-delete-project"
            variant="danger"
            onClick={onDelete}
          >
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Card>
  );
}

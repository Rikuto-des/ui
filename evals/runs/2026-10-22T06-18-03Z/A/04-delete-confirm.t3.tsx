"use client";

import { Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  onDelete: () => void;
};

/*
 * 角の丸みについて:
 * 赤い見た目は variant="danger" で指定しています。
 * 角を強く丸める指定は入れていません。yourlib では角丸を含む見た目をパック（data-pack）が決めるため、
 * className や style で上書きできません。Button の契約にも角丸のバリアントはありません。
 * 丸い角が必要な場合は、次のどちらかを相談させてください。
 *   - 角丸の強いパックをこの欄に使う
 *   - 契約とすべてのパックに新しいバリアントを追加する
 */
export function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <Card
      title="危険な操作"
      description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
      headingLevel="h2"
    >
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
          <Dialog.Close dialog="confirm-delete-project" autoFocus>
            キャンセル
          </Dialog.Close>
          <Dialog.Close
            dialog="confirm-delete-project"
            variant="danger"
            onClick={() => onDelete()}
          >
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Card>
  );
}

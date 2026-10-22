"use client";

// 角の丸みについて：削除ボタンの角の半径はアクティブなパックが決めます
// (--yl-radius-control)。yourlib のルールでは、className や style で
// コンポーネントの見た目を変えることはできません。そのため、このファイルでは角の丸みを指定していません。
// 削除ボタンだけ角をしっかり丸くしたい場合は、契約と全パックに新しいバリアント
// (例: shape="pill") を追加する必要があります。追加してよいか確認させてください。
// 赤い強調は variant="danger" で付けています。

import { Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  /** 確認ダイアログで「削除する」が押されたときに呼ばれます。 */
  onDelete: () => void;
};

export function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <section aria-labelledby="danger-zone-heading" className="mt-10">
      <Card
        title="危険な操作"
        description="ここでの操作は元に戻せません。内容を確認してから実行してください。"
        headingLevel="h2"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p
              id="danger-zone-heading"
              style={{
                color: "var(--yl-color-text)",
                fontWeight: "var(--yl-font-weight-control)",
              }}
            >
              プロジェクトを削除
            </p>
            <p
              style={{
                color: "var(--yl-color-text-muted)",
                fontSize: "var(--yl-font-size-small)",
              }}
            >
              プロジェクトと、そのすべてのデータが完全に削除されます。
            </p>
          </div>

          <Dialog.Trigger dialog="confirm-delete-project" variant="danger">
            プロジェクトを削除
          </Dialog.Trigger>
        </div>
      </Card>

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
            onClick={onDelete}
          >
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

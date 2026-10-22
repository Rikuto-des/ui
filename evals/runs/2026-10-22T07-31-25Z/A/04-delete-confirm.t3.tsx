"use client";

import { Card, Dialog } from "@yourlib/react";

/*
 * 角の丸みについて:
 * yourlib ではボタンの角丸はアクティブなパックの --yl-radius-control で決まり、
 * className や style で上書きすることはできません（SKILL.md ルール 1・2）。
 * Button / Dialog.Trigger の variant にも角丸を変えるものはありません。
 * そのため、ここでは variant="danger"（赤）だけを指定しています。
 * 「角をしっかり丸く」が必要な場合は、次のどちらかを選んでください。
 *   - 角丸の大きいパックをこの画面またはアプリ全体の data-pack に使う
 *   - 契約と全パックに新しい variant を追加する（デザインシステム側の変更）
 */

type ProjectDangerZoneProps = {
  onDelete: () => void;
};

const DIALOG_ID = "confirm-delete-project";

export function ProjectDangerZone({ onDelete }: ProjectDangerZoneProps) {
  return (
    <Card
      title="危険な操作"
      headingLevel="h2"
      description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p style={{ color: "var(--yl-color-text-muted)" }}>
          プロジェクトと、その中のすべてのデータを完全に削除します。
        </p>
        <Dialog.Trigger dialog={DIALOG_ID} variant="danger">
          プロジェクトを削除
        </Dialog.Trigger>
      </div>

      <Dialog
        id={DIALOG_ID}
        title="プロジェクトを削除しますか？"
        description="この操作は取り消せません。プロジェクトとすべてのデータが完全に削除されます。"
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

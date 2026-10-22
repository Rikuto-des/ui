"use client";

import { Button, Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  /** 確認ダイアログで「削除する」が押されたときに呼ばれます。 */
  onDelete: () => void;
};

const DIALOG_ID = "confirm-delete-project";

/*
 * 角の丸みについて:
 * ボタンの角丸はアクティブなパックの --yl-radius-control で決まります。
 * className（rounded-full など）でコンポーネントを上書きすることは
 * yourlib のルールで禁止されているため、ここでは指定していません。
 * 削除ボタンだけ角をしっかり丸くしたい場合は、Button の契約に新しい
 * variant（例: shape="pill"）を追加し、すべてのパックに反映する必要があります。
 * 追加してよいか確認させてください。
 * パック全体の角丸を大きくしてよい場合は、パック側の
 * --yl-radius-control の値を変更してください。
 */
export function ProjectDangerZone({ onDelete }: DangerZoneProps) {
  return (
    <section aria-labelledby="danger-zone-heading" className="mt-8">
      <Card
        title="危険な操作"
        headingLevel="h2"
        description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p
              style={{
                color: "var(--yl-color-text)",
                fontWeight: "var(--yl-font-weight-title)",
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
              プロジェクトと、その中のすべてのデータが完全に削除されます。
            </p>
          </div>

          <Dialog.Trigger dialog={DIALOG_ID} variant="danger">
            プロジェクトを削除
          </Dialog.Trigger>
        </div>
      </Card>

      <Dialog
        id={DIALOG_ID}
        title="プロジェクトを削除しますか？"
        description="この操作は取り消せません。プロジェクトとその中のすべてのデータが完全に削除されます。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog={DIALOG_ID} variant="secondary" autoFocus>
            キャンセル
          </Dialog.Close>
          <Dialog.Close dialog={DIALOG_ID} variant="danger" onClick={onDelete}>
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

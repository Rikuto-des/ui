"use client";

import { Button, Card, Dialog } from "@yourlib/react";

type ProjectDangerZoneProps = {
  /** Called when the user confirms the deletion in the dialog. */
  onDelete: () => void;
};

const DIALOG_ID = "confirm-delete-project";

/*
 * Note on the delete button:
 * - The red color comes from variant="danger".
 * - The corner radius comes from the active pack (--yl-radius-control),
 *   so this file does not set it with className or style.
 * - To make the corners rounder, change --yl-radius-control in the pack,
 *   or add a new variant to the Button contract and to every pack.
 */
export function ProjectDangerZone({ onDelete }: ProjectDangerZoneProps) {
  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <Card
        title="危険な操作"
        description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
        headingLevel="h2"
        id="danger-zone-heading"
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
              プロジェクトと、そのすべてのデータが完全に削除されます。
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
        description="この操作は取り消せません。プロジェクトと、そのすべてのデータが完全に削除されます。"
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

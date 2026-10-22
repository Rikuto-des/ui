"use client";

import { Button, Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  /** Name of the project, shown in the confirmation dialog. */
  projectName?: string;
  /** Called when the user confirms deletion with 「削除する」. */
  onDelete: () => void;
};

/*
 * About the request for strongly rounded corners on the delete button:
 *
 * - The red color comes from variant="danger". That variant is part of the
 *   contract, so every pack draws it as a destructive button.
 * - Corner radius is set by the active pack, and the Button contract has no
 *   prop for it. Its className may only change margin, width, layout and
 *   position, so adding something like `rounded-full` here would restyle the
 *   component and break the lint rules.
 * - So this file leaves the corners as the pack draws them.
 *
 * If this button needs rounder corners than the pack gives it, there are two
 * ways to get them. Please let me know which one you want:
 *   1. Use a pack (data-pack) whose buttons already have the radius you want.
 *   2. Add a new variant or shape (for example shape="pill") to the Button
 *      contract and to every pack.
 */
export function DangerZone({ projectName, onDelete }: DangerZoneProps) {
  const dialogId = "confirm-delete-project";

  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <Card
        headingLevel="h2"
        title={<span id="danger-zone-heading">危険な操作</span>}
        description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-medium">プロジェクトを削除</p>
            <p className="text-sm text-[color:var(--yl-color-text-muted)]">
              プロジェクトと、その中のすべてのデータが完全に削除されます。
            </p>
          </div>

          <Dialog.Trigger dialog={dialogId} variant="danger">
            プロジェクトを削除
          </Dialog.Trigger>
        </div>
      </Card>

      <Dialog
        id={dialogId}
        title={
          projectName
            ? `プロジェクト「${projectName}」を削除しますか？`
            : "プロジェクトを削除しますか？"
        }
        description="この操作は取り消せません。プロジェクトとその中のすべてのデータが完全に削除されます。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog={dialogId} variant="secondary" autoFocus>
            キャンセル
          </Dialog.Close>
          <Dialog.Close dialog={dialogId} variant="danger" onClick={onDelete}>
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

export type { DangerZoneProps };

// Unused import guard: Button is re-exported for callers that compose this
// section with their own actions.
export { Button as DangerZoneButton };

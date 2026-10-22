"use client";

import { Card, Dialog } from "@yourlib/react";

type DangerZoneProps = {
  /** Called when the user confirms deletion in the dialog. */
  onDelete: () => void;
  /** Project name shown in the confirmation text. */
  projectName?: string;
};

const DIALOG_ID = "confirm-delete-project";

/**
 * The "danger zone" section at the bottom of the project settings page.
 *
 * Note on styling:
 * - The red look of the delete button comes from variant="danger".
 * - The corner radius comes from the active pack, so it is not overridden
 *   with className or style here (yourlib rules 1 and 2).
 * - If you need more strongly rounded corners, the right fix is to add a
 *   variant (for example shape="pill") to the Button contract and to every
 *   pack. Adjusting the pack's radius token is another option.
 */
export function ProjectDangerZone({ onDelete, projectName }: DangerZoneProps) {
  return (
    <Card
      headingLevel="h2"
      title="危険な操作"
      description="ここでの操作は元に戻せません。内容をよく確認してから実行してください。"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p>
          {projectName
            ? `プロジェクト「${projectName}」と、そのすべてのデータを削除します。`
            : "このプロジェクトと、そのすべてのデータを削除します。"}
        </p>

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
          <Dialog.Close dialog={DIALOG_ID} variant="danger" onClick={onDelete}>
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Card>
  );
}

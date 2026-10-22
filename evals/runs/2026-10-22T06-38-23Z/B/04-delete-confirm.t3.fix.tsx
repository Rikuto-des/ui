"use client";

import { useState } from "react";
import { Button, Card, Dialog } from "@yourlib/react";

export type DangerZoneProps = {
  /** 削除が確定したときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** 確認ダイアログに表示するプロジェクト名(任意) */
  projectName?: string;
};

const DIALOG_ID = "delete-project-dialog";

export function DangerZone({ onDelete, projectName }: DangerZoneProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const dialogTitle = projectName
    ? `「${projectName}」を削除しますか?`
    : "プロジェクトを削除しますか?";

  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <h2 id="danger-zone-heading" className="mb-3">
        危険な操作
      </h2>

      <Card className="w-full">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p>
              <strong>プロジェクトを削除</strong>
            </p>
            <p>
              プロジェクトとそのすべてのデータを完全に削除します。この操作は取り消せません。
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="danger"
              radius="full"
              aria-haspopup="dialog"
              aria-controls={DIALOG_ID}
              onClick={() => setOpen(true)}
            >
              プロジェクトを削除
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        id={DIALOG_ID}
        title={dialogTitle}
        description="この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。"
        open={open}
        onOpenChange={(next: boolean) => {
          if (!deleting) setOpen(next);
        }}
      >
        <Dialog.Actions>
          <Button
            variant="secondary"
            radius="full"
            disabled={deleting}
            onClick={() => setOpen(false)}
            autoFocus
          >
            キャンセル
          </Button>
          <Button
            variant="danger"
            radius="full"
            loading={deleting}
            disabled={deleting}
            onClick={handleConfirm}
          >
            削除する
          </Button>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

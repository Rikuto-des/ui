"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@yourlib/react";

export type DangerZoneProps = {
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** 確認ダイアログに表示するプロジェクト名(任意) */
  projectName?: string;
};

const DIALOG_ID = "delete-project-dialog";

/*
 * 補足: ボタンの角の丸みはパックが決めるため、className では変更できません。
 * 「角をしっかり丸く」するには、角丸の大きいパックに切り替えてください。
 * 削除ボタンの赤は variant="danger" で表しています。
 */
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
      <h2
        id="danger-zone-heading"
        className="mb-3 text-lg font-semibold text-[var(--yl-color-danger)]"
      >
        危険な操作
      </h2>

      <Card>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium">プロジェクトを削除</p>
            <p className="text-sm text-[var(--yl-color-text-muted)]">
              プロジェクトとそのすべてのデータを完全に削除します。この操作は取り消せません。
            </p>
          </div>

          <Button
            variant="danger"
            className="self-start sm:self-center"
            aria-haspopup="dialog"
            aria-controls={DIALOG_ID}
            onClick={() => setOpen(true)}
          >
            プロジェクトを削除
          </Button>
        </div>
      </Card>

      <Dialog
        id={DIALOG_ID}
        title={dialogTitle}
        open={open}
        onOpenChange={(next: boolean) => {
          if (!deleting) setOpen(next);
        }}
      >
        <DialogContent>
          <DialogDescription>
            この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。
          </DialogDescription>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? "削除中…" : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

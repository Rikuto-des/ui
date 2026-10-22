"use client";

import { useState } from "react";
import { Button, Card, Dialog } from "@yourlib/react";

export type DangerZoneSectionProps = {
  /** 削除対象のプロジェクト名（ダイアログ内の説明に表示） */
  projectName?: string;
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
};

const DIALOG_ID = "delete-project-dialog";

export function DangerZoneSection({ projectName, onDelete }: DangerZoneSectionProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const description = `${
    projectName ? `「${projectName}」を削除します。` : ""
  }この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。`;

  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <h2 id="danger-zone-heading" className="mb-3 text-lg font-semibold">
        危険な操作
      </h2>

      <Card>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium">プロジェクトを削除</p>
            <p className="text-sm opacity-70">
              プロジェクトとそのすべてのデータを完全に削除します。
            </p>
          </div>

          {/* 角の丸みはパックが決めるため、ここでは指定しない */}
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
        title="プロジェクトを削除しますか？"
        description={description}
        open={open}
        onOpenChange={(next: boolean) => {
          if (!isDeleting) setOpen(next);
        }}
      >
        <Dialog.Actions>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "削除中…" : "削除する"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </section>
  );
}

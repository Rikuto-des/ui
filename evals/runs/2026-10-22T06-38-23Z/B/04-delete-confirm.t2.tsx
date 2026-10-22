"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@yourlib/react";

export type DangerZoneSectionProps = {
  /** 削除対象のプロジェクト名（ダイアログ内の説明に表示） */
  projectName?: string;
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
};

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

  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <h2 id="danger-zone-heading" className="mb-3 text-lg font-semibold">
        危険な操作
      </h2>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium">プロジェクトを削除</p>
          <p className="text-sm opacity-70">
            プロジェクトとそのすべてのデータを完全に削除します。
          </p>
        </div>

        <Button
          variant="danger"
          className="shrink-0 rounded-full"
          onClick={() => setOpen(true)}
        >
          プロジェクトを削除
        </Button>
      </Card>

      <Dialog open={open} onOpenChange={(next: boolean) => !isDeleting && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロジェクトを削除しますか？</DialogTitle>
            <DialogDescription>
              {projectName ? `「${projectName}」を削除します。` : null}
              この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              className="rounded-full"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中…" : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

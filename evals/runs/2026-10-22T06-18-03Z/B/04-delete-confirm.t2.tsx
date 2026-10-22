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

export type DangerZoneProps = {
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** 確認ダイアログに表示するプロジェクト名(任意) */
  projectName?: string;
};

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

  return (
    <section aria-labelledby="danger-zone-heading" className="mt-12">
      <h2
        id="danger-zone-heading"
        className="mb-3 text-lg font-semibold text-red-600"
      >
        危険な操作
      </h2>

      <Card className="border border-red-200">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium">プロジェクトを削除</p>
            <p className="text-sm text-gray-600">
              プロジェクトとそのすべてのデータを完全に削除します。この操作は取り消せません。
            </p>
          </div>

          <Button
            variant="danger"
            className="shrink-0 rounded-full px-6"
            onClick={() => setOpen(true)}
          >
            プロジェクトを削除
          </Button>
        </div>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next: boolean) => {
          if (!deleting) setOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {projectName
                ? `「${projectName}」を削除しますか?`
                : "プロジェクトを削除しますか?"}
            </DialogTitle>
            <DialogDescription>
              この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-full px-6"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              className="rounded-full px-6"
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

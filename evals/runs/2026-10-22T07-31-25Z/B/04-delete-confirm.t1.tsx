"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@yourlib/react";

export type DangerZoneProps = {
  /** 表示用のプロジェクト名(任意) */
  projectName?: string;
  /** 「削除する」確定時に呼ばれる */
  onDelete: () => void | Promise<void>;
};

export function DangerZone({ projectName, onDelete }: DangerZoneProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onDelete();
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section
      aria-labelledby="danger-zone-heading"
      className="mt-12 rounded-2xl border border-red-300 bg-red-50/40 p-6"
    >
      <h2
        id="danger-zone-heading"
        className="text-lg font-semibold text-red-700"
      >
        危険な操作
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-gray-900">プロジェクトを削除</p>
          <p className="mt-1 text-sm text-gray-600">
            {projectName ? `「${projectName}」` : "このプロジェクト"}
            とそのすべてのデータが完全に削除されます。
          </p>
        </div>

        <Button
          variant="danger"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full bg-red-600 px-5 font-semibold text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          プロジェクトを削除
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next: boolean) => {
          if (!deleting) setOpen(next);
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>プロジェクトを削除しますか?</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。
              {projectName ? `「${projectName}」` : "プロジェクト"}
              に含まれるすべてのデータが完全に削除されます。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="rounded-full"
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              disabled={deleting}
              className="rounded-full bg-red-600 font-semibold text-white hover:bg-red-700"
            >
              {deleting ? "削除中…" : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@yourlib/react";

export type DangerZoneSectionProps = {
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** ダイアログ内に表示するプロジェクト名（任意） */
  projectName?: string;
};

export function DangerZoneSection({ onDelete, projectName }: DangerZoneSectionProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      aria-labelledby="danger-zone-heading"
      className="mt-12 rounded-2xl border border-red-300 bg-red-50/40 p-6"
    >
      <h2 id="danger-zone-heading" className="text-lg font-semibold text-red-700">
        危険な操作
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-gray-900">プロジェクトを削除</p>
          <p className="mt-1 text-sm text-gray-600">
            プロジェクトとそれに含まれるすべてのデータが完全に削除されます。
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next: boolean) => {
            if (!isDeleting) setOpen(next);
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="danger"
              className="shrink-0 rounded-full bg-red-600 px-5 text-white hover:bg-red-700 focus-visible:ring-red-500"
            >
              プロジェクトを削除
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {projectName
                  ? `「${projectName}」を削除しますか？`
                  : "プロジェクトを削除しますか？"}
              </DialogTitle>
              <DialogDescription>
                この操作は取り消せません。プロジェクトとそれに含まれるすべてのデータが完全に削除されます。
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-full" disabled={isDeleting}>
                  キャンセル
                </Button>
              </DialogClose>
              <Button
                variant="danger"
                className="rounded-full bg-red-600 px-5 text-white hover:bg-red-700 focus-visible:ring-red-500"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-busy={isDeleting}
              >
                {isDeleting ? "削除中…" : "削除する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

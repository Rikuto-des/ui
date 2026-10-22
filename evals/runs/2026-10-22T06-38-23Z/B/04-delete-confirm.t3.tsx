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
  Heading,
  Text,
} from "@yourlib/react";

export type DangerZoneProps = {
  /** 削除が確定したときに呼ばれる */
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
      <Heading id="danger-zone-heading" level={2} className="mb-3">
        危険な操作
      </Heading>

      <Card className="border border-red-300">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <Text weight="bold">プロジェクトを削除</Text>
            <Text size="sm" color="muted">
              プロジェクトとそのすべてのデータを完全に削除します。この操作は取り消せません。
            </Text>
          </div>

          <Button
            variant="danger"
            radius="full"
            className="shrink-0"
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
        <DialogContent role="alertdialog">
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

          <DialogFooter className="flex justify-end gap-2">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

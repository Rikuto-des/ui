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

export type DangerZoneSectionProps = {
  /** 「削除する」が押されたときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** 確認ダイアログに表示するプロジェクト名（任意） */
  projectName?: string;
};

export function DangerZoneSection({ onDelete, projectName }: DangerZoneSectionProps) {
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
      <Card tone="danger">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <Heading id="danger-zone-heading" level={2} size="md">
              危険な操作
            </Heading>
            <Text tone="muted" size="sm">
              プロジェクトを削除すると、関連するすべてのデータが完全に失われます。
            </Text>
          </div>

          <Button
            variant="danger"
            radius="full"
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
                ? `「${projectName}」を削除しますか？`
                : "プロジェクトを削除しますか？"}
            </DialogTitle>
            <DialogDescription>
              この操作は取り消せません。プロジェクトとそれに含まれるすべてのデータが完全に削除されます。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="secondary"
              radius="full"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              radius="full"
              onClick={handleConfirm}
              loading={deleting}
              disabled={deleting}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

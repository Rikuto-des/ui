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

export type ProjectDangerZoneProps = {
  /** 削除が確定したときに呼ばれる */
  onDelete: () => void | Promise<void>;
  /** ダイアログに表示するプロジェクト名(任意) */
  projectName?: string;
};

export function ProjectDangerZone({ onDelete, projectName }: ProjectDangerZoneProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
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
      <Card className="border border-red-300 p-6">
        <Heading id="danger-zone-heading" level={2} className="text-red-700">
          危険な操作
        </Heading>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Text weight="semibold">プロジェクトを削除</Text>
            <Text size="sm" color="muted">
              プロジェクトとそのすべてのデータが完全に削除されます。
            </Text>
          </div>

          <Button
            variant="danger"
            className="shrink-0 rounded-xl"
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
              className="rounded-xl"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              className="rounded-xl"
              onClick={handleDelete}
              disabled={deleting}
              aria-busy={deleting}
            >
              {deleting ? "削除中…" : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

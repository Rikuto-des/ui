"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Heading,
  Text,
} from "@yourlib/react";

export type DangerZoneProps = {
  /** 「削除する」が押されたときに呼ばれます */
  onDelete: () => void | Promise<void>;
  /** 確認ダイアログに表示するプロジェクト名(任意) */
  projectName?: string;
};

export function DangerZone({ onDelete, projectName }: DangerZoneProps) {
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
        <Heading id="danger-zone-heading" level={2} className="text-red-600">
          危険な操作
        </Heading>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Text className="font-semibold">プロジェクトを削除</Text>
            <Text className="text-sm text-gray-600">
              プロジェクトとそのすべてのデータを完全に削除します。
            </Text>
          </div>

          <Button
            variant="danger"
            className="rounded-full bg-red-600 px-6 text-white hover:bg-red-700"
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
          <DialogTitle>
            {projectName
              ? `「${projectName}」を削除しますか?`
              : "プロジェクトを削除しますか?"}
          </DialogTitle>
          <DialogDescription>
            この操作は取り消せません。プロジェクトに含まれるすべてのデータが完全に削除されます。
          </DialogDescription>

          <DialogActions className="mt-6 flex justify-end gap-3">
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
              className="rounded-full bg-red-600 px-6 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "削除中…" : "削除する"}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </section>
  );
}

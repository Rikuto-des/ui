"use client";
import { CopyIcon } from "@urushi/react/icons";

import { Button, toast } from "@urushi/react";

/** Copies a code block. Confirms with a toast, the same way an app would. */
export function CopyButton({ text }: { text: string }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast("コードをコピーしました");
        } catch {
          toast("コピーできませんでした", { tone: "danger", description: "コードを選んで手動でコピーしてください。" });
        }
      }}
    >
      <CopyIcon size={16} /> コピー
    </Button>
  );
}

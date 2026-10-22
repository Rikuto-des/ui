import { Button, toast } from "@yourlib/react";

/** The client-only part of the gallery: toasts are shown from event handlers. */
export function ToastDemo() {
  return (
    <div className="g-row">
      <Button onClick={() => toast("下書きを保存しました")} data-testid="toast-save">
        下書きを保存
      </Button>
      <Button
        onClick={() =>
          toast("タスクを削除しました", {
            action: { label: "元に戻す", onClick: () => toast("タスクを元に戻しました", { tone: "ok" }) },
          })
        }
        data-testid="toast-undo"
      >
        タスクを削除
      </Button>
      <Button
        onClick={() =>
          toast("送信できませんでした", {
            tone: "danger",
            description: "通信状態を確かめて、もう一度送ってください。",
            duration: 0,
          })
        }
        data-testid="toast-error"
      >
        送信に失敗させる
      </Button>
    </div>
  );
}

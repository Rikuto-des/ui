"use client";
import { useRef, useState } from "react";
import { Button, Dialog, Field, Input } from "@urushi/react";
export default function DialogExample() {
  const [name, setName] = useState("Field notes"),
    [draft, setDraft] = useState(name),
    [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <div className="interaction-study">
      <header>
        <small>FOCUSED EDITING</small>
        <h3>内容を確認して変更を反映する</h3>
      </header>
      <div className="study-cover">
        <small>PROJECT</small>
        <strong>{name}</strong>
        <span>Ideas worth keeping.</span>
      </div>
      <Dialog.Trigger
        dialog="study-dialog"
        onClick={() => {
          setDraft(name);
          setStep(0);
        }}
      >
        プロジェクトを編集
      </Dialog.Trigger>
      <Dialog
        id="study-dialog"
        title="プロジェクトを編集"
        description="このプレビューだけに反映します。"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 0) {
              setStep(1);
              requestAnimationFrame(() => heading.current?.focus());
            } else {
              setName(draft.trim());
              e.currentTarget.closest("dialog")?.close();
            }
          }}
        >
          <div className="study-dialog-content" key={step}>
            {step === 0 ? (
              <Field id="dialog-name" label="プロジェクト名">
                <Input
                  required
                  maxLength={40}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
              </Field>
            ) : (
              <div className="study-result">
                <h3 ref={heading} tabIndex={-1}>
                  この名前に変更します
                </h3>
                <strong>{draft}</strong>
              </div>
            )}
          </div>
          <Dialog.Actions>
            {step === 1 ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(0);
                  requestAnimationFrame(() =>
                    document.getElementById("dialog-name")?.focus(),
                  );
                }}
              >
                戻る
              </Button>
            ) : (
              <Dialog.Close dialog="study-dialog" variant="ghost">
                キャンセル
              </Dialog.Close>
            )}
            <Button type="submit" disabled={!draft.trim()}>
              {step === 0 ? "内容を確認" : "変更を反映"}
            </Button>
          </Dialog.Actions>
        </form>
      </Dialog>
      <p className="study-caption" role="status">
        現在の名前：{name}
      </p>
    </div>
  );
}

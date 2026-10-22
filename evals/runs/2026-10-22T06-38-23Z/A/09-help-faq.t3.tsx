"use client";

import type { FormEvent } from "react";
import {
  Accordion,
  Button,
  Field,
  RadioGroup,
  Textarea,
  toast,
} from "@yourlib/react";

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // TODO: 実際の送信処理（API 呼び出しなど）をここに追加します。
    toast("送信しました", { tone: "ok" });
    form.reset();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 py-10">
      <h1
        className="text-2xl"
        style={{
          color: "var(--yl-color-text)",
          fontWeight: "var(--yl-font-weight-title)",
        }}
      >
        ヘルプ
      </h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2
          id="faq-heading"
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
          }}
        >
          よくある質問
        </h2>

        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料で使えます。チームで使う場合は有料プランをご利用ください。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、設定画面からいつでも解約できます。解約後も月末までは利用できます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れました">
            ログイン画面の「パスワードをお忘れの方」から再設定用のメールを受け取れます。
          </Accordion.Item>
          <Accordion.Item title="データを書き出せますか？">
            はい、設定画面の「データの書き出し」から CSV 形式で書き出せます。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2
          id="contact-heading"
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
          }}
        >
          お問い合わせ
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <RadioGroup name="subject" legend="件名" orientation="horizontal">
            <RadioGroup.Item value="pricing">料金</RadioGroup.Item>
            <RadioGroup.Item value="bug">不具合</RadioGroup.Item>
            <RadioGroup.Item value="other">その他</RadioGroup.Item>
          </RadioGroup>

          <Field id="contact-body" label="本文" required>
            <Textarea name="body" rows={6} />
          </Field>

          <div className="flex justify-end">
            <Button variant="primary" type="submit">
              送信
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

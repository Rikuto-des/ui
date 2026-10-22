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

// <YourlibRuntime /> and <Toaster /> must be rendered once in the root layout.
export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // Send the inquiry to the server here.
    toast("送信しました", { tone: "ok" });
    form.reset();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料でお使いいただけます。追加機能が必要な場合は有料プランをお選びください。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、設定画面からいつでも解約できます。解約後も期間の終わりまではご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れたときは？">
            ログイン画面の「パスワードを忘れた方」から、登録済みのメールアドレスに再設定用のリンクをお送りします。
          </Accordion.Item>
          <Accordion.Item title="データの書き出しはできますか？">
            はい、設定画面の「データ」から CSV 形式で書き出せます。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <RadioGroup
            name="subject"
            legend="件名"
            orientation="horizontal"
            defaultValue="pricing"
          >
            <RadioGroup.Item value="pricing">料金</RadioGroup.Item>
            <RadioGroup.Item value="bug">不具合</RadioGroup.Item>
            <RadioGroup.Item value="other">その他</RadioGroup.Item>
          </RadioGroup>

          <Field id="message" label="本文" required>
            <Textarea name="message" rows={6} />
          </Field>

          <div>
            <Button variant="primary" type="submit">
              送信
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

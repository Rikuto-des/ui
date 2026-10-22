"use client";

import type { FormEvent } from "react";
import {
  Accordion,
  Button,
  Card,
  Field,
  RadioGroup,
  Textarea,
  toast,
} from "@yourlib/react";

// <YourlibRuntime /> and <Toaster /> are rendered once in the root layout.

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Send the inquiry here (e.g. fetch to an API route).
    event.currentTarget.reset();
    toast("送信しました", { tone: "ok" });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-bold">
          よくある質問
        </h2>
        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料でお使いいただけます。有料プランでは追加の機能をご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、設定画面からいつでも解約できます。解約後も期間の終わりまではご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れたときは？">
            ログイン画面の「パスワードを再設定」から、登録したメールアドレスに再設定用のリンクをお送りします。
          </Accordion.Item>
          <Accordion.Item title="データのバックアップはありますか？">
            データは毎日自動でバックアップしています。設定画面からいつでも書き出すこともできます。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2 id="contact-heading" className="text-xl font-bold">
          お問い合わせ
        </h2>
        <Card
          headingLevel="h3"
          title="お問い合わせフォーム"
          description="内容を確認のうえ、ご登録のメールアドレスにご返信します。"
        >
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

            <Field id="contact-body" label="本文" required>
              <Textarea name="body" rows={6} />
            </Field>

            <div className="flex justify-end">
              <Button variant="primary" type="submit">
                送信
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}

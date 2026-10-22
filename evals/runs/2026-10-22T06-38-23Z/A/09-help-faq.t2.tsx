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

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast("送信しました", { tone: "ok" });
    event.currentTarget.reset();
  }

  return (
    <main
      className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-10"
      style={{ color: "var(--yl-color-text)" }}
    >
      <header className="flex flex-col gap-2">
        <h1
          style={{
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
          }}
        >
          ヘルプ
        </h1>
        <p style={{ color: "var(--yl-color-text-muted)" }}>
          よくある質問で解決しない場合は、下のフォームからお問い合わせください。
        </p>
      </header>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2
          id="faq-heading"
          style={{
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
          }}
        >
          よくある質問
        </h2>
        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料でお使いいただけます。有料プランでは保存容量やメンバー数が増えます。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、設定画面からいつでも解約できます。解約後も期間の終わりまでご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れたときは？">
            ログイン画面の「パスワードを再設定」から、登録したメールアドレスに再設定用のリンクをお送りします。
          </Accordion.Item>
          <Accordion.Item title="データのバックアップはありますか？">
            データは毎日自動でバックアップされています。復元が必要な場合はお問い合わせください。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2
          id="contact-heading"
          style={{
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
          }}
        >
          お問い合わせ
        </h2>
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <RadioGroup
              name="subject"
              legend="件名"
              defaultValue="pricing"
              orientation="horizontal"
            >
              <RadioGroup.Item value="pricing">料金</RadioGroup.Item>
              <RadioGroup.Item value="bug">不具合</RadioGroup.Item>
              <RadioGroup.Item value="other">その他</RadioGroup.Item>
            </RadioGroup>

            <Field
              id="contact-body"
              label="本文"
              description="できるだけ具体的にご記入ください。"
              required
            >
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

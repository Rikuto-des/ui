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
    const form = event.currentTarget;
    // ここで送信処理を行う（API 呼び出しなど）
    form.reset();
    toast("送信しました", { tone: "ok" });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 p-6">
      <header className="flex flex-col gap-2">
        <h1
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
          }}
        >
          ヘルプ
        </h1>
        <p
          style={{
            color: "var(--yl-color-text-muted)",
            fontSize: "var(--yl-font-size-body)",
            lineHeight: "var(--yl-font-line-height-body)",
          }}
        >
          よくある質問で解決しない場合は、下のフォームからお問い合わせください。
        </p>
      </header>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2
          id="faq-heading"
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
          }}
        >
          よくある質問
        </h2>
        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料でお使いいただけます。追加機能が必要な場合は有料プランをお選びください。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、設定画面からいつでも解約できます。解約後も期間の終わりまでご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れた場合は？">
            ログイン画面の「パスワードを忘れた方」から、登録済みのメールアドレスに再設定用のリンクをお送りします。
          </Accordion.Item>
          <Accordion.Item title="データのバックアップはありますか？">
            データは毎日自動でバックアップされています。復元が必要な場合はお問い合わせください。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading">
        <form onSubmit={handleSubmit}>
          <Card
            title={<span id="contact-heading">お問い合わせ</span>}
            description="内容を確認のうえ、メールでご返信します。"
            headingLevel="h2"
            padding="lg"
            footer={
              <Button variant="primary" type="submit">
                送信
              </Button>
            }
          >
            <div className="flex flex-col gap-5">
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

              <Field
                id="contact-body"
                label="本文"
                description="できるだけ具体的にご記入ください。"
                required
              >
                <Textarea name="body" rows={6} />
              </Field>
            </div>
          </Card>
        </form>
      </section>
    </main>
  );
}

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

const faqs = [
  {
    question: "料金はかかりますか？",
    answer:
      "基本機能は無料でお使いいただけます。チームでの利用や追加機能が必要な場合は、有料プランをお選びください。",
  },
  {
    question: "解約はいつでもできますか？",
    answer:
      "はい、いつでも解約できます。解約後も、その月の末日までは引き続きご利用いただけます。",
  },
  {
    question: "パスワードを忘れた場合は？",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録したメールアドレスに再設定用のリンクを送ることができます。",
  },
  {
    question: "データのバックアップはありますか？",
    answer:
      "データは毎日自動でバックアップされています。誤って削除した場合も、30 日以内であれば復元できます。",
  },
];

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast("送信しました", { tone: "ok" });
    event.currentTarget.reset();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion name="faq">
          {faqs.map((faq) => (
            <Accordion.Item key={faq.question} title={faq.question}>
              {faq.answer}
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <Card
        title="お問い合わせ"
        description="解決しない場合は、こちらからお問い合わせください。"
        headingLevel="h2"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <RadioGroup name="subject" legend="件名" defaultValue="pricing">
            <RadioGroup.Item value="pricing">料金</RadioGroup.Item>
            <RadioGroup.Item value="bug">不具合</RadioGroup.Item>
            <RadioGroup.Item value="other">その他</RadioGroup.Item>
          </RadioGroup>

          <Field
            id="contact-body"
            label="本文"
            description="できるだけ具体的にお書きください。"
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
    </main>
  );
}

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
      "基本機能は無料でお使いいただけます。チームでの利用や容量の追加が必要な場合は、有料プランをお選びください。",
  },
  {
    question: "プランはいつでも変更できますか？",
    answer:
      "はい、設定画面からいつでも変更できます。変更は次回の請求日から反映されます。",
  },
  {
    question: "解約はいつでもできますか？",
    answer:
      "はい、いつでも解約できます。解約後も、現在の請求期間が終わるまでは引き続きご利用いただけます。",
  },
  {
    question: "データは安全に保管されていますか？",
    answer:
      "通信と保存データはすべて暗号化されています。バックアップも毎日自動で取得しています。",
  },
];

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    toast("送信しました", { tone: "ok" });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1
          className="text-2xl"
          style={{
            color: "var(--yl-color-text)",
            fontWeight: "var(--yl-font-weight-title)",
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
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
          }}
        >
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
        description="内容を確認のうえ、担当者からご連絡します。"
        headingLevel="h2"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            description="不具合の場合は、発生した操作と画面をできるだけ詳しくお書きください。"
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

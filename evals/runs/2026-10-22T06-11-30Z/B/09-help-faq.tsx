"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  Heading,
  Select,
  Text,
  Textarea,
  Toast,
} from "@yourlib/react";

type Faq = {
  id: string;
  question: string;
  answer: string;
};

const FAQS: Faq[] = [
  {
    id: "faq-1",
    question: "料金プランを変更するにはどうすればいいですか？",
    answer:
      "設定画面の「プラン」から、いつでも変更できます。アップグレードはすぐに反映され、ダウングレードは次の請求日から適用されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れですか？」から、登録済みのメールアドレス宛てに再設定用のリンクを送信できます。",
  },
  {
    id: "faq-3",
    question: "データのエクスポートはできますか？",
    answer:
      "はい。各プロジェクトのメニューから CSV 形式でエクスポートできます。大量のデータの場合は、準備ができ次第メールでお知らせします。",
  },
  {
    id: "faq-4",
    question: "退会するとデータはどうなりますか？",
    answer:
      "退会後 30 日間はデータを保持し、その期間内であれば復元できます。30 日を過ぎると、すべてのデータが完全に削除されます。",
  },
];

type Subject = "billing" | "bug" | "other";

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: "billing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const [subject, setSubject] = useState<Subject | "">("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const canSubmit = subject !== "" && body.trim().length > 0 && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // 実際の送信処理（API 呼び出しなど）に置き換えてください
      await new Promise((resolve) => setTimeout(resolve, 400));

      setSubject("");
      setBody("");
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-2">
        <Heading level={1}>ヘルプ</Heading>
        <Text tone="muted">
          よくある質問で解決しない場合は、お問い合わせフォームからご連絡ください。
        </Text>
      </header>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <Heading level={2} id="faq-heading">
          よくある質問
        </Heading>

        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <Text>{faq.answer}</Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <Heading level={2} id="contact-heading">
          お問い合わせ
        </Heading>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            <Select
              label="件名"
              placeholder="選択してください"
              required
              value={subject}
              onValueChange={(value: string) => setSubject(value as Subject)}
              options={SUBJECT_OPTIONS}
            />

            <Textarea
              label="本文"
              placeholder="お問い合わせ内容をご記入ください"
              required
              rows={6}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit} loading={submitting}>
                送信
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        duration={3000}
        position="bottom-right"
      >
        送信しました
      </Toast>
    </main>
  );
}

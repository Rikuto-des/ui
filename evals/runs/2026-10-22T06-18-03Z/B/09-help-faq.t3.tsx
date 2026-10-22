"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Card,
  Field,
  Heading,
  Select,
  Text,
  Textarea,
  Toast,
  ToastProvider,
  ToastViewport,
} from "@yourlib/react";

type Subject = "pricing" | "bug" | "other";

const faqs: { id: string; question: string; answer: string }[] = [
  {
    id: "faq-1",
    question: "料金プランはどのように変更できますか？",
    answer:
      "設定画面の「プラン」タブから、いつでもプランを変更できます。変更内容は次回の請求日から反映されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れの方」をクリックし、登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "データのエクスポートはできますか？",
    answer:
      "はい。各一覧画面の右上にある「エクスポート」ボタンから CSV 形式でダウンロードできます。",
  },
  {
    id: "faq-4",
    question: "解約するとデータはどうなりますか？",
    answer:
      "解約後 30 日間はデータが保持され、その期間内であれば復元できます。30 日を過ぎるとデータは完全に削除されます。",
  },
];

const subjectOptions: { value: Subject; label: string }[] = [
  { value: "pricing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const [subject, setSubject] = useState<Subject | "">("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const canSubmit = subject !== "" && body.trim().length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // 実際の送信処理に置き換えてください
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubject("");
      setBody("");
      setToastOpen(false);
      // 連続送信時にもトーストを再表示できるよう、いったん閉じてから開く
      requestAnimationFrame(() => setToastOpen(true));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ToastProvider duration={3000}>
      <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
        <Heading level={1}>ヘルプ</Heading>

        <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
          <Heading level={2} id="faq-heading">
            よくある質問
          </Heading>
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <Text>{faq.answer}</Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="flex flex-col gap-4"
        >
          <Heading level={2} id="contact-heading">
            お問い合わせ
          </Heading>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Field label="件名" required>
                <Select
                  value={subject}
                  onValueChange={(value: string) =>
                    setSubject(value as Subject)
                  }
                  placeholder="件名を選択してください"
                >
                  {subjectOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Field>

              <Field label="本文" required>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="お問い合わせ内容をご記入ください"
                />
              </Field>

              <div className="flex justify-end">
                <Button type="submit" disabled={!canSubmit} loading={submitting}>
                  送信
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </main>

      <Toast open={toastOpen} onOpenChange={setToastOpen}>
        送信しました
      </Toast>
      <ToastViewport className="fixed bottom-4 right-4" />
    </ToastProvider>
  );
}

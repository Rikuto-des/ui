"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Select,
  Textarea,
  Toast,
} from "@yourlib/react";

const FAQS = [
  {
    id: "faq-1",
    question: "料金プランはどのように変更できますか？",
    answer:
      "設定画面の「プラン」から、いつでもプランを変更できます。変更内容は次回の請求から反映されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れですか？」から、登録済みのメールアドレスに再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "解約するとデータはどうなりますか？",
    answer:
      "解約後 30 日間はデータを保持します。その期間内であれば、再契約によって元の状態に戻せます。",
  },
  {
    id: "faq-4",
    question: "不具合を見つけた場合はどうすればよいですか？",
    answer:
      "このページ下部のお問い合わせフォームで件名に「不具合」を選び、発生した状況をできるだけ詳しくお知らせください。",
  },
];

const SUBJECT_OPTIONS = [
  { value: "billing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!toastOpen) return;
    const timer = setTimeout(() => setToastOpen(false), 3000);
    return () => clearTimeout(timer);
  }, [toastOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: { subject?: string; body?: string } = {};
    if (!subject) nextErrors.subject = "件名を選択してください。";
    if (!body.trim()) nextErrors.body = "本文を入力してください。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: 実際の送信処理（API 呼び出しなど）に置き換えてください。
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubject("");
      setBody("");
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion
          type="single"
          collapsible
          value={openFaq}
          onValueChange={(value: string) => setOpenFaq(value)}
        >
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} title={faq.question}>
              <p className="text-sm leading-relaxed">{faq.answer}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Select
            label="件名"
            placeholder="選択してください"
            options={SUBJECT_OPTIONS}
            value={subject}
            onChange={(value: string) => {
              setSubject(value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
            }}
            error={errors.subject}
            required
          />
          <Textarea
            label="本文"
            rows={6}
            value={body}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              setBody(event.target.value);
              if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }));
            }}
            error={errors.body}
            required
          />
          <div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "送信中…" : "送信"}
            </Button>
          </div>
        </form>
      </section>

      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        position="bottom-right"
      >
        送信しました
      </Toast>
    </main>
  );
}

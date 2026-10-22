"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Label,
  Select,
  Textarea,
  Toast,
} from "@yourlib/react";

const FAQS = [
  {
    id: "faq-1",
    question: "パスワードを忘れてしまいました。どうすればよいですか？",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。",
  },
  {
    id: "faq-2",
    question: "料金プランを変更するにはどうすればよいですか？",
    answer:
      "設定画面の「プランとお支払い」からいつでも変更できます。アップグレードは即時に反映され、ダウングレードは次回の請求日から適用されます。",
  },
  {
    id: "faq-3",
    question: "データをエクスポートできますか？",
    answer:
      "はい。設定画面の「データ管理」から CSV 形式でエクスポートできます。大量のデータの場合、準備ができ次第メールでお知らせします。",
  },
  {
    id: "faq-4",
    question: "アカウントを削除するとデータはどうなりますか？",
    answer:
      "アカウントを削除すると、関連するすべてのデータは 30 日後に完全に削除されます。30 日以内であればサポートへのご連絡で復元できます。",
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
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const canSubmit = subject !== "" && body.trim() !== "" && !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // 実際の送信処理に置き換えてください
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubject("");
      setBody("");
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-10 text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="mb-12">
        <h2 id="faq-heading" className="mb-4 text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion
          type="single"
          collapsible
          value={openFaq}
          onValueChange={(value: string) => setOpenFaq(value)}
        >
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="mb-4 text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-subject">件名</Label>
            <Select
              id="contact-subject"
              value={subject}
              onValueChange={(value: string) => setSubject(value)}
              options={SUBJECT_OPTIONS}
              placeholder="件名を選択してください"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-body">本文</Label>
            <Textarea
              id="contact-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="お問い合わせ内容をご記入ください"
              rows={6}
              required
            />
          </div>

          <div>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "送信中…" : "送信"}
            </Button>
          </div>
        </form>
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

"use client";

import { useState, type FormEvent } from "react";
import { Accordion, Button, Select, Textarea, toast } from "@yourlib/react";

const FAQS = [
  {
    id: "faq-1",
    question: "料金プランを変更するにはどうすればよいですか？",
    answer:
      "「設定」→「プラン」から、いつでもプランを変更できます。変更は次回の請求日から反映されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れですか？」から、登録済みのメールアドレス宛に再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "解約はいつでもできますか？",
    answer:
      "はい、いつでも解約できます。解約後も、現在の請求期間が終わるまではサービスをご利用いただけます。",
  },
  {
    id: "faq-4",
    question: "データのバックアップはありますか？",
    answer:
      "データは毎日自動でバックアップされています。復元が必要な場合は、お問い合わせフォームからご連絡ください。",
  },
];

const SUBJECT_OPTIONS = [
  { value: "pricing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subjectError = submitted && !subject ? "件名を選択してください" : undefined;
  const bodyError = submitted && !body.trim() ? "本文を入力してください" : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!subject || !body.trim()) return;

    // ここで実際の送信処理を行う
    setSubject("");
    setBody("");
    setSubmitted(false);
    toast("送信しました");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-10 text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="mb-12">
        <h2 id="faq-heading" className="mb-4 text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <Accordion.Item key={faq.id} value={faq.id} title={faq.question}>
              {faq.answer}
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="mb-4 text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Select
            label="件名"
            placeholder="選択してください"
            options={SUBJECT_OPTIONS}
            value={subject}
            onChange={(value: string) => setSubject(value)}
            error={subjectError}
            required
          />
          <Textarea
            label="本文"
            placeholder="お問い合わせ内容をご記入ください"
            rows={6}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            error={bodyError}
            required
          />
          <div>
            <Button type="submit">送信</Button>
          </div>
        </form>
      </section>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  Select,
  Textarea,
  Field,
  Button,
  toast,
} from "@yourlib/react";

const FAQS = [
  {
    id: "faq-1",
    question: "料金プランを変更するにはどうすればよいですか？",
    answer:
      "設定画面の「プラン」から、いつでも変更できます。変更内容は次回の請求から反映されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録済みのメールアドレス宛に再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "解約後もデータは残りますか？",
    answer:
      "解約後 30 日間はデータを保持しています。期間内に再開すれば、そのままご利用いただけます。",
  },
  {
    id: "faq-4",
    question: "領収書を発行できますか？",
    answer:
      "設定画面の「請求履歴」から、各月の領収書を PDF でダウンロードできます。",
  },
];

const SUBJECTS = [
  { value: "billing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = subject !== "" && body.trim() !== "" && !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // TODO: 実際の送信処理に置き換えてください
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubject("");
      setBody("");
      toast("送信しました");
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
        <Accordion name="faq">
          {FAQS.map((faq) => (
            <Accordion.Item key={faq.id} title={faq.question}>
              {faq.answer}
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="mb-4 text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Field id="contact-subject" label="件名">
            <Select
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
              required
            >
              <option value="" disabled>
                件名を選択してください
              </option>
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="contact-body" label="本文">
            <Textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
              placeholder="お問い合わせ内容をご記入ください"
              required
            />
          </Field>

          <div>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "送信中…" : "送信"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  Button,
  Field,
  Select,
  Textarea,
  Toaster,
  toast,
} from "@yourlib/react";

const FAQS = [
  {
    id: "faq-1",
    question: "料金プランを変更するにはどうすればよいですか？",
    answer:
      "「設定」→「プランと請求」から、いつでもプランを変更できます。変更内容は次回の請求日から反映されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録済みのメールアドレスに再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "データのエクスポートはできますか？",
    answer:
      "はい。「設定」→「データ管理」から CSV 形式でエクスポートできます。",
  },
  {
    id: "faq-4",
    question: "退会するとデータはどうなりますか？",
    answer:
      "退会手続き後 30 日間はデータが保持され、その後完全に削除されます。期間内であれば復元も可能です。",
  },
] as const;

const SUBJECTS = [
  { value: "billing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
] as const;

export function HelpPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = subject !== "" && body.trim() !== "" && !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // 実際の送信処理に置き換えてください
      await new Promise((resolve) => setTimeout(resolve, 400));

      setSubject("");
      setBody("");
      toast("送信しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="space-y-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
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

      <section aria-labelledby="contact-heading" className="space-y-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field id="contact-subject" label="件名">
            <Select
              id="contact-subject"
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
              id="contact-body"
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
              placeholder="お問い合わせ内容をご記入ください"
              rows={6}
              required
            />
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "送信中…" : "送信"}
            </Button>
          </div>
        </form>
      </section>

      <Toaster position="bottom-end" />
    </main>
  );
}

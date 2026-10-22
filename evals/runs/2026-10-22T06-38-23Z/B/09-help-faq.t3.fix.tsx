"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  Button,
  Card,
  Field,
  Select,
  Textarea,
  Toaster,
  toast,
} from "@yourlib/react";

type Faq = {
  id: string;
  question: string;
  answer: string;
};

const FAQS: Faq[] = [
  {
    id: "faq-1",
    question: "パスワードを忘れた場合はどうすればよいですか？",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。",
  },
  {
    id: "faq-2",
    question: "料金プランを変更するには？",
    answer:
      "「設定」→「プラン」からいつでも変更できます。アップグレードは即時反映され、ダウングレードは次回の請求日から適用されます。",
  },
  {
    id: "faq-3",
    question: "解約するとデータはどうなりますか？",
    answer:
      "解約後 30 日間はデータが保持されます。その期間内であれば再契約によって元の状態に戻せます。30 日を過ぎるとデータは完全に削除されます。",
  },
  {
    id: "faq-4",
    question: "領収書を発行できますか？",
    answer:
      "「設定」→「請求履歴」から各月の領収書を PDF でダウンロードできます。宛名の変更も同じ画面から行えます。",
  },
];

type Subject = "pricing" | "bug" | "other";

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: "pricing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

const errorStyle = { color: "var(--yl-color-danger)" };

export function HelpPage() {
  const [subject, setSubject] = useState<Subject | "">("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: { subject?: string; body?: string } = {};
    if (!subject) nextErrors.subject = "件名を選択してください。";
    if (!body.trim()) nextErrors.body = "本文を入力してください。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // 実際の送信処理（API 呼び出しなど）に置き換えてください。
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({ title: "送信しました", duration: 3000 });
      setSubject("");
      setBody("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
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

      <section aria-label="お問い合わせ">
        <Card title="お問い合わせ">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Field id="contact-subject" label="件名">
              <Select
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value as Subject);
                  setErrors((prev) => ({ ...prev, subject: undefined }));
                }}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "contact-subject-error" : undefined}
              >
                <option value="" disabled>
                  選択してください
                </option>
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.subject && (
                <p id="contact-subject-error" className="text-sm" style={errorStyle}>
                  {errors.subject}
                </p>
              )}
            </Field>

            <Field id="contact-body" label="本文">
              <Textarea
                rows={6}
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                  setErrors((prev) => ({ ...prev, body: undefined }));
                }}
                placeholder="お問い合わせ内容をご記入ください"
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? "contact-body-error" : undefined}
              />
              {errors.body && (
                <p id="contact-body-error" className="text-sm" style={errorStyle}>
                  {errors.body}
                </p>
              )}
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "送信中…" : "送信"}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <Toaster position="bottom-right" />
    </main>
  );
}

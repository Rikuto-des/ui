"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  Button,
  Card,
  Field,
  Select,
  Textarea,
  toast,
} from "@yourlib/react";

const FAQS = [
  {
    id: "faq-1",
    question: "アカウントの登録に料金はかかりますか？",
    answer:
      "アカウントの登録は無料です。有料プランの機能を使う場合のみ、月額料金が発生します。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "プランの変更や解約はいつでもできますか？",
    answer:
      "はい、設定画面の「プラン」からいつでも変更・解約できます。解約後も、契約期間の終了日までは引き続きご利用いただけます。",
  },
  {
    id: "faq-4",
    question: "不具合を見つけた場合はどうすればよいですか？",
    answer:
      "このページ下部の「お問い合わせ」フォームで件名に「不具合」を選び、発生した状況をできるだけ詳しくお知らせください。",
  },
];

const SUBJECTS = [
  { value: "billing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const canSubmit = subject !== "" && body.trim() !== "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubject("");
    setBody("");
    toast("送信しました");
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
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

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field id="contact-subject" label="件名">
              <Select
                value={subject}
                onChange={(e) => setSubject(e.currentTarget.value)}
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
                placeholder="お問い合わせ内容を入力してください"
                value={body}
                onChange={(e) => setBody(e.currentTarget.value)}
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                送信
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}

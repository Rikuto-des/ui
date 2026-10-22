"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Toast,
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
  const [toastOpen, setToastOpen] = useState(false);

  const canSubmit = subject !== "" && body.trim() !== "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubject("");
    setBody("");
    setToastOpen(true);
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-subject">件名</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="contact-subject">
                  <SelectValue placeholder="件名を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-body">本文</Label>
              <Textarea
                id="contact-body"
                rows={6}
                placeholder="お問い合わせ内容を入力してください"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                送信
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <Toast open={toastOpen} onOpenChange={setToastOpen} duration={3000}>
        送信しました
      </Toast>
    </main>
  );
}

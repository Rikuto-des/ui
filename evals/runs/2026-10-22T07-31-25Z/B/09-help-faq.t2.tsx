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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Toaster,
  useToast,
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
  const { toast } = useToast();
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
      toast({ title: "送信しました", duration: 3000 });
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
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="space-y-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contact-subject">件名</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="contact-subject" className="w-full">
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

          <div className="space-y-2">
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

          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "送信中…" : "送信"}
            </Button>
          </div>
        </form>
      </section>

      <Toaster position="bottom-right" />
    </main>
  );
}

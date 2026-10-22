"use client";

import { useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Field,
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

type Subject = "pricing" | "bug" | "other";

const FAQS: { id: string; question: string; answer: string }[] = [
  {
    id: "faq-1",
    question: "料金プランを変更するにはどうすればよいですか？",
    answer:
      "設定画面の「プラン」から、いつでもプランを変更できます。変更内容は次回の請求日から反映されます。",
  },
  {
    id: "faq-2",
    question: "パスワードを忘れてしまいました。",
    answer:
      "ログイン画面の「パスワードをお忘れの方」から、登録済みのメールアドレス宛てに再設定用のリンクをお送りします。",
  },
  {
    id: "faq-3",
    question: "データはどのように保護されていますか？",
    answer:
      "通信はすべて暗号化され、保存データも暗号化して管理しています。定期的なバックアップも実施しています。",
  },
  {
    id: "faq-4",
    question: "解約後もデータは残りますか？",
    answer:
      "解約後 30 日間はデータを保持します。その期間内に再契約いただければ、以前のデータをそのままご利用いただけます。",
  },
];

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: "pricing", label: "料金" },
  { value: "bug", label: "不具合" },
  { value: "other", label: "その他" },
];

export function HelpPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject | "">("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = subject !== "" && body.trim().length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // 実際の送信処理に置き換えてください
      await new Promise((resolve) => setTimeout(resolve, 400));

      toast({ title: "送信しました", duration: 3000 });
      setSubject("");
      setBody("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-10">
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

      <section aria-labelledby="contact-heading">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 id="contact-heading" className="text-xl font-semibold">
                お問い合わせ
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Field>
                <Label htmlFor="contact-subject">件名</Label>
                <Select
                  value={subject}
                  onValueChange={(value: string) => setSubject(value as Subject)}
                >
                  <SelectTrigger id="contact-subject">
                    <SelectValue placeholder="件名を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="contact-body">本文</Label>
                <Textarea
                  id="contact-body"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="お問い合わせ内容をご記入ください"
                />
              </Field>

              <div className="flex justify-end">
                <Button type="submit" disabled={!canSubmit}>
                  {submitting ? "送信中…" : "送信"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <Toaster position="bottom-right" />
    </main>
  );
}

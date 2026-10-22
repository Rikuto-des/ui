"use client";

import type { FormEvent } from "react";
import {
  Accordion,
  Button,
  Card,
  Field,
  RadioGroup,
  Textarea,
  toast,
} from "@yourlib/react";

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // 実際の送信処理はここに追加します。
    toast("送信しました", { tone: "ok" });
    form.reset();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--yl-color-text)" }}
        >
          ヘルプ
        </h1>
        <p style={{ color: "var(--yl-color-text-muted)" }}>
          よくある質問で解決しない場合は、お問い合わせフォームからご連絡ください。
        </p>
      </header>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2
          id="faq-heading"
          className="text-xl font-semibold"
          style={{ color: "var(--yl-color-text)" }}
        >
          よくある質問
        </h2>
        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料でお使いいただけます。有料プランでは追加機能をご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、設定画面からいつでも解約できます。解約後も請求期間の終わりまではご利用いただけます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れた場合は？">
            ログイン画面の「パスワードを忘れた方」から、登録済みのメールアドレスに再設定用のリンクを送信できます。
          </Accordion.Item>
          <Accordion.Item title="データはどこに保存されますか？">
            データは国内のデータセンターに暗号化して保存しています。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="sr-only">
          お問い合わせ
        </h2>
        <Card
          title="お問い合わせ"
          description="内容を確認のうえ、2 営業日以内にご返信します。"
          headingLevel="h3"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <RadioGroup
              name="subject"
              legend="件名"
              defaultValue="pricing"
              orientation="horizontal"
            >
              <RadioGroup.Item value="pricing">料金</RadioGroup.Item>
              <RadioGroup.Item value="bug">不具合</RadioGroup.Item>
              <RadioGroup.Item value="other">その他</RadioGroup.Item>
            </RadioGroup>

            <Field id="contact-body" label="本文" required>
              <Textarea name="body" rows={6} />
            </Field>

            <div className="flex justify-end">
              <Button variant="primary" type="submit">
                送信
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}

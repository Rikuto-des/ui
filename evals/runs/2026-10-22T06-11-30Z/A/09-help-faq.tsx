"use client";

import type { FormEvent } from "react";
import {
  Accordion,
  Button,
  Field,
  RadioGroup,
  Textarea,
  toast,
} from "@yourlib/react";

export function HelpPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // 実際の送信処理（API 呼び出しなど）はここに追加します。
    form.reset();
    toast("送信しました", { tone: "ok" });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 py-10">
      <h1 className="text-2xl font-bold">ヘルプ</h1>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold">
          よくある質問
        </h2>
        <Accordion name="faq">
          <Accordion.Item title="料金はかかりますか？">
            基本機能は無料で始められます。有料プランは必要になったときにいつでも切り替えられます。
          </Accordion.Item>
          <Accordion.Item title="解約はいつでもできますか？">
            はい、いつでも解約できます。解約後も請求期間の終わりまではそのまま使えます。
          </Accordion.Item>
          <Accordion.Item title="パスワードを忘れたときは？">
            ログイン画面の「パスワードを忘れた場合」から、登録したメールアドレスに再設定用のメールを送れます。
          </Accordion.Item>
          <Accordion.Item title="データは安全に保管されますか？">
            通信と保存データはどちらも暗号化しています。バックアップも毎日取得しています。
          </Accordion.Item>
        </Accordion>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
        <h2 id="contact-heading" className="text-xl font-semibold">
          お問い合わせ
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <RadioGroup name="subject" legend="件名" defaultValue="pricing">
            <RadioGroup.Item value="pricing">料金</RadioGroup.Item>
            <RadioGroup.Item value="bug">不具合</RadioGroup.Item>
            <RadioGroup.Item value="other">その他</RadioGroup.Item>
          </RadioGroup>

          <Field
            id="contact-body"
            label="本文"
            description="お問い合わせの内容をできるだけ詳しくご記入ください。"
            required
          >
            <Textarea name="body" rows={6} />
          </Field>

          <div>
            <Button variant="primary" type="submit">
              送信
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

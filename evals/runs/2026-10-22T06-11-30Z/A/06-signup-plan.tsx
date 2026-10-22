import { Button, Checkbox, Field, Input, RadioGroup } from "@yourlib/react";

/**
 * 会員登録フォーム
 *
 * パック: アプリ既定のパック（<html data-pack> を継承）、標準密度。
 *
 * 【要確認】選択中プランの「ブランドの紫色の枠」について
 * 選択中の RadioGroup.Item の見た目はパックが決めます。className / style での上書き、
 * 色の直接指定（hex や oklch）、Tailwind の任意値は、yourlib のルールで使えません。
 * そのため、この画面では紫の枠を直接書いていません。次のどちらで進めるか決めてください。
 *   1. 有効なパックの選択時の強調色（--yl-color-accent）をブランドの紫にする（パック側で設定）
 *   2. RadioGroup に「カード型・選択時に枠で強調」の variant を契約と全パックへ追加し、
 *      ここで variant を指定する
 */
export function SignupScreen() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">会員登録</h1>

      <form method="post" className="flex flex-col gap-6">
        <Field id="signup-name" label="氏名" required>
          <Input type="text" name="name" autoComplete="name" />
        </Field>

        <Field id="signup-email" label="メールアドレス" required>
          <Input type="email" name="email" autoComplete="email" />
        </Field>

        <Field id="signup-company" label="会社名（任意）">
          <Input type="text" name="company" autoComplete="organization" />
        </Field>

        <RadioGroup name="plan" legend="プラン" defaultValue="team">
          <RadioGroup.Item value="free">フリー</RadioGroup.Item>
          <RadioGroup.Item value="team" description="月 1,200 円">
            チーム
          </RadioGroup.Item>
          <RadioGroup.Item value="enterprise" description="要相談">
            エンタープライズ
          </RadioGroup.Item>
        </RadioGroup>

        <Checkbox name="terms" required>
          利用規約に同意します
        </Checkbox>

        <Button variant="primary" type="submit" className="w-full">
          登録する
        </Button>
      </form>
    </main>
  );
}

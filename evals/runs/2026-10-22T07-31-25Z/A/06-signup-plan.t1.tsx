// 選択中プランの「紫の枠」について:
// yourlib では、コンポーネントの見た目をクラスや style で上書きできません。
// また、色は直接指定せず、パック（テーマ）のトークンから取ります。
// 選択中のラジオは、パックが --yl-color-accent（フォーカス・選択状態の色）で強調します。
// この accent をブランドの紫にするには、パックのトークンで設定してください。
// accent とは別に「選択中プランを枠で囲む」見た目が必要な場合は、
// RadioGroup に新しい variant を追加します。その variant はコントラクトと全パックに登録します。
// どちらにするか決まったら教えてください。それまでは、ここで色を直接書くことはしていません。

import {
  Button,
  Checkbox,
  Field,
  Input,
  RadioGroup,
  Separator,
} from "@yourlib/react";

export function SignupScreen() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <h1
        className="mb-2"
        style={{
          color: "var(--yl-color-text)",
          fontSize: "var(--yl-font-size-title)",
          fontWeight: "var(--yl-font-weight-title)",
          lineHeight: "var(--yl-font-line-height-title)",
        }}
      >
        会員登録
      </h1>
      <p
        className="mb-8"
        style={{
          color: "var(--yl-color-text-muted)",
          fontSize: "var(--yl-font-size-body)",
        }}
      >
        必要事項を入力して、プランを選んでください。
      </p>

      <form method="post" className="flex flex-col gap-5">
        <Field id="signup-name" label="氏名" required>
          <Input type="text" name="name" autoComplete="name" />
        </Field>

        <Field id="signup-email" label="メールアドレス" required>
          <Input type="email" name="email" autoComplete="email" />
        </Field>

        <Field
          id="signup-company"
          label="会社名（任意）"
          description="個人でご利用の場合は空欄のままで構いません。"
        >
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

        <Separator decorative />

        <Checkbox name="terms" required>
          利用規約に同意します
        </Checkbox>

        <div className="flex justify-end">
          <Button variant="primary" type="submit">
            登録する
          </Button>
        </div>
      </form>
    </main>
  );
}

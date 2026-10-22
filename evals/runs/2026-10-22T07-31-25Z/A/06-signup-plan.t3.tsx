import { Button, Checkbox, Field, Input, RadioGroup } from "@yourlib/react";

/*
 * 選択中のプランの「ブランドの紫色の枠」について:
 * RadioGroup には選択中の項目を枠で強調する variant がないため、className や style、
 * 色の直書きでは上書きしていません。選択状態の見た目は有効なパックが描画します
 * （選択状態にはパックの --yl-color-accent が使われます）。
 * パックのアクセント色をブランドの紫にするか、RadioGroup に「カード型」などの variant を
 * 追加するか（コントラクトと全パックへの追加が必要です）、どちらにするか確認させてください。
 */

export function SignupScreen() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1
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
        className="mt-2"
        style={{
          color: "var(--yl-color-text-muted)",
          fontSize: "var(--yl-font-size-body)",
        }}
      >
        必要事項を入力し、プランを選んでください。
      </p>

      <form method="post" className="mt-8 flex flex-col gap-6">
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

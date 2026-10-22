/**
 * 会員登録フォーム
 *
 * 「選択中のプランを紫の枠で強調」について:
 * この画面では未実装です。RadioGroup.Item には枠付きで表示するバリアントがありません。
 * また、className や独自 CSS でコンポーネントの見た目を変えたり、紫の色値を直接書いたりすることは
 * yourlib のルールで禁止されています。現在は、パックが標準で表示する選択状態
 * （--yl-color-accent）で選択中のプランを示しています。
 *
 * 枠で強調したい場合は、次のどちらかが必要です。
 *   1. RadioGroup に枠付き表示のバリアント（例: variant="card"）を追加する。
 *      契約と、すべてのパックに追加します。
 *   2. 使用中のパックの --yl-color-accent をブランドの紫に設定する。
 * どちらで進めるかご指示ください。
 */
import { Button, Checkbox, Field, Input, RadioGroup } from "@yourlib/react";

export function SignupScreen() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <h1
        className="mb-2"
        style={{
          color: "var(--yl-color-text)",
          fontSize: "var(--yl-font-size-title)",
          fontWeight: "var(--yl-font-weight-title)",
          lineHeight: "var(--yl-font-line-height-title)",
          letterSpacing: "var(--yl-font-tracking-title)",
        }}
      >
        会員登録
      </h1>
      <p
        className="mb-8"
        style={{
          color: "var(--yl-color-text-muted)",
          fontSize: "var(--yl-font-size-body)",
          lineHeight: "var(--yl-font-line-height-body)",
        }}
      >
        必要事項を入力して、プランを選んでください。
      </p>

      <form action="/signup" method="post" className="flex flex-col gap-6">
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

        <Button variant="primary" type="submit" size="lg" className="w-full">
          登録する
        </Button>
      </form>
    </main>
  );
}

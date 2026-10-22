import {
  Button,
  Checkbox,
  Field,
  Input,
  RadioGroup,
} from "@yourlib/react";

/*
 * 会員登録フォーム
 *
 * 選択中のプランの紫の枠について:
 * 「ブランドの紫色の枠で強調する」見た目は実装していません。
 * yourlib では、コンポーネントの見た目は有効なパックが決めます。
 * className や style、生の色値（紫の hex など）で RadioGroup.Item を
 * 塗り替えることはルールで禁止されています（SKILL.md ルール 1〜3）。
 *
 * 現在は、選択状態をパック標準の表示（--yl-color-accent）で示しています。
 * ブランドの紫枠が必要な場合は、RadioGroup.Item に新しいバリアント
 * （例: variant="card"）を追加してください。追加先はコンポーネントの
 * コントラクトとすべてのパックです。
 * パックのアクセント色自体を紫にする方法もあります。
 * どちらにするか決めていただければ、それに合わせて更新します。
 */
export function SignupForm() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
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

      <form action="/api/signup" method="post" className="flex flex-col gap-5">
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

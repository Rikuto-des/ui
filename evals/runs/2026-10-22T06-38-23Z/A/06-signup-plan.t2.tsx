// 会員登録フォーム
//
// 注意: 「選択中のプランをブランドの紫色の枠で強調する」は実装していません。
// - RadioGroup に枠で強調する variant がなく、className や style で見た目を変えることは禁止されています（SKILL.md ルール 1・2）。
// - 紫の生の色値（hex / oklch）も使えません（ルール 3）。
// 選択状態は、現在の pack が --yl-color-accent（選択状態用のトークン）で表示します。
// 枠付きの強調が必要な場合は、RadioGroup に新しい variant（例: variant="card"）を
// コンポーネントの契約とすべての pack に追加する必要があります。追加してよいか確認させてください。

import {
  Button,
  Checkbox,
  Field,
  Input,
  RadioGroup,
} from "@yourlib/react";

export function SignupForm() {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1
        className="mb-6"
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

      <form method="post" action="/signup" className="flex flex-col gap-5">
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

        <div className="flex justify-end">
          <Button variant="primary" type="submit">
            登録する
          </Button>
        </div>
      </form>
    </main>
  );
}

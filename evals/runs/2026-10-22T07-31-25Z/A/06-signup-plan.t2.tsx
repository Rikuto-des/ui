// 選択中プランの「ブランドの紫色の枠」について:
// RadioGroup.Item に className / style で枠線や色を足すことはコントラクトで禁止されています（SKILL.md ルール 1・2）。
// また紫色の生の値（hex / oklch）や Tailwind のパレット色も使えず、`--yl-*` に「ブランドの紫」というトークンはありません（ルール 3）。
// 選択状態の色は `--yl-color-accent`（Focus, selection and in-progress state）が担当し、その値はパックが決めます。
// そのためこの画面では選択中プランの強調をパックの選択スタイルに任せています。
// 紫の枠で強調するには、次のどちらかが必要です。どちらにするか確認させてください。
//   1. パックの `--yl-color-accent` をブランドの紫にする
//   2. RadioGroup に「カード型で選択中を枠で強調する」バリアントを追加し、コントラクトと全パックに入れる
// 方針が決まるまで、ここではインラインで代用していません。

import {
  Button,
  Checkbox,
  Field,
  Input,
  Link,
  RadioGroup,
} from "@yourlib/react";

export function SignupScreen() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold" style={{ color: "var(--yl-color-text)" }}>
        会員登録
      </h1>
      <p className="mt-2" style={{ color: "var(--yl-color-text-muted)" }}>
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

        <div className="flex flex-col gap-2">
          <Checkbox name="terms" required>
            利用規約に同意します
          </Checkbox>
          <p className="text-sm" style={{ color: "var(--yl-color-text-muted)" }}>
            内容は<Link href="/terms">利用規約</Link>でご確認いただけます。
          </p>
        </div>

        <Button variant="primary" type="submit" size="lg" className="w-full">
          登録する
        </Button>
      </form>
    </main>
  );
}

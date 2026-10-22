// 選択中のプランを「ブランドの紫色の枠」で強調する指定は、このファイルには入れていません。
// yourlib のルールでは、コンポーネントの見た目を className や style で上書きしたり、
// 生の色の値（紫の hex など）を書いたりすることはできません。
// RadioGroup.Item には、選択中の項目を枠で強調する variant が契約に用意されていません。
// 実現するには、RadioGroup に variant（例: variant="card"）を追加し、
// 選択中の項目の枠をブランドのアクセントトークン（var(--yl-color-…)）で描くよう
// 契約とすべての pack に定義する必要があります。
// そのような variant を追加してよいか、また紫が pack の accent トークンに当たるかを確認してください。
// 決まれば、下の RadioGroup に variant を指定するだけで反映できます。

import { Button, Card, Checkbox, Field, Input, RadioGroup } from "@yourlib/react";

export function SignupScreen() {
  return (
    <main className="px-4 py-12">
      <Card
        title="会員登録"
        description="必要事項を入力し、プランを選んでください。"
        headingLevel="h2"
        padding="lg"
        className="mx-auto w-full max-w-lg"
      >
        <form id="signup-form" method="post" className="flex flex-col gap-6">
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
      </Card>
    </main>
  );
}

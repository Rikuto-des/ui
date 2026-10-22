import { Button, Checkbox, Field, Input, RadioGroup } from "@yourlib/react";

/*
 * 会員登録フォーム
 *
 * 選択中プランの「ブランドの紫色の枠」による強調は、まだ実装していません。確認させてください。
 *
 * yourlib のルールでは、コンポーネントの見た目は有効なパックから決まります。
 * そのため、RadioGroup.Item に className や style、生の色値を当てて枠を付けることはできません。
 * また、RadioGroup の契約には選択中の項目を強調するバリアントがありません。
 *
 * どちらで進めるか決めてください。
 *   1. 契約と全パックに、強調用のバリアント（例: RadioGroup の variant="card"）を追加する
 *   2. 各パックが持つ標準の選択中スタイルのままにする
 *
 * 「ブランドの紫」に対応する意味トークン（var(--yl-color-…)）の名前も教えてください。
 * どちらに決まっても、このファイルではプロップを 1 つ足すだけで済みます。
 */
export function SignupForm() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">会員登録</h1>

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

        <div className="flex justify-end">
          <Button variant="primary" type="submit">
            登録する
          </Button>
        </div>
      </form>
    </main>
  );
}

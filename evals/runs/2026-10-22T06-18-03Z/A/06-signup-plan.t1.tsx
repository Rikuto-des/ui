import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  RadioGroup,
} from "@yourlib/react";

/*
 * Note on highlighting the selected plan with a purple border:
 * yourlib takes its visuals from the active pack. Adding a border color
 * through className, style, raw color values or Tailwind arbitrary values
 * breaks the contract (SKILL.md rules 1–3). RadioGroup has no variant that
 * highlights the selected option as a framed card.
 *
 * The selected state is therefore left to the pack's default styling for now.
 * If you need the brand purple border, add a variant (for example
 * RadioGroup variant="card") to the contract and to every pack, so it can be
 * applied with the accent token (var(--yl-color-…)). Please tell us if you
 * want this variant added.
 */

export function SignupScreen() {
  return (
    <main className="px-4 py-12">
      <form action="/signup" method="post" className="mx-auto w-full max-w-lg">
        <Card
          headingLevel="h2"
          padding="lg"
          title="会員登録"
          description="必要事項を入力して、プランを選んでください。"
          footer={
            <Button variant="primary" type="submit">
              登録する
            </Button>
          }
        >
          <div className="flex flex-col gap-6">
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
          </div>
        </Card>
      </form>
    </main>
  );
}

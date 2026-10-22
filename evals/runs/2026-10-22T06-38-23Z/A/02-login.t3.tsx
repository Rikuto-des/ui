import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

export type LoginPageProps = {
  /** Shown below the password field when present. */
  error?: string;
  /** Form submission target. */
  action?: string;
};

export function LoginPage({ error, action = "/login" }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--yl-color-bg)" }}
    >
      <h1 className="sr-only">アカウントにログイン</h1>
      <Card
        title="ログイン"
        description="メールアドレスとパスワードを入力してください。"
        headingLevel="h2"
        padding="lg"
        className="w-full max-w-sm"
      >
        <form method="post" action={action} className="flex flex-col gap-5">
          <Field id="login-email" label="メールアドレス" required>
            <Input type="email" name="email" autoComplete="email" inputMode="email" />
          </Field>

          <Field
            id="login-password"
            label="パスワード"
            required
            error={error || undefined}
          >
            <Input type="password" name="password" autoComplete="current-password" />
          </Field>

          <Checkbox name="remember" value="1">
            ログイン状態を保持する
          </Checkbox>

          <Button variant="primary" type="submit" className="w-full">
            ログイン
          </Button>

          <div className="flex justify-center">
            <Link href="/reset-password" variant="standalone">
              パスワードをお忘れの方
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}

import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

type LoginPageProps = {
  /** ログインに失敗したときのエラーメッセージ。パスワード欄の下に表示します。 */
  error?: string;
  /** フォームの送信先（URL または Server Action）。 */
  action?: string | ((formData: FormData) => void | Promise<void>);
};

export function LoginPage({ error, action }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--yl-color-bg)" }}
    >
      <h1 className="sr-only">ログイン</h1>

      <Card
        className="w-full max-w-sm"
        headingLevel="h2"
        title="アカウントにログイン"
        description="メールアドレスとパスワードを入力してください。"
        padding="lg"
      >
        <form action={action} method="post" className="flex flex-col gap-5">
          <Field id="login-email" label="メールアドレス" required>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
            />
          </Field>

          <Field
            id="login-password"
            label="パスワード"
            required
            error={error ? error : undefined}
          >
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Checkbox name="remember">ログイン状態を保持する</Checkbox>
            <Link href="/reset-password" variant="standalone">
              パスワードをお忘れの方
            </Link>
          </div>

          <Button variant="primary" type="submit" size="lg" className="w-full">
            ログイン
          </Button>
        </form>
      </Card>
    </main>
  );
}

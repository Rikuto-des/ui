import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

export type LoginPageProps = {
  /** パスワード欄の下に表示するエラーメッセージ */
  error?: string;
  /** フォームの送信先 */
  action?: string;
};

export function LoginPage({ error, action = "/api/login" }: LoginPageProps) {
  const passwordError =
    typeof error === "string" && error.length > 0 ? error : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card
        title="ログイン"
        description="メールアドレスとパスワードを入力してください。"
        headingLevel="h2"
        padding="lg"
        className="w-full max-w-sm"
      >
        <form
          id="login-form"
          method="post"
          action={action}
          className="flex flex-col gap-4"
        >
          <Field id="login-email" label="メールアドレス" required>
            <Input type="email" name="email" autoComplete="email" />
          </Field>

          <Field
            id="login-password"
            label="パスワード"
            error={passwordError}
            required
          >
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
            />
          </Field>

          <Checkbox name="remember">ログイン状態を保持する</Checkbox>

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

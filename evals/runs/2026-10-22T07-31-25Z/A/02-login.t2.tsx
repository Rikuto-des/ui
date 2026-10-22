import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--yl-color-bg)" }}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1
          className="text-center"
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
          }}
        >
          ログイン
        </h1>

        <Card className="w-full" padding="lg">
          <form method="post" className="flex flex-col gap-5">
            <Field id="email" label="メールアドレス" required>
              <Input type="email" name="email" autoComplete="email" />
            </Field>

            <Field
              id="password"
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

            <Checkbox name="remember">ログイン状態を保持する</Checkbox>

            <Button variant="primary" type="submit" className="w-full">
              ログイン
            </Button>

            <p className="text-center">
              <Link href="/reset-password" variant="standalone">
                パスワードをお忘れの方
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}

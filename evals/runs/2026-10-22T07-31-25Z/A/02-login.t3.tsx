import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--yl-color-bg)" }}
    >
      <div className="w-full max-w-sm">
        <Card padding="lg">
          <form method="post" className="flex flex-col gap-5" noValidate={false}>
            <h1
              style={{
                margin: 0,
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-title)",
                fontWeight: "var(--yl-font-weight-title)",
                lineHeight: "var(--yl-font-line-height-title)",
                letterSpacing: "var(--yl-font-tracking-title)",
              }}
            >
              ログイン
            </h1>

            <Field id="email" label="メールアドレス" required>
              <Input type="email" name="email" autoComplete="email" />
            </Field>

            <Field id="password" label="パスワード" error={error || undefined} required>
              <Input type="password" name="password" autoComplete="current-password" />
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
      </div>
    </main>
  );
}

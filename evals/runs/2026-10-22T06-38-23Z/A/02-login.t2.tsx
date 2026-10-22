import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

type LoginPageProps = {
  /** Shown under the password field when sign-in fails. */
  error?: string;
  /** Form action: a URL or a Server Action. */
  action?: string | ((formData: FormData) => void | Promise<void>);
};

export function LoginPage({ error, action = "/api/login" }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--yl-color-bg)" }}
    >
      <Card padding="lg" className="w-full max-w-sm">
        <h1
          className="mb-6"
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
            fontFeatureSettings: "var(--yl-font-features-title)",
          }}
        >
          ログイン
        </h1>

        <form action={action} method="post" className="flex flex-col gap-5">
          <Field id="login-email" label="メールアドレス" required>
            <Input type="email" name="email" autoComplete="email" />
          </Field>

          <Field id="login-password" label="パスワード" error={error} required>
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

          <Link href="/reset-password" variant="standalone">
            パスワードをお忘れの方
          </Link>
        </form>
      </Card>
    </main>
  );
}

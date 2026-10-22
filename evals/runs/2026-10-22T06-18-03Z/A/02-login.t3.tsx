import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error }: LoginPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">ログイン</h1>

      <Card className="w-full max-w-sm" padding="lg">
        <form method="post" className="flex flex-col gap-4">
          <Field id="email" label="メールアドレス" required>
            <Input type="email" name="email" autoComplete="email" />
          </Field>

          <Field id="password" label="パスワード" error={error} required>
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

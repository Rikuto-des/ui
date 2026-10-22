"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginPageProps = {
  /** ログイン失敗時などに表示するエラーメッセージ */
  error?: string;
  /** 送信中かどうか */
  loading?: boolean;
  /** フォーム送信時のハンドラ */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
};

export function LoginPage({ error, loading = false, onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit?.({ email, password, remember });
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--yl-color-bg)" }}
    >
      <div className="w-full max-w-sm">
        <Card className="w-full">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <h1
              className="text-center text-2xl font-bold"
              style={{ color: "var(--yl-color-text)" }}
            >
              ログイン
            </h1>

            <div className="flex flex-col gap-4">
              <Field id="email" label="メールアドレス">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                />
              </Field>

              <div>
                <Field id="password" label="パスワード">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? "login-error" : undefined}
                  />
                </Field>
                {hasError && (
                  <p
                    id="login-error"
                    role="alert"
                    className="mt-2 text-sm"
                    style={{ color: "var(--yl-color-danger)" }}
                  >
                    {error}
                  </p>
                )}
              </div>

              <Checkbox
                id="remember"
                name="remember"
                label="ログイン状態を保持する"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              ログイン
            </Button>

            <div className="text-center">
              <Link href="/reset-password">パスワードをお忘れの方</Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

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
  /** フォーム送信時のハンドラ */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  /** 送信中かどうか */
  loading?: boolean;
};

export function LoginPage({ error, onSubmit, loading = false }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;
  const errorId = "login-password-error";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit?.({ email, password, remember });
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--yl-color-bg)" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Card padding="lg" className="w-full">
          <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Field id="login-email" label="メールアドレス">
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-1">
              <Field id="login-password" label="パスワード">
                <Input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? errorId : undefined}
                />
              </Field>
              {hasError && (
                <p
                  id={errorId}
                  role="alert"
                  className="text-sm"
                  style={{ color: "var(--yl-color-danger)" }}
                >
                  {error}
                </p>
              )}
            </div>

            <Checkbox
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            >
              ログイン状態を保持する
            </Checkbox>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "ログイン中…" : "ログイン"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/reset-password">パスワードをお忘れの方</Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

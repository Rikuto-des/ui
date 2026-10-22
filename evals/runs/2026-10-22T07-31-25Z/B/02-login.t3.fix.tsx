"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Input, Link } from "@yourlib/react";

export type LoginPageProps = {
  /** ログイン失敗時などに表示するエラーメッセージ */
  error?: string;
  /** ログイン送信時のハンドラ */
  onSubmit?: (values: {
    email: string;
    password: string;
    remember: boolean;
  }) => void | Promise<void>;
};

export function LoginPage({ error, onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit({ email, password, remember });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--yl-color-bg)" }}
    >
      <div className="w-full" style={{ maxWidth: 400 }}>
        <Card padding="lg" className="w-full">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <h1 className="text-2xl font-bold">ログイン</h1>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-medium">
                メールアドレス
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium">
                パスワード
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? "login-error" : undefined}
              />
              {hasError && (
                <p
                  id="login-error"
                  role="alert"
                  className="text-sm"
                  style={{ color: "var(--yl-color-danger)" }}
                >
                  {error}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              ログイン状態を保持する
            </label>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "ログイン中…" : "ログイン"}
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

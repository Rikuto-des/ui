"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Link,
  Text,
} from "@yourlib/react";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-[400px] p-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Text as="h1" className="text-2xl font-bold">
            ログイン
          </Text>

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
                className="text-sm text-red-600"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              ログイン状態を保持する
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "ログイン中…" : "ログイン"}
          </Button>

          <div className="text-center">
            <Link href="/reset-password" className="text-sm">
              パスワードをお忘れの方
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}

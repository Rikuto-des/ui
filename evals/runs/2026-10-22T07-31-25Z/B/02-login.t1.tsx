"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Link, TextField } from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginPageProps = {
  error?: string;
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
};

export function LoginPage({ error, onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ email, password, remember });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-[400px] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <TextField
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <TextField
              label="パスワード"
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
              <p id="login-error" role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <Checkbox
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            >
              ログイン状態を保持する
            </Checkbox>
            <Link href="/reset-password" className="text-sm">
              パスワードをお忘れの方
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "ログイン中…" : "ログイン"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

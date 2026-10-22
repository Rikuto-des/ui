"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

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
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--yl-color-bg)" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Card padding="lg" className="w-full">
          <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <Field id="login-email" label="メールアドレス">
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-1">
              <Field id="login-password" label="パスワード">
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? "login-error" : undefined}
                />
              </Field>
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

            <div className="flex items-center justify-between gap-4">
              <Checkbox
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              >
                ログイン状態を保持する
              </Checkbox>
              <Link href="/reset-password">パスワードをお忘れの方</Link>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "ログイン中…" : "ログイン"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

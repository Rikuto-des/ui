"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type LoginPageProps = {
  /** ログイン失敗時などに表示するエラーメッセージ */
  error?: string;
  /** 送信中かどうか */
  loading?: boolean;
  /** フォーム送信時に呼ばれる */
  onSubmit?: (values: LoginFormValues) => void;
};

export function LoginPage({ error, loading = false, onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.({ email, password, rememberMe });
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--yl-color-bg)" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Card className="w-full">
          <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Field label="メールアドレス">
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <Field label="パスワード">
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

            <label className="flex items-center gap-2">
              <Checkbox
                name="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked: boolean) => setRememberMe(checked === true)}
              />
              <span>ログイン状態を保持する</span>
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
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

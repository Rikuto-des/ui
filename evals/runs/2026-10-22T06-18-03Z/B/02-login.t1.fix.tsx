"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Input, Link } from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginPageProps = {
  /** エラーメッセージ。文字列が渡されたときパスワード欄の下に赤字で表示します。 */
  error?: string;
  /** ログイン送信時のハンドラ */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  /** 送信中かどうか */
  loading?: boolean;
};

export function LoginPage({ error, onSubmit, loading = false }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();
  const errorId = useId();

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit?.({ email, password, remember });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="w-full">
          <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-sm font-medium">
                メールアドレス
              </label>
              <Input
                id={emailId}
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
              <label htmlFor={passwordId} className="text-sm font-medium">
                パスワード
              </label>
              <Input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
              />
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

            <div className="flex items-center gap-2">
              <Checkbox
                id={rememberId}
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor={rememberId} className="text-sm">
                ログイン状態を保持する
              </label>
            </div>

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

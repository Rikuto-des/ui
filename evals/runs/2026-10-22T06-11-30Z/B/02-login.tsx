"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Link, TextField } from "@yourlib/react";

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

  const errorId = useId();
  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit?.({ email, password, remember });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-[400px] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <TextField
            label="メールアドレス"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <TextField
              label="パスワード"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorId : undefined}
            />
            {hasError && (
              <p id={errorId} role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Checkbox
              name="remember"
              checked={remember}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
            >
              ログイン状態を保持する
            </Checkbox>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "ログイン中…" : "ログイン"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/reset-password">パスワードをお忘れの方</Link>
          </div>
        </form>
      </Card>
    </main>
  );
}

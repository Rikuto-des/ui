"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Link,
  Text,
  TextField,
} from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type LoginPageProps = {
  /** ログイン失敗時などに表示するエラーメッセージ */
  error?: string;
  /** フォーム送信時に呼ばれる */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  /** 送信中かどうか */
  isSubmitting?: boolean;
};

export function LoginPage({
  error,
  onSubmit,
  isSubmitting = false,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit?.({ email, password, rememberMe });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-[400px] p-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <Text as="h1" className="text-center text-2xl font-bold">
            ログイン
          </Text>

          <div className="flex flex-col gap-4">
            <TextField
              label="メールアドレス"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex flex-col gap-1">
              <TextField
                label="パスワード"
                type="password"
                name="password"
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

            <Checkbox
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              ログイン状態を保持する
            </Checkbox>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "ログイン中…" : "ログイン"}
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

"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Heading,
  Link,
  Stack,
  Text,
  TextField,
} from "@yourlib/react";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-[400px] p-8">
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={6}>
            <Heading as="h1" size="lg" className="text-center">
              ログイン
            </Heading>

            <Stack gap={4}>
              <TextField
                id="email"
                name="email"
                type="email"
                label="メールアドレス"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
              />

              <div>
                <TextField
                  id="password"
                  name="password"
                  type="password"
                  label="パスワード"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? "login-error" : undefined}
                />
                {hasError && (
                  <Text
                    id="login-error"
                    role="alert"
                    size="sm"
                    className="mt-2 text-red-600"
                  >
                    {error}
                  </Text>
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
            </Stack>

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
          </Stack>
        </form>
      </Card>
    </main>
  );
}

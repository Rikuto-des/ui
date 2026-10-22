"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Link,
} from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginPageProps = {
  /** エラーメッセージ（文字列が渡されたときパスワード欄の下に表示） */
  error?: string | null;
  /** ログイン送信時のハンドラ */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  /** 送信中かどうか */
  loading?: boolean;
};

export function LoginPage({ error, onSubmit, loading = false }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit?.({ email, password, remember });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
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

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                name="remember"
                checked={remember}
                onCheckedChange={(checked: boolean) => setRemember(checked === true)}
              />
              <Label htmlFor="remember">ログイン状態を保持する</Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "ログイン中…" : "ログイン"}
            </Button>

            <div className="text-center">
              <Link href="/reset-password" className="text-sm">
                パスワードをお忘れの方
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

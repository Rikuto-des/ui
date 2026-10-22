"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Field, Input, Link } from "@yourlib/react";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginPageProps = {
  /** エラーメッセージ。文字列が渡されるとパスワード欄の下に赤字で表示されます。 */
  error?: string;
  /** フォーム送信時に呼ばれます。 */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
};

export function LoginPage({ error, onSubmit }: LoginPageProps) {
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
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
      <div className="w-full" style={{ maxWidth: 400 }}>
        <Card className="w-full">
          <div className="p-8">
            <h1
              className="mb-6 text-center text-2xl font-bold"
              style={{ color: "var(--yl-color-text)" }}
            >
              ログイン
            </h1>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <Field id={emailId} label="メールアドレス">
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <div className="flex flex-col gap-1">
                <Field id={passwordId} label="パスワード">
                  <Input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? errorId : undefined}
                  />
                </Field>
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

              <div className="flex items-center justify-between gap-4">
                <Checkbox
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                >
                  ログイン状態を保持する
                </Checkbox>
                <span className="text-sm">
                  <Link href="/reset-password">パスワードをお忘れの方</Link>
                </span>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "ログイン中…" : "ログイン"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}

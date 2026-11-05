// Installed by `urushi add login-01`. A sign-in screen: email and password, a remembered session, and a way back in without the password.
import { Button, Card, Checkbox, Field, Input, Link, Separator } from "@urushi/react";
import "./login-01.css";

export default function Login01() {
  return (
    <main className="b-login">
      <Card padding="lg">
        <header className="b-login-head">
          <h1>ログイン</h1>
          <p>登録したメールアドレスでログインします。</p>
        </header>
        <form className="b-login-form" method="post">
          <Field id="login-email" label="メールアドレス" required>
            <Input type="email" name="email" autoComplete="email" />
          </Field>
          <Field id="login-password" label="パスワード" required>
            <Input type="password" name="password" autoComplete="current-password" />
          </Field>
          <div className="b-login-row">
            <Checkbox name="remember">ログインしたままにする</Checkbox>
            <Link href="/forgot-password">パスワードを忘れた</Link>
          </div>
          <Button type="submit" variant="primary" size="lg">
            ログイン
          </Button>
          <Separator decorative />
          <Button type="button" size="lg">
            メールでリンクを受け取る
          </Button>
        </form>
      </Card>
      <p className="b-login-note">
        アカウントがない場合は <Link href="/signup">新しく登録</Link> できます。
      </p>
    </main>
  );
}

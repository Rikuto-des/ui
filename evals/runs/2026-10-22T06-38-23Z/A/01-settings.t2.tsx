import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
} from "@yourlib/react";

export function AccountSettingsScreen() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1
          style={{
            color: "var(--yl-color-text)",
            fontSize: "var(--yl-font-size-title)",
            fontWeight: "var(--yl-font-weight-title)",
            lineHeight: "var(--yl-font-line-height-title)",
            letterSpacing: "var(--yl-font-tracking-title)",
          }}
        >
          アカウント設定
        </h1>
        <p
          style={{
            color: "var(--yl-color-text-muted)",
            fontSize: "var(--yl-font-size-body)",
            lineHeight: "var(--yl-font-line-height-body)",
          }}
        >
          プロフィール、通知、表示に関する設定を変更できます。
        </p>
      </header>

      <Card
        title="プロフィール"
        description="ほかのメンバーに表示される情報です。"
        headingLevel="h2"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" type="submit" form="profile-form">
              保存
            </Button>
          </div>
        }
      >
        <form
          id="profile-form"
          action="/settings/profile"
          method="post"
          className="flex flex-col gap-5"
        >
          <Field id="display-name" label="表示名" required>
            <Input type="text" name="displayName" autoComplete="nickname" />
          </Field>
          <Field
            id="bio"
            label="自己紹介"
            description="あなたの担当や興味のあることを書いてください。"
          >
            <Textarea name="bio" rows={4} />
          </Field>
        </form>
      </Card>

      <Card
        title="通知"
        description="切り替えるとすぐに反映されます。"
        headingLevel="h2"
      >
        <div className="flex flex-col gap-4">
          <Switch name="notifyEmail" defaultChecked>
            メール通知
          </Switch>
          <Switch name="notifyPush">プッシュ通知</Switch>
        </div>
      </Card>

      <Card
        title="表示"
        description="画面に表示する言語を選びます。"
        headingLevel="h2"
      >
        <Field id="display-language" label="表示言語">
          <Select name="language" defaultValue="ja">
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ko">한국어</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </Select>
        </Field>
      </Card>
    </main>
  );
}

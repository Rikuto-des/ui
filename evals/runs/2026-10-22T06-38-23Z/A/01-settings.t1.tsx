import {
  Button,
  Card,
  Field,
  Input,
  RadioGroup,
  Switch,
  Textarea,
} from "@yourlib/react";

export function AccountSettingsScreen() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
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
          プロフィール、通知、表示の設定を変更できます。
        </p>
      </header>

      <form id="profile-form" method="post">
        <Card
          title="プロフィール"
          description="ほかのメンバーに表示される情報です。"
          headingLevel="h2"
          footer={
            <Button variant="primary" type="submit">
              保存
            </Button>
          }
        >
          <div className="flex flex-col gap-5">
            <Field id="display-name" label="表示名" required>
              <Input type="text" name="displayName" autoComplete="nickname" />
            </Field>
            <Field
              id="bio"
              label="自己紹介"
              description="得意なことや担当している仕事などを書いてください。"
            >
              <Textarea name="bio" rows={4} />
            </Field>
          </div>
        </Card>
      </form>

      <Card
        title="通知"
        description="切り替えるとすぐに反映されます。"
        headingLevel="h2"
      >
        <div className="flex flex-col gap-4">
          <Switch name="emailNotifications" defaultChecked>
            メール通知
          </Switch>
          <Switch name="pushNotifications">プッシュ通知</Switch>
        </div>
      </Card>

      <Card
        title="表示"
        description="画面に表示する言語を選びます。"
        headingLevel="h2"
      >
        <RadioGroup name="language" legend="表示言語" defaultValue="ja">
          <RadioGroup.Item value="ja">日本語</RadioGroup.Item>
          <RadioGroup.Item value="en">English</RadioGroup.Item>
          <RadioGroup.Item value="zh">中文</RadioGroup.Item>
          <RadioGroup.Item value="ko">한국어</RadioGroup.Item>
          <RadioGroup.Item value="es">Español</RadioGroup.Item>
          <RadioGroup.Item value="fr">Français</RadioGroup.Item>
        </RadioGroup>
      </Card>
    </main>
  );
}

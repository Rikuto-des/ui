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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
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

      <Card
        title="プロフィール"
        description="ほかのメンバーに表示される情報です。"
        headingLevel="h2"
        footer={
          <Button variant="primary" type="submit" form="profile-form">
            保存
          </Button>
        }
      >
        <form id="profile-form" className="flex flex-col gap-5">
          <Field id="display-name" label="表示名" required>
            <Input type="text" name="displayName" autoComplete="nickname" />
          </Field>
          <Field
            id="bio"
            label="自己紹介"
            description="担当している仕事や興味のあることを書けます。"
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
          <Switch name="emailNotifications" defaultChecked>
            メール通知
          </Switch>
          <Switch name="pushNotifications">プッシュ通知</Switch>
        </div>
      </Card>

      <Card title="表示" headingLevel="h2">
        <RadioGroup name="locale" legend="表示言語" defaultValue="ja">
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

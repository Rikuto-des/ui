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
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <h1 className="text-2xl font-bold">アカウント設定</h1>

      <Card
        title="プロフィール"
        description="ほかのユーザーに表示される情報です。"
        headingLevel="h2"
        footer={
          <Button variant="primary" type="submit" form="profile-form">
            保存
          </Button>
        }
      >
        <form id="profile-form" className="flex flex-col gap-6">
          <Field id="display-name" label="表示名" required>
            <Input type="text" name="displayName" autoComplete="nickname" />
          </Field>
          <Field
            id="bio"
            label="自己紹介"
            description="プロフィールページに表示されます。"
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
        <Field id="language" label="表示言語">
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

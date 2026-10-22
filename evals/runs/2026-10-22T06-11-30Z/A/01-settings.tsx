import { Button, Card, Field, Input, Select, Switch, Textarea } from "@yourlib/react";

export function AccountSettingsScreen() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">アカウント設定</h1>

      <Card
        headingLevel="h2"
        title="プロフィール"
        description="ほかのメンバーに表示される情報です。"
        footer={
          <Button variant="primary" type="submit" form="profile-form">
            保存
          </Button>
        }
      >
        <form id="profile-form" className="flex flex-col gap-4">
          <Field id="display-name" label="表示名" required>
            <Input type="text" name="displayName" autoComplete="nickname" />
          </Field>
          <Field id="bio" label="自己紹介" description="どんな仕事をしているかなどを書けます。">
            <Textarea name="bio" rows={4} />
          </Field>
        </form>
      </Card>

      <Card
        headingLevel="h2"
        title="通知"
        description="変更はすぐに反映されます。"
      >
        <div className="flex flex-col gap-4">
          <Switch name="emailNotifications" defaultChecked>
            メール通知
          </Switch>
          <Switch name="pushNotifications">プッシュ通知</Switch>
        </div>
      </Card>

      <Card headingLevel="h2" title="表示">
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

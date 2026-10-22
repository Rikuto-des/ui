"use client";

import type { ChangeEvent, FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  RadioGroup,
  Switch,
  Textarea,
  toast,
} from "@yourlib/react";

const LANGUAGES = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
] as const;

export function AccountSettingsPage() {
  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: プロフィールを保存する API を呼び出す
    toast("プロフィールを保存しました", { tone: "ok" });
  }

  function handleEmailNotify(event: ChangeEvent<HTMLInputElement>) {
    // TODO: メール通知の設定を更新する API を呼び出す
    toast(
      event.target.checked
        ? "メール通知をオンにしました"
        : "メール通知をオフにしました",
      { tone: "ok" },
    );
  }

  function handlePushNotify(event: ChangeEvent<HTMLInputElement>) {
    // TODO: プッシュ通知の設定を更新する API を呼び出す
    toast(
      event.target.checked
        ? "プッシュ通知をオンにしました"
        : "プッシュ通知をオフにしました",
      { tone: "ok" },
    );
  }

  function handleLanguageChange(event: ChangeEvent<HTMLFieldSetElement>) {
    const target = event.target as unknown as HTMLInputElement;
    if (target.type !== "radio" || !target.checked) return;
    const language = LANGUAGES.find((l) => l.value === target.value);
    // TODO: 表示言語の設定を更新する API を呼び出す
    toast(`表示言語を${language?.label ?? target.value}に変更しました`, {
      tone: "ok",
    });
  }

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
        <form
          id="profile-form"
          className="flex flex-col gap-5"
          onSubmit={handleProfileSubmit}
        >
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
          <Switch name="emailNotify" defaultChecked onChange={handleEmailNotify}>
            メール通知
          </Switch>
          <Switch name="pushNotify" onChange={handlePushNotify}>
            プッシュ通知
          </Switch>
        </div>
      </Card>

      <Card title="表示" headingLevel="h2">
        <RadioGroup
          name="language"
          legend="表示言語"
          defaultValue="ja"
          onChange={handleLanguageChange}
        >
          {LANGUAGES.map((language) => (
            <RadioGroup.Item key={language.value} value={language.value}>
              {language.label}
            </RadioGroup.Item>
          ))}
        </RadioGroup>
      </Card>
    </main>
  );
}

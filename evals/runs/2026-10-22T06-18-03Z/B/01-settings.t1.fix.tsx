"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Heading,
  Select,
  Switch,
  TextArea,
  TextField,
} from "@yourlib/react";

type Language = "ja" | "en" | "zh" | "ko" | "es" | "fr";

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export function AccountSettingsScreen() {
  // プロフィール
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | undefined>();

  // 通知（その場で反映）
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // 表示
  const [language, setLanguage] = useState<Language>("ja");

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage(undefined);

    if (displayName.trim() === "") {
      setDisplayNameError("表示名を入力してください。");
      return;
    }
    setDisplayNameError(undefined);

    setIsSaving(true);
    try {
      // TODO: プロフィール保存 API を呼び出す
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSavedMessage("プロフィールを保存しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <Heading level={1}>アカウント設定</Heading>

      {/* プロフィール */}
      <Card>
        <section aria-labelledby="profile-heading" className="flex flex-col gap-6 p-6">
          <Heading level={2} id="profile-heading">
            プロフィール
          </Heading>

          <form onSubmit={handleProfileSubmit} noValidate className="flex flex-col gap-5">
            <TextField
              label="表示名"
              name="displayName"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                if (displayNameError) setDisplayNameError(undefined);
              }}
              required
              error={displayNameError}
              autoComplete="nickname"
            />

            <TextArea
              label="自己紹介"
              name="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={5}
            />

            <div className="flex items-center justify-end gap-4">
              {savedMessage && (
                <p
                  role="status"
                  className="text-sm text-[var(--yl-color-text-success)]"
                >
                  {savedMessage}
                </p>
              )}
              <Button type="submit" variant="primary" size="lg" loading={isSaving}>
                保存
              </Button>
            </div>
          </form>
        </section>
      </Card>

      {/* 通知 */}
      <Card>
        <section aria-labelledby="notifications-heading" className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <Heading level={2} id="notifications-heading">
              通知
            </Heading>
            <p className="text-sm text-[var(--yl-color-text-subtle)]">
              変更はすぐに反映されます。
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              label="メール通知"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
            <Switch
              label="プッシュ通知"
              checked={pushNotifications}
              onChange={(event) => setPushNotifications(event.target.checked)}
            />
          </div>
        </section>
      </Card>

      {/* 表示 */}
      <Card>
        <section aria-labelledby="display-heading" className="flex flex-col gap-6 p-6">
          <Heading level={2} id="display-heading">
            表示
          </Heading>

          <Select
            label="表示言語"
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} lang={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </section>
      </Card>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Heading,
  Select,
  Switch,
  Text,
  TextField,
  Textarea,
} from "@yourlib/react";

const LANGUAGE_OPTIONS = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
] as const;

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["value"];

export function AccountSettingsScreen() {
  // プロフィール
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | undefined>();

  // 通知（その場で反映）
  const [emailNotification, setEmailNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(false);

  // 表示
  const [language, setLanguage] = useState<LanguageCode>("ja");

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage(undefined);

    if (displayName.trim() === "") {
      setDisplayNameError("表示名を入力してください。");
      return;
    }
    setDisplayNameError(undefined);

    setIsSaving(true);
    try {
      // TODO: プロフィール保存 API を呼び出す
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveMessage("プロフィールを保存しました。");
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

          <form
            onSubmit={handleProfileSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <TextField
              label="表示名"
              name="displayName"
              required
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (displayNameError) setDisplayNameError(undefined);
              }}
              error={displayNameError}
              autoComplete="nickname"
            />

            <Textarea
              label="自己紹介"
              name="bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <div className="flex items-center justify-end gap-4">
              <Text role="status" aria-live="polite" size="sm">
                {saveMessage}
              </Text>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSaving}
                disabled={isSaving}
              >
                保存
              </Button>
            </div>
          </form>
        </section>
      </Card>

      {/* 通知 */}
      <Card>
        <section aria-labelledby="notification-heading" className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <Heading level={2} id="notification-heading">
              通知
            </Heading>
            <Text size="sm">切り替えるとすぐに反映されます。</Text>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              label="メール通知"
              checked={emailNotification}
              onCheckedChange={setEmailNotification}
            />
            <Switch
              label="プッシュ通知"
              checked={pushNotification}
              onCheckedChange={setPushNotification}
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
            value={language}
            onValueChange={(value: string) => setLanguage(value as LanguageCode)}
            options={LANGUAGE_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </section>
      </Card>
    </main>
  );
}

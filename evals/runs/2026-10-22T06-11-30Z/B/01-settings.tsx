"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Heading,
  Select,
  Stack,
  Switch,
  Text,
  TextArea,
  TextField,
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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

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
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Stack gap="lg">
        <Heading level={1}>アカウント設定</Heading>

        {/* プロフィール */}
        <Card>
          <section aria-labelledby="profile-heading">
            <form onSubmit={handleProfileSubmit} noValidate>
              <Stack gap="md">
                <Heading level={2} id="profile-heading">
                  プロフィール
                </Heading>

                <TextField
                  label="表示名"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
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
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                />

                <div className="flex items-center justify-end gap-3">
                  {saveMessage && (
                    <Text role="status" size="sm">
                      {saveMessage}
                    </Text>
                  )}
                  <Button type="submit" variant="primary" loading={isSaving}>
                    保存
                  </Button>
                </div>
              </Stack>
            </form>
          </section>
        </Card>

        {/* 通知 */}
        <Card>
          <section aria-labelledby="notifications-heading">
            <Stack gap="md">
              <Heading level={2} id="notifications-heading">
                通知
              </Heading>

              <Switch
                label="メール通知"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />

              <Switch
                label="プッシュ通知"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
              />
            </Stack>
          </section>
        </Card>

        {/* 表示 */}
        <Card>
          <section aria-labelledby="display-heading">
            <Stack gap="md">
              <Heading level={2} id="display-heading">
                表示
              </Heading>

              <Select
                label="表示言語"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} lang={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Stack>
          </section>
        </Card>
      </Stack>
    </main>
  );
}

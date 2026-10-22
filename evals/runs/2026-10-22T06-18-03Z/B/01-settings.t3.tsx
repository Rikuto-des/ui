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
  TextField,
  Textarea,
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
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | undefined>();

  // 通知（その場で反映）
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // 表示
  const [language, setLanguage] = useState<Language>("ja");

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage(undefined);

    if (displayName.trim() === "") {
      setNameError("表示名を入力してください。");
      return;
    }
    setNameError(undefined);

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
        <Card as="section" aria-labelledby="profile-heading">
          <form onSubmit={handleProfileSubmit} noValidate>
            <Stack gap="md">
              <Heading level={2} id="profile-heading">
                プロフィール
              </Heading>

              <TextField
                label="表示名"
                name="displayName"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError(undefined);
                }}
                error={nameError}
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
                {saveMessage && (
                  <Text role="status" size="sm">
                    {saveMessage}
                  </Text>
                )}
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
            </Stack>
          </form>
        </Card>

        {/* 通知 */}
        <Card as="section" aria-labelledby="notifications-heading">
          <Stack gap="md">
            <Heading level={2} id="notifications-heading">
              通知
            </Heading>
            <Text size="sm" tone="muted">
              切り替えるとすぐに反映されます。
            </Text>

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
        </Card>

        {/* 表示 */}
        <Card as="section" aria-labelledby="display-heading">
          <Stack gap="md">
            <Heading level={2} id="display-heading">
              表示
            </Heading>

            <Select
              label="表示言語"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} lang={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>
        </Card>
      </Stack>
    </main>
  );
}

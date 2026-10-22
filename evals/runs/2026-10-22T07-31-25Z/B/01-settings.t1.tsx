"use client";

import { useId, useState, type FormEvent } from "react";
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

type LanguageCode = "ja" | "en" | "zh" | "ko" | "es" | "fr";

const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export function AccountSettingsScreen() {
  const profileHeadingId = useId();
  const notificationHeadingId = useId();
  const displayHeadingId = useId();

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
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveMessage("プロフィールを保存しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <Heading level={1}>アカウント設定</Heading>

      {/* プロフィール */}
      <section aria-labelledby={profileHeadingId}>
        <Card>
          <form
            onSubmit={handleProfileSubmit}
            noValidate
            className="flex flex-col gap-6 p-6"
          >
            <Heading level={2} id={profileHeadingId}>
              プロフィール
            </Heading>

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
              {saveMessage && (
                <Text role="status" aria-live="polite">
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
          </form>
        </Card>
      </section>

      {/* 通知 */}
      <section aria-labelledby={notificationHeadingId}>
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <Heading level={2} id={notificationHeadingId}>
              通知
            </Heading>
            <Text>切り替えるとすぐに反映されます。</Text>

            <Switch
              label="メール通知"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
            <Switch
              label="プッシュ通知"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </Card>
      </section>

      {/* 表示 */}
      <section aria-labelledby={displayHeadingId}>
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <Heading level={2} id={displayHeadingId}>
              表示
            </Heading>

            <Select
              label="表示言語"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} lang={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      </section>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Heading,
  Select,
  Switch,
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
];

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
  const [language, setLanguage] = useState("ja");

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
      <section aria-labelledby="profile-heading">
        <Card>
          <form
            className="flex flex-col gap-6 p-6"
            onSubmit={handleProfileSubmit}
            noValidate
          >
            <Heading level={2} id="profile-heading">
              プロフィール
            </Heading>

            <TextField
              label="表示名"
              name="displayName"
              required
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
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
              onChange={(event) => setBio(event.target.value)}
            />

            <div className="flex items-center justify-end gap-4">
              <p role="status" aria-live="polite" className="text-sm">
                {saveMessage}
              </p>
              <Button type="submit" variant="primary" loading={isSaving}>
                保存
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* 通知 */}
      <section aria-labelledby="notifications-heading">
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <Heading level={2} id="notifications-heading">
              通知
            </Heading>
            <p className="text-sm">切り替えるとすぐに反映されます。</p>

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
        </Card>
      </section>

      {/* 表示 */}
      <section aria-labelledby="display-heading">
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <Heading level={2} id="display-heading">
              表示
            </Heading>

            <Select
              label="表示言語"
              name="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
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

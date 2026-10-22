"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Switch,
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

  const profileHeadingId = useId();
  const notificationHeadingId = useId();
  const displayHeadingId = useId();
  const displayNameId = useId();
  const bioId = useId();
  const languageId = useId();

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
      <h1 className="text-2xl font-bold">アカウント設定</h1>

      {/* プロフィール */}
      <section aria-labelledby={profileHeadingId}>
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <h2 id={profileHeadingId} className="text-lg font-semibold">
              プロフィール
            </h2>

            <form
              className="flex flex-col gap-5"
              onSubmit={handleProfileSubmit}
              noValidate
            >
              <Field
                id={displayNameId}
                label="表示名"
                required
                error={displayNameError}
              >
                <Input
                  id={displayNameId}
                  name="displayName"
                  required
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    if (displayNameError) setDisplayNameError(undefined);
                  }}
                  autoComplete="nickname"
                />
              </Field>

              <Field id={bioId} label="自己紹介">
                <Textarea
                  id={bioId}
                  name="bio"
                  rows={5}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </Field>

              <div className="flex items-center justify-end gap-4">
                {saveMessage && (
                  <p role="status" aria-live="polite">
                    {saveMessage}
                  </p>
                )}
                <Button type="submit" variant="primary" loading={isSaving}>
                  保存
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </section>

      {/* 通知 */}
      <section aria-labelledby={notificationHeadingId}>
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
              <h2 id={notificationHeadingId} className="text-lg font-semibold">
                通知
              </h2>
              <p>変更はすぐに反映されます。</p>
            </div>

            <div className="flex flex-col gap-4">
              <Switch
                label="メール通知"
                checked={emailNotifications}
                onChange={(event) =>
                  setEmailNotifications(event.target.checked)
                }
              />
              <Switch
                label="プッシュ通知"
                checked={pushNotifications}
                onChange={(event) => setPushNotifications(event.target.checked)}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* 表示 */}
      <section aria-labelledby={displayHeadingId}>
        <Card>
          <div className="flex flex-col gap-6 p-6">
            <h2 id={displayHeadingId} className="text-lg font-semibold">
              表示
            </h2>

            <Field id={languageId} label="表示言語">
              <Select
                id={languageId}
                name="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as LanguageCode)
                }
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>
      </section>
    </main>
  );
}

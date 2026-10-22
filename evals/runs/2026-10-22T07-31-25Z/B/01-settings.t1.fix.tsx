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
  const profileHeadingId = useId();
  const notificationHeadingId = useId();
  const displayHeadingId = useId();
  const displayNameId = useId();
  const displayNameErrorId = useId();
  const bioId = useId();
  const languageId = useId();

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
      <h1 className="text-2xl font-bold">アカウント設定</h1>

      {/* プロフィール */}
      <section aria-labelledby={profileHeadingId}>
        <Card>
          <form
            onSubmit={handleProfileSubmit}
            noValidate
            className="flex flex-col gap-6 p-6"
          >
            <h2 id={profileHeadingId} className="text-lg font-semibold">
              プロフィール
            </h2>

            <div className="flex flex-col gap-1">
              <Field id={displayNameId} label="表示名（必須）">
                <Input
                  id={displayNameId}
                  name="displayName"
                  required
                  aria-invalid={displayNameError ? true : undefined}
                  aria-describedby={displayNameError ? displayNameErrorId : undefined}
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (displayNameError) setDisplayNameError(undefined);
                  }}
                  autoComplete="nickname"
                />
              </Field>
              {displayNameError && (
                <p id={displayNameErrorId} role="alert" className="text-sm text-red-600">
                  {displayNameError}
                </p>
              )}
            </div>

            <Field id={bioId} label="自己紹介">
              <Textarea
                id={bioId}
                name="bio"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-end gap-4">
              <p role="status" aria-live="polite" className="text-sm">
                {saveMessage}
              </p>
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
            <div className="flex flex-col gap-1">
              <h2 id={notificationHeadingId} className="text-lg font-semibold">
                通知
              </h2>
              <p className="text-sm">切り替えるとすぐに反映されます。</p>
            </div>

            <Switch
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.currentTarget.checked)}
            >
              メール通知
            </Switch>
            <Switch
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.currentTarget.checked)}
            >
              プッシュ通知
            </Switch>
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
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} lang={option.value}>
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

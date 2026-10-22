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
  const [saveMessage, setSaveMessage] = useState("");

  // 通知（その場で反映）
  const [emailNotification, setEmailNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(false);

  // 表示
  const [language, setLanguage] = useState<LanguageCode>("ja");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage("");

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
      <Card>
        <section aria-labelledby={profileHeadingId} className="flex flex-col gap-6 p-6">
          <h2 id={profileHeadingId} className="text-lg font-semibold">
            プロフィール
          </h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <Field id={displayNameId} label="表示名（必須）">
                <Input
                  name="displayName"
                  required
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    if (displayNameError) setDisplayNameError(undefined);
                  }}
                  aria-invalid={displayNameError ? true : undefined}
                  aria-describedby={displayNameError ? displayNameErrorId : undefined}
                  autoComplete="nickname"
                />
              </Field>
              {displayNameError && (
                <p id={displayNameErrorId} className="text-sm text-red-600">
                  {displayNameError}
                </p>
              )}
            </div>

            <Field id={bioId} label="自己紹介">
              <Textarea
                name="bio"
                rows={5}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
              />
            </Field>

            <div className="flex items-center justify-end gap-4">
              <p role="status" aria-live="polite" className="text-sm">
                {saveMessage}
              </p>
              <Button type="submit" variant="primary" size="lg" loading={isSaving} disabled={isSaving}>
                保存
              </Button>
            </div>
          </form>
        </section>
      </Card>

      {/* 通知 */}
      <Card>
        <section aria-labelledby={notificationHeadingId} className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h2 id={notificationHeadingId} className="text-lg font-semibold">
              通知
            </h2>
            <p className="text-sm">切り替えるとすぐに反映されます。</p>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              checked={emailNotification}
              onChange={(event) => setEmailNotification(event.currentTarget.checked)}
            >
              メール通知
            </Switch>
            <Switch
              checked={pushNotification}
              onChange={(event) => setPushNotification(event.currentTarget.checked)}
            >
              プッシュ通知
            </Switch>
          </div>
        </section>
      </Card>

      {/* 表示 */}
      <Card>
        <section aria-labelledby={displayHeadingId} className="flex flex-col gap-6 p-6">
          <h2 id={displayHeadingId} className="text-lg font-semibold">
            表示
          </h2>

          <Field id={languageId} label="表示言語">
            <Select
              name="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} lang={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </section>
      </Card>
    </main>
  );
}

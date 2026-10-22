"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@yourlib/react";

type PlanId = "free" | "team" | "enterprise";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  description: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "フリー",
    price: "無料",
    description: "個人での利用や、まずは試してみたい方に。",
  },
  {
    id: "team",
    name: "チーム",
    price: "月 1,200 円",
    description: "チームでの共同作業に必要な機能をすべて利用できます。",
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "要相談",
    description: "大規模な組織向けの導入支援とサポートをご提供します。",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const nameError = submitted && name.trim() === "" ? "氏名を入力してください。" : undefined;
  const emailError =
    submitted && email.trim() === ""
      ? "メールアドレスを入力してください。"
      : submitted && !EMAIL_PATTERN.test(email.trim())
        ? "正しいメールアドレスの形式で入力してください。"
        : undefined;
  const agreeError =
    submitted && !agreed ? "登録するには利用規約への同意が必要です。" : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const isValid =
      name.trim() !== "" && EMAIL_PATTERN.test(email.trim()) && agreed;
    if (!isValid) return;

    setCompleted(true);
  };

  if (completed) {
    const selectedPlan = PLANS.find((p) => p.id === plan);
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <Card className="p-8">
          <Stack gap="md">
            <h1 className="text-2xl font-bold">登録が完了しました</h1>
            <p className="text-gray-600">
              {name} 様、ご登録ありがとうございます。選択されたプランは「
              {selectedPlan?.name}」です。確認メールを {email} に送信しました。
            </p>
          </Stack>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="lg">
          <header>
            <h1 className="text-2xl font-bold">会員登録</h1>
            <p className="mt-1 text-sm text-gray-600">
              必要事項を入力し、ご希望のプランを選択してください。
            </p>
          </header>

          <Stack gap="md">
            <TextField
              label="氏名"
              name="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
            />
            <TextField
              label="メールアドレス"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
            <TextField
              label="会社名（任意）"
              name="company"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Stack>

          <RadioGroup
            label="プラン"
            name="plan"
            value={plan}
            onChange={(value: string) => setPlan(value as PlanId)}
          >
            <Stack gap="sm">
              {PLANS.map((p) => {
                const selected = plan === p.id;
                return (
                  <label
                    key={p.id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                      selected
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300",
                    ].join(" ")}
                  >
                    <Radio value={p.id} aria-label={p.name} />
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold">{p.name}</span>
                        <span
                          className={
                            selected
                              ? "text-sm font-semibold text-purple-700"
                              : "text-sm text-gray-600"
                          }
                        >
                          {p.price}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">
                        {p.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </Stack>
          </RadioGroup>

          <Checkbox
            name="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            label="利用規約に同意します"
            error={agreeError}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full">
            登録する
          </Button>
        </Stack>
      </form>
    </main>
  );
}

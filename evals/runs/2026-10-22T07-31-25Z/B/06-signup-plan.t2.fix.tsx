"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  RadioGroup,
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

const mutedText = { color: "var(--yl-color-text-muted)" } as const;
const errorText = { color: "var(--yl-color-danger)" } as const;

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const nameError =
    submitted && name.trim() === "" ? "氏名を入力してください。" : undefined;
  const emailError =
    submitted && email.trim() === ""
      ? "メールアドレスを入力してください。"
      : submitted && !EMAIL_PATTERN.test(email.trim())
        ? "正しいメールアドレスの形式で入力してください。"
        : undefined;
  const agreeError =
    submitted && !agreed ? "登録するには利用規約への同意が必要です。" : undefined;

  const handlePlanChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlan(event.currentTarget.value as PlanId);
  };

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
        <Card padding="lg">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">登録が完了しました</h1>
            <p style={mutedText}>
              {name} 様、ご登録ありがとうございます。選択されたプランは「
              {selectedPlan?.name}」です。確認メールを {email} に送信しました。
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-8">
          <header>
            <h1 className="text-2xl font-bold">会員登録</h1>
            <p className="mt-1 text-sm" style={mutedText}>
              必要事項を入力し、ご希望のプランを選択してください。
            </p>
          </header>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Field id="signup-name" label="氏名">
                <Input
                  name="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.currentTarget.value)
                  }
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? "signup-name-error" : undefined}
                />
              </Field>
              {nameError && (
                <p id="signup-name-error" className="text-sm" style={errorText}>
                  {nameError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Field id="signup-email" label="メールアドレス">
                <Input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.currentTarget.value)
                  }
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={
                    emailError ? "signup-email-error" : undefined
                  }
                />
              </Field>
              {emailError && (
                <p
                  id="signup-email-error"
                  className="text-sm"
                  style={errorText}
                >
                  {emailError}
                </p>
              )}
            </div>

            <Field id="signup-company" label="会社名（任意）">
              <Input
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCompany(e.currentTarget.value)
                }
              />
            </Field>
          </section>

          <RadioGroup name="plan" legend="プラン" defaultValue="team" required>
            <div className="flex flex-col gap-3">
              {PLANS.map((p) => {
                const selected = plan === p.id;
                return (
                  <div
                    key={p.id}
                    className="rounded-lg border-2 p-4"
                    style={{
                      borderColor: selected
                        ? "var(--yl-color-primary)"
                        : "var(--yl-color-border)",
                      backgroundColor: selected
                        ? "var(--yl-color-surface)"
                        : undefined,
                    }}
                  >
                    <RadioGroup.Item value={p.id} onChange={handlePlanChange}>
                      <span className="font-semibold">{p.name}</span>
                      <span
                        className="ml-2 text-sm"
                        style={
                          selected
                            ? {
                                color: "var(--yl-color-primary)",
                                fontWeight: 600,
                              }
                            : mutedText
                        }
                      >
                        {p.price}
                      </span>
                    </RadioGroup.Item>
                    <p className="mt-1 text-sm" style={mutedText}>
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <div className="flex flex-col gap-1">
            <Checkbox
              name="terms"
              checked={agreed}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAgreed(e.currentTarget.checked)
              }
              invalid={Boolean(agreeError)}
              aria-describedby={agreeError ? "signup-terms-error" : undefined}
            >
              利用規約に同意します
            </Checkbox>
            {agreeError && (
              <p id="signup-terms-error" className="text-sm" style={errorText}>
                {agreeError}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            登録する
          </Button>
        </div>
      </form>
    </main>
  );
}

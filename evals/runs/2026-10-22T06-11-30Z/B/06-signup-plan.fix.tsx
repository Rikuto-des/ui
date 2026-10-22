"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, TextField } from "@yourlib/react";

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
    description: "個人での利用や、まずはお試しに。",
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
    description: "大規模な組織向けの導入支援とサポートを提供します。",
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

  const nameInvalid = name.trim() === "";
  const emailInvalid = !EMAIL_PATTERN.test(email.trim());

  const nameError = submitted && nameInvalid ? "氏名を入力してください" : undefined;
  const emailError =
    submitted && emailInvalid ? "正しいメールアドレスを入力してください" : undefined;
  const agreeError = submitted && !agreed ? "利用規約への同意が必要です" : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (nameInvalid || emailInvalid || !agreed) {
      return;
    }
    // TODO: 登録 API を呼び出す
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <Card className="w-full">
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold">会員登録</h1>
          <p className="mb-8 text-sm text-[var(--yl-color-text-muted)]">
            必要事項を入力し、ご利用のプランを選択してください。
          </p>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <TextField
              label="氏名"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
            />

            <TextField
              label="メールアドレス"
              name="email"
              type="email"
              autoComplete="email"
              required
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

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-medium">プラン</legend>
              {PLANS.map((p) => {
                const selected = plan === p.id;
                return (
                  <label
                    key={p.id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                      "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--yl-color-brand)]",
                      selected
                        ? "border-[var(--yl-color-brand)] bg-[var(--yl-color-brand-subtle)]"
                        : "border-[var(--yl-color-border)] hover:border-[var(--yl-color-border-strong)]",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={selected}
                      onChange={() => setPlan(p.id)}
                      className="mt-1 h-4 w-4 accent-[var(--yl-color-brand)]"
                    />
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold">{p.name}</span>
                        <span
                          className={
                            selected
                              ? "text-sm font-medium text-[var(--yl-color-brand)]"
                              : "text-sm text-[var(--yl-color-text-muted)]"
                          }
                        >
                          {p.price}
                        </span>
                      </span>
                      <span className="text-sm text-[var(--yl-color-text-muted)]">
                        {p.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <div className="flex flex-col gap-1">
              <Checkbox
                name="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                label="利用規約に同意します"
              />
              {agreeError && (
                <p role="alert" className="text-sm text-[var(--yl-color-danger)]">
                  {agreeError}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              登録する
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}

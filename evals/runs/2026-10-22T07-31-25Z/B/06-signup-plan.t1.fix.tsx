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

const PLANS: { id: PlanId; name: string; price: string; description: string }[] = [
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
    description: "大規模な組織向けに、個別の契約とサポートをご用意します。",
  },
];

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() !== "" && email.trim() !== "" && agreed;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const handlePlanChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlan(event.currentTarget.value as PlanId);
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <Card padding="lg">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">会員登録</h1>
            <p className="text-sm" style={{ color: "var(--yl-color-text-muted)" }}>
              必要事項を入力して、プランを選択してください。
            </p>
          </header>

          <div className="flex flex-col gap-4">
            <Field id="signup-name" label="氏名">
              <Input
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
            </Field>
            <Field id="signup-email" label="メールアドレス">
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </Field>
            <Field id="signup-company" label="会社名（任意）">
              <Input
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
              />
            </Field>
          </div>

          <RadioGroup name="plan" legend="プラン" defaultValue="team" required>
            <div className="flex flex-col gap-3">
              {PLANS.map((p) => {
                const selected = plan === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-1 rounded-lg border-2 p-4 transition-colors"
                    style={{
                      borderColor: selected
                        ? "var(--yl-color-primary)"
                        : "var(--yl-color-border)",
                      backgroundColor: selected
                        ? "var(--yl-color-surface)"
                        : "var(--yl-color-bg)",
                    }}
                  >
                    <RadioGroup.Item
                      value={p.id}
                      onChange={handlePlanChange}
                      aria-describedby={`plan-${p.id}-desc`}
                    >
                      <span className="font-bold">{p.name}</span>
                      <span className="ml-2">{p.price}</span>
                    </RadioGroup.Item>
                    <p
                      id={`plan-${p.id}-desc`}
                      className="text-sm"
                      style={{ color: "var(--yl-color-text-muted)" }}
                    >
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <Checkbox
            name="terms"
            checked={agreed}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAgreed(e.target.checked)}
          >
            利用規約に同意します
          </Checkbox>

          <Button type="submit" variant="primary" disabled={!canSubmit}>
            登録する
          </Button>

          {submitted && (
            <p role="status" className="text-sm">
              登録を受け付けました。ご入力のメールアドレスに確認メールをお送りします。
            </p>
          )}
        </form>
      </Card>
    </main>
  );
}

"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Card, Checkbox, Field, Input, RadioGroup } from "@yourlib/react";

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
    description: "大規模な組織向けに、個別の要件に合わせてご提案します。",
  },
];

const DEFAULT_PLAN: PlanId = "team";

export function SignUpScreen() {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const companyId = `${baseId}-company`;
  const termsId = `${baseId}-terms`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>(DEFAULT_PLAN);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() !== "" && email.trim() !== "" && agreed;

  const handlePlanChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked) {
      setPlan(event.currentTarget.value as PlanId);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-12">
      <Card padding="lg">
        <h1 className="text-2xl font-bold" style={{ color: "var(--yl-color-text)" }}>
          会員登録
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--yl-color-text-muted)" }}>
          必要事項を入力し、ご希望のプランを選択してください。
        </p>

        {submitted ? (
          <div
            role="status"
            className="mt-6 rounded-lg border-2 p-4 text-sm"
            style={{
              borderColor: "var(--yl-color-primary)",
              backgroundColor: "var(--yl-color-surface)",
              color: "var(--yl-color-text)",
            }}
          >
            登録を受け付けました。ご入力いただいたメールアドレスに確認メールをお送りします。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6" noValidate>
            <Field id={nameId} label="氏名（必須）">
              <Input
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
                placeholder="山田 太郎"
              />
            </Field>

            <Field id={emailId} label="メールアドレス（必須）">
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}
                placeholder="taro@example.com"
              />
            </Field>

            <Field id={companyId} label="会社名（任意）">
              <Input
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.currentTarget.value)}
                placeholder="株式会社サンプル"
              />
            </Field>

            <RadioGroup name="plan" legend="プラン" defaultValue={DEFAULT_PLAN}>
              <div className="flex flex-col gap-3">
                {PLANS.map((p) => {
                  const itemId = `${baseId}-plan-${p.id}`;
                  const selected = plan === p.id;
                  return (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 rounded-lg border-2 p-4 transition-colors"
                      style={{
                        borderColor: selected
                          ? "var(--yl-color-primary)"
                          : "var(--yl-color-border)",
                        backgroundColor: selected
                          ? "var(--yl-color-surface)"
                          : "var(--yl-color-bg)",
                      }}
                    >
                      <RadioGroup.Item id={itemId} value={p.id} onChange={handlePlanChange} />
                      <label htmlFor={itemId} className="flex flex-1 cursor-pointer flex-col gap-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span
                            className="font-semibold"
                            style={{ color: "var(--yl-color-text)" }}
                          >
                            {p.name}
                          </span>
                          <span
                            className={selected ? "text-sm font-semibold" : "text-sm"}
                            style={{
                              color: selected
                                ? "var(--yl-color-primary)"
                                : "var(--yl-color-text)",
                            }}
                          >
                            {p.price}
                          </span>
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--yl-color-text-muted)" }}
                        >
                          {p.description}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2">
              <Checkbox
                id={termsId}
                name="terms"
                checked={agreed}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAgreed(e.currentTarget.checked)}
              />
              <label
                htmlFor={termsId}
                className="cursor-pointer text-sm"
                style={{ color: "var(--yl-color-text)" }}
              >
                利用規約に同意します
              </label>
            </div>

            <Button type="submit" disabled={!canSubmit} className="w-full">
              登録する
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}

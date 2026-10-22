"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Checkbox, Field, Input } from "@yourlib/react";

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
    description: "個人やお試し利用に",
  },
  {
    id: "team",
    name: "チーム",
    price: "月 1,200 円",
    description: "少人数のチームでの共同作業に",
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "要相談",
    description: "大規模な組織向けの導入に",
  },
];

const cardStyle = {
  borderColor: "var(--yl-color-border)",
  backgroundColor: "var(--yl-color-bg)",
} as const;

const textStyle = { color: "var(--yl-color-text)" } as const;
const mutedTextStyle = { color: "var(--yl-color-text-muted)" } as const;

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const companyId = `${baseId}-company`;
  const planGroupName = `${baseId}-plan`;

  const isValid =
    name.trim() !== "" && /^\S+@\S+\.\S+$/.test(email.trim()) && agreed;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  };

  if (submitted) {
    const selected = PLANS.find((p) => p.id === plan);
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div
          className="rounded-xl border p-8 text-center shadow-sm"
          style={cardStyle}
        >
          <h1 className="text-xl font-bold" style={textStyle}>
            登録が完了しました
          </h1>
          <p className="mt-2 text-sm" style={mutedTextStyle}>
            {name} さん、ご登録ありがとうございます。
            <br />
            選択したプラン：{selected?.name}（{selected?.price}）
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-xl border p-8 shadow-sm"
        style={cardStyle}
      >
        <header>
          <h1 className="text-2xl font-bold" style={textStyle}>
            会員登録
          </h1>
          <p className="mt-1 text-sm" style={mutedTextStyle}>
            必要事項を入力し、プランを選択してください。
          </p>
        </header>

        <div className="space-y-4">
          <Field id={nameId} label="氏名">
            <Input
              id={nameId}
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field id={emailId} label="メールアドレス">
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field id={companyId} label="会社名（任意）">
            <Input
              id={companyId}
              name="company"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Field>
        </div>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-medium" style={textStyle}>
            プラン
          </legend>
          <div className="space-y-3">
            {PLANS.map((p) => {
              const checked = plan === p.id;
              return (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors"
                  style={{
                    borderColor: checked
                      ? "var(--yl-color-primary)"
                      : "var(--yl-color-border)",
                    backgroundColor: checked
                      ? "var(--yl-color-surface)"
                      : "var(--yl-color-bg)",
                  }}
                >
                  <input
                    type="radio"
                    name={planGroupName}
                    value={p.id}
                    checked={checked}
                    onChange={() => setPlan(p.id)}
                    className="mt-1 h-4 w-4"
                    style={{ accentColor: "var(--yl-color-primary)" }}
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold" style={textStyle}>
                        {p.name}
                      </span>
                      <span
                        className={
                          checked ? "text-sm font-medium" : "text-sm"
                        }
                        style={
                          checked
                            ? { color: "var(--yl-color-primary)" }
                            : mutedTextStyle
                        }
                      >
                        {p.price}
                      </span>
                    </span>
                    <span className="mt-0.5 text-sm" style={mutedTextStyle}>
                      {p.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Checkbox
          name="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          label="利用規約に同意します"
        />

        <Button type="submit" disabled={!isValid} className="w-full">
          登録する
        </Button>
      </form>
    </div>
  );
}

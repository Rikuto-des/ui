"use client";

import { useId, useState, type FormEvent } from "react";
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
    description: "大規模組織向けのセキュリティとサポートを提供します。",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "agree", string>>;

export function SignupScreen() {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const companyId = `${baseId}-company`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "氏名を入力してください。";
    if (!email.trim()) {
      next.email = "メールアドレスを入力してください。";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "メールアドレスの形式が正しくありません。";
    }
    if (!agreed) next.agree = "利用規約への同意が必要です。";
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: 登録 API を呼び出す
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const selected = PLANS.find((p) => p.id === plan);
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
        <Card className="w-full">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">登録が完了しました</h1>
            <p className="mt-3 text-sm opacity-80">
              {name} さん、ご登録ありがとうございます。選択したプラン：
              {selected?.name}（{selected?.price}）
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="w-full">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">会員登録</h1>
            <p className="mt-2 text-sm opacity-80">
              必要事項を入力し、ご利用になるプランを選択してください。
            </p>
          </header>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <Field id={nameId} label="氏名" required error={errors.name}>
              <Input
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field
              id={emailId}
              label="メールアドレス"
              required
              error={errors.email}
            >
              <Input
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
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>

            <RadioGroup
              legend="プラン"
              name="plan"
              value={plan}
              onChange={(value: string) => setPlan(value as PlanId)}
            >
              {PLANS.map((p) => {
                const isSelected = plan === p.id;
                return (
                  <div
                    key={p.id}
                    className="mb-3 rounded-lg border-2 p-4 transition-colors last:mb-0"
                    style={{
                      borderColor: isSelected
                        ? "var(--yl-color-primary)"
                        : "var(--yl-color-border)",
                      backgroundColor: isSelected
                        ? "var(--yl-color-surface)"
                        : "var(--yl-color-bg)",
                    }}
                  >
                    <RadioGroup.Item
                      value={p.id}
                      label={`${p.name}（${p.price}）`}
                      description={p.description}
                    />
                  </div>
                );
              })}
            </RadioGroup>

            <Checkbox
              name="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label="利用規約に同意します"
              error={errors.agree}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={submitting}
              className="w-full"
            >
              登録する
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}

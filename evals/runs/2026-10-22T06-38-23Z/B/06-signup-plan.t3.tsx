"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Radio,
  RadioGroup,
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
    description: "大規模組織向けのセキュリティとサポートを提供します。",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "agree", string>>;

export function SignupScreen() {
  const planLabelId = useId();

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
        <Card className="w-full p-8 text-center">
          <h1 className="text-2xl font-bold">登録が完了しました</h1>
          <p className="mt-3 text-sm opacity-80">
            {name} さん、ご登録ありがとうございます。選択したプラン：
            {selected?.name}（{selected?.price}）
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">会員登録</h1>
          <p className="mt-2 text-sm opacity-80">
            必要事項を入力し、ご利用になるプランを選択してください。
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          <TextField
            label="氏名"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <TextField
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <TextField
            label="会社名（任意）"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <fieldset className="flex flex-col gap-3">
            <legend id={planLabelId} className="mb-3 text-sm font-semibold">
              プラン
            </legend>
            <RadioGroup
              aria-labelledby={planLabelId}
              name="plan"
              value={plan}
              onChange={(value: string) => setPlan(value as PlanId)}
              className="flex flex-col gap-3"
            >
              {PLANS.map((p) => {
                const isSelected = plan === p.id;
                return (
                  <label
                    key={p.id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                      isSelected
                        ? "border-[var(--color-brand,#7c3aed)] bg-[color-mix(in_srgb,var(--color-brand,#7c3aed)_6%,transparent)]"
                        : "border-black/10 hover:border-black/25",
                    ].join(" ")}
                  >
                    <Radio value={p.id} className="mt-1" />
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-sm font-medium">{p.price}</span>
                      </span>
                      <span className="text-sm opacity-75">{p.description}</span>
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </fieldset>

          <div className="flex flex-col gap-1">
            <Checkbox
              name="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label="利用規約に同意します"
              error={errors.agree}
            />
          </div>

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
      </Card>
    </main>
  );
}

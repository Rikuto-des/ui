"use client";

import { useState, type FormEvent } from "react";
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
    description: "個人での利用や、まずお試しで始めたい方に。",
  },
  {
    id: "team",
    name: "チーム",
    price: "月 1,200 円",
    description: "チームでの共同作業に必要な機能をそろえたプランです。",
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "要相談",
    description: "大規模な組織向けに、個別の要件に合わせてご提案します。",
  },
];

type Errors = Partial<Record<"name" | "email" | "agreed", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "氏名を入力してください。";
    if (!email.trim()) {
      next.email = "メールアドレスを入力してください。";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "メールアドレスの形式が正しくありません。";
    }
    if (!agreed) next.agreed = "登録するには利用規約への同意が必要です。";
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    const selected = PLANS.find((p) => p.id === plan);
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
        <Card className="w-full p-8 text-center">
          <h1 className="text-2xl font-bold">登録が完了しました</h1>
          <p className="mt-3 text-gray-600">
            {name} さん、ご登録ありがとうございます。
            <br />
            選択中のプラン：{selected?.name}（{selected?.price}）
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
          <p className="mt-2 text-sm text-gray-600">
            必要事項を入力し、ご希望のプランを選択してください。
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-5">
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
          </section>

          <section>
            <RadioGroup
              label="プラン"
              name="plan"
              value={plan}
              onChange={(value: string) => setPlan(value as PlanId)}
            >
              <div className="mt-2 grid gap-3">
                {PLANS.map((p) => {
                  const isSelected = plan === p.id;
                  return (
                    <div
                      key={p.id}
                      className={[
                        "rounded-lg border-2 p-4 transition-colors",
                        isSelected
                          ? "border-violet-600 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300",
                      ].join(" ")}
                    >
                      <Radio
                        value={p.id}
                        label={
                          <span className="flex w-full flex-wrap items-baseline justify-between gap-x-3">
                            <span className="font-semibold">{p.name}</span>
                            <span
                              className={
                                isSelected
                                  ? "text-sm font-medium text-violet-700"
                                  : "text-sm text-gray-600"
                              }
                            >
                              {p.price}
                            </span>
                          </span>
                        }
                      />
                      <p className="mt-1 pl-7 text-sm text-gray-600">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </section>

          <section className="space-y-6">
            <div>
              <Checkbox
                name="agreed"
                label="利用規約に同意します"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) {
                    setErrors((prev) => ({ ...prev, agreed: undefined }));
                  }
                }}
              />
              {errors.agreed && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.agreed}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full">
              登録する
            </Button>
          </section>
        </form>
      </Card>
    </main>
  );
}

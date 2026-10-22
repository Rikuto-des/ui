"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Heading,
  Radio,
  RadioGroup,
  Text,
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
    description: "大規模な組織向けに、個別の要件に合わせてご提案します。",
  },
];

type Errors = Partial<Record<"name" | "email" | "agreed", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm() {
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
    if (!agreed) next.agreed = "利用規約への同意が必要です。";
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
      <main className="mx-auto w-full max-w-xl px-4 py-12">
        <Card className="p-8">
          <Heading level={1} className="text-2xl font-bold">
            登録が完了しました
          </Heading>
          <Text className="mt-4">
            {name} さん、ご登録ありがとうございます。
            {selected ? `「${selected.name}」プランでご利用いただけます。` : ""}
          </Text>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <Card className="p-8">
        <Heading level={1} className="text-2xl font-bold">
          会員登録
        </Heading>
        <Text className="mt-2 text-gray-600">
          必要事項を入力し、ご利用のプランを選択してください。
        </Text>

        <form noValidate onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
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

          <RadioGroup
            label="プラン"
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
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300",
                  ].join(" ")}
                >
                  <Radio value={p.id} aria-describedby={`plan-${p.id}-desc`} />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <span
                        className={
                          isSelected ? "font-semibold text-purple-700" : "text-gray-700"
                        }
                      >
                        {p.price}
                      </span>
                    </span>
                    <span id={`plan-${p.id}-desc`} className="text-sm text-gray-600">
                      {p.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>

          <div className="flex flex-col gap-1">
            <Checkbox
              name="agreed"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              error={errors.agreed}
            >
              利用規約に同意します
            </Checkbox>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            登録する
          </Button>
        </form>
      </Card>
    </main>
  );
}

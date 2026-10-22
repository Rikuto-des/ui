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
    description: "チームでの共同作業に必要な機能をひと通り。",
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "要相談",
    description: "大規模な組織向けの導入支援とサポート。",
  },
];

type Errors = Partial<Record<"name" | "email" | "terms", string>>;

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
    if (!agreed) next.terms = "利用規約への同意が必要です。";
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    const selected = PLANS.find((p) => p.id === plan);
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <Card className="p-8">
          <Heading level={1} className="text-2xl font-bold">
            登録が完了しました
          </Heading>
          <Text className="mt-3 text-gray-600">
            {name} さん、ご登録ありがとうございます。{selected?.name}
            プランでご利用いただけます。確認メールを {email} にお送りしました。
          </Text>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="p-8">
        <Heading level={1} className="text-2xl font-bold">
          会員登録
        </Heading>
        <Text className="mt-2 text-gray-600">
          必要事項を入力して、プランを選択してください。
        </Text>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
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
            className="space-y-3"
          >
            {PLANS.map((p) => {
              const isSelected = plan === p.id;
              return (
                <div
                  key={p.id}
                  className={[
                    "rounded-lg border-2 p-4 transition-colors",
                    isSelected
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300",
                  ].join(" ")}
                >
                  <Radio
                    value={p.id}
                    label={
                      <span className="flex w-full items-baseline justify-between gap-4">
                        <span className="font-semibold">{p.name}</span>
                        <span
                          className={
                            isSelected
                              ? "text-sm font-medium text-purple-700"
                              : "text-sm text-gray-600"
                          }
                        >
                          {p.price}
                        </span>
                      </span>
                    }
                    description={p.description}
                  />
                </div>
              );
            })}
          </RadioGroup>

          <Checkbox
            name="terms"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) {
                setErrors((prev) => ({ ...prev, terms: undefined }));
              }
            }}
            label="利用規約に同意します"
            error={errors.terms}
          />

          <Button type="submit" variant="primary" className="w-full">
            登録する
          </Button>
        </form>
      </Card>
    </main>
  );
}

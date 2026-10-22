"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
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

export function SignUpScreen() {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const companyId = `${baseId}-company`;
  const termsId = `${baseId}-terms`;
  const planLabelId = `${baseId}-plan-label`;

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-12">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold">会員登録</h1>
        <p className="mt-2 text-sm text-gray-600">
          必要事項を入力し、ご希望のプランを選択してください。
        </p>

        {submitted ? (
          <div
            role="status"
            className="mt-6 rounded-lg border border-purple-600 bg-purple-50 p-4 text-sm"
          >
            登録を受け付けました。ご入力いただいたメールアドレスに確認メールをお送りします。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor={nameId}>
                氏名<span className="ml-1 text-xs text-red-600">必須</span>
              </Label>
              <Input
                id={nameId}
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={emailId}>
                メールアドレス<span className="ml-1 text-xs text-red-600">必須</span>
              </Label>
              <Input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="taro@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={companyId}>
                会社名<span className="ml-1 text-xs text-gray-500">任意</span>
              </Label>
              <Input
                id={companyId}
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="株式会社サンプル"
              />
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend id={planLabelId} className="mb-3 text-sm font-medium">
                プラン
              </legend>
              <RadioGroup
                aria-labelledby={planLabelId}
                value={plan}
                onValueChange={(value: string) => setPlan(value as PlanId)}
                className="flex flex-col gap-3"
              >
                {PLANS.map((p) => {
                  const itemId = `${baseId}-plan-${p.id}`;
                  const selected = plan === p.id;
                  return (
                    <label
                      key={p.id}
                      htmlFor={itemId}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                        selected
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300",
                      ].join(" ")}
                    >
                      <RadioGroupItem id={itemId} value={p.id} className="mt-1" />
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold">{p.name}</span>
                          <span
                            className={
                              selected
                                ? "text-sm font-semibold text-purple-700"
                                : "text-sm text-gray-700"
                            }
                          >
                            {p.price}
                          </span>
                        </span>
                        <span className="text-sm text-gray-600">{p.description}</span>
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </fieldset>

            <div className="flex items-center gap-2">
              <Checkbox
                id={termsId}
                checked={agreed}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setAgreed(checked === true)
                }
              />
              <Label htmlFor={termsId}>利用規約に同意します</Label>
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

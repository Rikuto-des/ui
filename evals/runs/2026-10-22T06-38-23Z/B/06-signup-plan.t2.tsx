"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Checkbox, TextField } from "@yourlib/react";

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

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PlanId>("team");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const planGroupName = useId();
  const planLegendId = useId();

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
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            登録が完了しました
          </h1>
          <p className="mt-2 text-sm text-gray-600">
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
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <header>
          <h1 className="text-2xl font-bold text-gray-900">会員登録</h1>
          <p className="mt-1 text-sm text-gray-600">
            必要事項を入力し、プランを選択してください。
          </p>
        </header>

        <div className="space-y-4">
          <TextField
            label="氏名"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="会社名（任意）"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <fieldset aria-labelledby={planLegendId} className="space-y-3">
          <legend
            id={planLegendId}
            className="text-sm font-medium text-gray-900"
          >
            プラン
          </legend>
          <div className="space-y-3">
            {PLANS.map((p) => {
              const checked = plan === p.id;
              return (
                <label
                  key={p.id}
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                    "focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2",
                    checked
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name={planGroupName}
                    value={p.id}
                    checked={checked}
                    onChange={() => setPlan(p.id)}
                    className="mt-1 h-4 w-4 accent-purple-600"
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-gray-900">
                        {p.name}
                      </span>
                      <span
                        className={
                          checked
                            ? "text-sm font-medium text-purple-700"
                            : "text-sm text-gray-600"
                        }
                      >
                        {p.price}
                      </span>
                    </span>
                    <span className="mt-0.5 text-sm text-gray-600">
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

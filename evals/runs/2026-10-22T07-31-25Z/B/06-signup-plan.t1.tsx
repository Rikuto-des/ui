"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  TextField,
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

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <Card className="p-8">
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="lg">
            <Stack gap="xs">
              <Heading level={1}>会員登録</Heading>
              <Text tone="muted">必要事項を入力して、プランを選択してください。</Text>
            </Stack>

            <Stack gap="md">
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
            </Stack>

            <RadioGroup
              label="プラン"
              name="plan"
              value={plan}
              onChange={(value: string) => setPlan(value as PlanId)}
            >
              <Stack gap="sm">
                {PLANS.map((p) => {
                  const selected = plan === p.id;
                  return (
                    <label
                      key={p.id}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                        selected
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300",
                      ].join(" ")}
                    >
                      <Radio value={p.id} aria-describedby={`plan-${p.id}-desc`} />
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <Text weight="bold">{p.name}</Text>
                          <Text>{p.price}</Text>
                        </span>
                        <Text id={`plan-${p.id}-desc`} size="sm" tone="muted">
                          {p.description}
                        </Text>
                      </span>
                    </label>
                  );
                })}
              </Stack>
            </RadioGroup>

            <Checkbox
              name="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            >
              利用規約に同意します
            </Checkbox>

            <Button type="submit" variant="primary" disabled={!canSubmit}>
              登録する
            </Button>

            {submitted && (
              <Text role="status" tone="success">
                登録を受け付けました。ご入力のメールアドレスに確認メールをお送りします。
              </Text>
            )}
          </Stack>
        </form>
      </Card>
    </main>
  );
}

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
    description: "個人での利用や、お試しに。",
  },
  {
    id: "team",
    name: "チーム",
    price: "月 1,200 円",
    description: "チームでの共同作業に。",
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "要相談",
    description: "大規模な組織や、個別の要件に。",
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

  const planGroupName = useId();
  const termsErrorId = useId();

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "氏名を入力してください。";
    if (!email.trim()) {
      next.email = "メールアドレスを入力してください。";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "メールアドレスの形式が正しくありません。";
    }
    if (!agreed) next.terms = "登録するには利用規約への同意が必要です。";
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
  }

  if (submitted) {
    const selected = PLANS.find((p) => p.id === plan);
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <div
          role="status"
          className="rounded-xl border border-[var(--yl-color-border)] bg-[var(--yl-color-surface)] p-8 text-center shadow-sm"
        >
          <h1 className="text-2xl font-bold text-[var(--yl-color-text)]">
            登録を受け付けました
          </h1>
          <p className="mt-3 text-[var(--yl-color-text-muted)]">
            {name} 様、「{selected?.name}」プランでのご登録ありがとうございます。
            <br />
            確認メールを {email} にお送りしました。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--yl-color-text)]">会員登録</h1>
      <p className="mt-2 text-sm text-[var(--yl-color-text-muted)]">
        必要事項を入力し、ご希望のプランを選択してください。
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-6">
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

        <fieldset>
          <legend className="text-sm font-medium text-[var(--yl-color-text)]">
            プラン
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => {
              const checked = plan === p.id;
              return (
                <label
                  key={p.id}
                  className={[
                    "relative flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors",
                    "focus-within:ring-2 focus-within:ring-[var(--yl-color-brand)] focus-within:ring-offset-2",
                    checked
                      ? "border-[var(--yl-color-brand)] bg-[var(--yl-color-brand-subtle)]"
                      : "border-[var(--yl-color-border)] bg-[var(--yl-color-surface)] hover:border-[var(--yl-color-border-strong)]",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name={planGroupName}
                    value={p.id}
                    checked={checked}
                    onChange={() => setPlan(p.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--yl-color-text)]">
                      {p.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                        checked
                          ? "border-[var(--yl-color-brand)]"
                          : "border-[var(--yl-color-border-strong)]",
                      ].join(" ")}
                    >
                      {checked && (
                        <span className="h-2 w-2 rounded-full bg-[var(--yl-color-brand)]" />
                      )}
                    </span>
                  </span>
                  <span
                    className={[
                      "mt-1 text-sm font-medium",
                      checked
                        ? "text-[var(--yl-color-brand)]"
                        : "text-[var(--yl-color-text-muted)]",
                    ].join(" ")}
                  >
                    {p.price}
                  </span>
                  <span className="mt-2 text-xs text-[var(--yl-color-text-subtle)]">
                    {p.description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <Checkbox
            name="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? termsErrorId : undefined}
            label="利用規約に同意します"
          />
          {errors.terms && (
            <p id={termsErrorId} className="mt-1 text-sm text-[var(--yl-color-danger)]">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full">
          登録する
        </Button>
      </form>
    </main>
  );
}

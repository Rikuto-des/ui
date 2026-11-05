"use client";
import { useState } from "react";
import { Button, Field, Form, Input, Select } from "@urushi/react";
export default function FormExample() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <div className="interaction-study">
      <header>
        <h3>イベントに申し込む</h3>
      </header>
      <Form
        id="study-form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setSent(`${data.get("name")}さんの申し込みを受け付けました。`);
        }}
      >
        <Field id="study-form-name" label="名前" required>
          <Input name="name" autoComplete="name" />
        </Field>
        <Field id="study-form-email" label="メールアドレス" description="確認のメールを送ります。" required>
          <Input name="email" type="email" autoComplete="email" />
        </Field>
        <Field id="study-form-seats" label="人数" description="1〜4 人" required>
          <Input name="seats" type="number" min={1} max={4} inputMode="numeric" />
        </Field>
        <Field id="study-form-session" label="参加する回" required>
          <Select name="session" placeholder="選んでください">
            <option value="am">午前の回</option>
            <option value="pm">午後の回</option>
          </Select>
        </Field>
        <div className="study-actions">
          <Button type="submit" variant="primary">
            申し込む
          </Button>
        </div>
      </Form>
      <p className="study-caption" role="status">
        {sent ?? "空のまま申し込むと、上にまとめて理由が出ます。"}
      </p>
    </div>
  );
}

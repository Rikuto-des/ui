"use client";
import { useState } from "react";
import { Button, Field, Input } from "@urushi/react";
export default function FieldExample() {
  const [value, setValue] = useState(""),
    [checked, setChecked] = useState(false);
  const valid = /^[a-z][a-z0-9-]{2,23}$/.test(value);
  return (
    <form
      className="interaction-study"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setChecked(true);
        if (!valid)
          e.currentTarget.querySelector<HTMLInputElement>("input")?.focus();
      }}
    >
      <header>
        <small>INLINE VALIDATION</small>
        <h3>入力欄の近くで形式を確認する</h3>
      </header>
      <Field
        id="field-handle"
        label="ワークスペース名"
        description="先頭を英字にして、半角の英小文字・数字・ハイフンで3〜24文字を入力してください。"
        error={
          checked && !valid
            ? "例：field-notes のように入力してください。"
            : undefined
        }
        success={checked && valid ? "この形式で利用できます。" : undefined}
        required
      >
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setChecked(false);
          }}
          spellCheck={false}
          autoComplete="off"
          placeholder="field-notes"
        />
      </Field>
      <div className="study-address">
        workspace / <strong>{value || "your-name"}</strong>
      </div>
      <Button type="submit">形式を確認</Button>
      <p className="study-caption" role="status">
        {checked
          ? valid
            ? "入力形式を確認しました。"
            : "入力内容を確認してください。チーム名の空き状況は確認していません。"
          : "入力形式だけを確認するデモです。"}
      </p>
    </form>
  );
}

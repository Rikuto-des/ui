"use client";
import { useState } from "react";
import { Button, Field, OTPInput } from "@urushi/react";
export default function OTPInputExample() {
  const [code, setCode] = useState(""),
    [checked, setChecked] = useState(false);
  const success = checked && code === "123456";
  return (
    <form
      className="interaction-study"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6 && !success) setChecked(true);
      }}
    >
      <header>
        <small>ONE-TIME CODE</small>
        <h3>確認コードを入力するか貼り付ける</h3>
      </header>
      <Field
        id="otp-study"
        label="デモ用の確認コード"
        description="見本のコードは 123456 です。実際の認証コードは入力しないでください。"
        error={
          checked && !success
            ? "見本のコード 123456 を入力してください。"
            : undefined
        }
        success={success ? "6桁のコードが一致しました。" : undefined}
      >
        <OTPInput
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/[^0-9]/g, ""));
            setChecked(false);
          }}
          readOnly={success}
        />
      </Field>
      <div className="study-actions">
        <Button
          type="submit"
          aria-disabled={code.length !== 6 || success}
          onClick={(e) => {
            if (code.length !== 6 || success) e.preventDefault();
          }}
        >
          コードを確認
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setCode("");
            setChecked(false);
            document.getElementById("otp-study")?.focus();
          }}
        >
          やり直す
        </Button>
      </div>
      <p className="study-caption" role="status">
        {success
          ? "確認できました。やり直すと入力から試せます。"
          : `${code.length} / 6 桁`}
      </p>
    </form>
  );
}

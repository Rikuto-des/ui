"use client";
import { XIcon } from "@urushi/react/icons";
import { useRef, useState } from "react";
import { Button, Field, Input, InputGroup } from "@urushi/react";
export default function InputExample() {
  const [name, setName] = useState("Field notes"),
    [reveal, setReveal] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  return (
    <div className="interaction-study">
      <header>
        <small>IDENTITY</small>
        <h3>入力したタイトルを表紙に反映する</h3>
      </header>
      <div className="study-cover">
        <small>WORKSPACE / 01</small>
        <strong>{name.trim() || "Untitled"}</strong>
        <span>Ideas worth keeping.</span>
      </div>
      <Field
        id="input-project"
        label="プロジェクト名"
        description="消去してもすぐに入力を続けられます。"
      >
        <InputGroup>
          <Input
            ref={field}
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          <InputGroup.Addon>
            <Button
              size="sm"
              variant="ghost"
              aria-label="プロジェクト名を消去"
              aria-disabled={!name}
              onClick={() => {
                setName("");
                field.current?.focus();
              }}
            >
              <XIcon size={16} />
            </Button>
          </InputGroup.Addon>
        </InputGroup>
      </Field>
      <Field
        id="input-demo-password"
        label="パスワード表示の見本"
        description="デモ用の文字列です。実際のパスワードは入力しないでください。"
      >
        <InputGroup>
          <Input
            type={reveal ? "text" : "password"}
            readOnly
            value="sample-only"
            autoComplete="off"
          />
          <InputGroup.Addon>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={reveal}
              onClick={() => setReveal(!reveal)}
            >
              表示
            </Button>
          </InputGroup.Addon>
        </InputGroup>
      </Field>
    </div>
  );
}

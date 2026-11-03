"use client";
import { useState } from "react";
import { Button, Field, Input, InputGroup } from "@urushi/react";
export default function InputGroupExample() {
  const [slug, setSlug] = useState("field-notes"),
    [published, setPublished] = useState("");
  const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  return (
    <form
      className="interaction-study"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) setPublished(slug);
      }}
    >
      <header>
        <small>ADDRESS BUILDER</small>
        <h3>アドレスを入力して確定する</h3>
      </header>
      <Field
        id="group-address"
        label="ページのアドレス"
        description="半角の英小文字・数字・ハイフンで入力してください。"
      >
        <InputGroup>
          <InputGroup.Addon>/</InputGroup.Addon>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            autoComplete="off"
            spellCheck={false}
          />
          <InputGroup.Addon>
            <Button type="submit" size="sm" disabled={!valid}>
              反映
            </Button>
          </InputGroup.Addon>
        </InputGroup>
      </Field>
      <div className="study-result" data-ready={!!published}>
        <small>LOCAL PREVIEW</small>
        <strong>{published ? `/${published}` : "まだ反映していません"}</strong>
        <p role="status">
          {published
            ? "このプレビューのアドレスに反映しました。"
            : "Webへの公開は行いません。"}
        </p>
      </div>
    </form>
  );
}

import type * as React from "react";
import { textareaDefaults, textareaSlot, type TextareaOwnProps } from "./generated/textarea.ts";

export type TextareaProps = TextareaOwnProps & Omit<React.ComponentPropsWithRef<"textarea">, keyof TextareaOwnProps>;

export function Textarea({
  rows = textareaDefaults.rows,
  autoResize = textareaDefaults.autoResize,
  invalid = textareaDefaults.invalid,
  style,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      data-slot={textareaSlot}
      data-autoresize={autoResize ? "" : undefined}
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
      style={{ "--yl-rows": rows, ...style } as React.CSSProperties}
    />
  );
}

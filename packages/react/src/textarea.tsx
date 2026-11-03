import { useId } from "react";
import type * as React from "react";
import { textareaDefaults, textareaSlot, type TextareaOwnProps } from "./generated/textarea.ts";
import { joinIds } from "./util.ts";

export type TextareaProps = TextareaOwnProps & Omit<React.ComponentPropsWithRef<"textarea">, keyof TextareaOwnProps>;

export function Textarea({ rows = textareaDefaults.rows, autoResize = textareaDefaults.autoResize,
  showCount = textareaDefaults.showCount, invalid = textareaDefaults.invalid, className, style, ...rest
}: TextareaProps) {
  const countId = `${useId()}-count`;
  const control = <textarea {...rest} rows={rows} data-slot={textareaSlot}
    data-autoresize={autoResize ? "" : undefined} aria-invalid={invalid || rest["aria-invalid"] || undefined}
    aria-describedby={joinIds(rest["aria-describedby"], showCount ? countId : undefined)}
    className={showCount ? undefined : className}
    style={{ "--ur-rows": rows, ...(showCount ? {} : style) } as React.CSSProperties} />;
  if (!showCount) return control;
  return <div data-slot="textarea-control" className={className} style={style}>
    {control}
    <div data-slot="textarea-budget" hidden>
      <span data-slot="textarea-budget-ring" aria-hidden="true" />
      <span id={countId} data-slot="textarea-count" />
    </div>
  </div>;
}

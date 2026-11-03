import type * as React from "react";
import {
  stepsDefaults,
  stepsItemDefaults,
  stepsItemSlot,
  stepsSlot,
  type StepsItemOwnProps,
  type StepsOwnProps,
} from "./generated/steps.ts";

export type StepsProps = StepsOwnProps & Omit<React.ComponentPropsWithRef<"ol">, keyof StepsOwnProps>;
export type StepsItemProps = StepsItemOwnProps & Omit<React.ComponentPropsWithRef<"li">, keyof StepsItemOwnProps | "children">;

/** One step. Numbers come from a CSS counter; a finished step also says so in text. */
function StepsItem({ title, description, status = stepsItemDefaults.status, ...rest }: StepsItemProps) {
  return (
    <li {...rest} data-slot={stepsItemSlot} data-status={status} aria-current={status === "current" ? "step" : undefined}>
      <span data-slot="steps-marker" aria-hidden="true" />
      <span data-slot="steps-text">
        <span data-slot="steps-title">
          {title}
          {status === "done" ? <span data-slot="visually-hidden">（完了）</span> : null}
        </span>
        {description ? <span data-slot="steps-description">{description}</span> : null}
      </span>
    </li>
  );
}

function StepsRoot({ label, orientation = stepsDefaults.orientation, ...rest }: StepsProps) {
  return <ol {...rest} aria-label={label} data-slot={stepsSlot} data-orientation={orientation} />;
}

export const Steps = Object.assign(StepsRoot, { Item: StepsItem });

import { useId } from "react";
import type * as React from "react";
import { progressDefaults, progressSlot, type ProgressOwnProps } from "./generated/progress.ts";

export interface ProgressMilestone { value: number; label: string }
export type ProgressProps = Omit<ProgressOwnProps, "milestones"> & { milestones?: readonly ProgressMilestone[] } & Omit<React.ComponentPropsWithRef<"progress">, keyof ProgressOwnProps | "children">;

/**
 * A visible label and a native <progress>. className and style go to the
 * wrapper; other props go to the <progress>. Without value it is indeterminate.
 */
export function Progress({ label, value, max = progressDefaults.max, showValue = progressDefaults.showValue, milestones, valueText, className, style, ...rest }: ProgressProps) {
  const id = useId();
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const percent = value === undefined ? undefined : Math.round((Math.min(Math.max(value, 0), safeMax) / safeMax) * 100);
  return (
    <div className={className} style={style} data-slot={progressSlot} data-indeterminate={value === undefined ? "" : undefined}>
      <div data-slot="progress-head">
        <span id={`${id}-label`} data-slot="progress-label">
          {label}
        </span>
        {showValue && percent !== undefined ? (
          // The bar itself announces its value; this copy is for the eye.
          <span data-slot="progress-value" aria-hidden="true">
            {valueText ?? `${percent}%`}
          </span>
        ) : null}
      </div>
      <div data-slot="progress-track" data-complete={percent === 100 ? "" : undefined}>
        <progress {...rest} aria-labelledby={`${id}-label`} aria-valuetext={valueText ?? rest["aria-valuetext"]} value={value} max={safeMax} data-slot="progress-bar" />
        {percent !== undefined ? <span data-slot="progress-fill" aria-hidden="true" style={{ inlineSize: `${percent}%` }} /> : null}
      </div>
      {milestones?.length ? <ol data-slot="progress-milestones">{milestones.map((milestone, index) => <li key={index} data-reached={value !== undefined && value >= milestone.value ? "" : undefined}>
        <span aria-hidden="true" data-slot="progress-checkpoint" />{milestone.label}<span data-slot="visually-hidden">{value !== undefined && value >= milestone.value ? "（到達）" : "（未到達）"}</span>
      </li>)}</ol> : null}
    </div>
  );
}

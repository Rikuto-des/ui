import { useId } from "react";
import type * as React from "react";
import { meterDefaults, meterSlot, type MeterOwnProps } from "./generated/meter.ts";

export type MeterProps = MeterOwnProps & Omit<React.ComponentPropsWithRef<"meter">, keyof MeterOwnProps | "children">;

/**
 * A visible label, the value as text and a native <meter>. The browser colors
 * the bar by how the value sits against low, high and optimum.
 */
export function Meter({
  label,
  value,
  min = meterDefaults.min,
  max = meterDefaults.max,
  low,
  high,
  optimum,
  valueText,
  className,
  style,
  ...rest
}: MeterProps) {
  const id = useId();
  const percent = Math.round(((value - min) / (max - min)) * 100);
  return (
    <div className={className} style={style} data-slot={meterSlot}>
      <div data-slot="meter-head">
        <span id={`${id}-label`} data-slot="meter-label">
          {label}
        </span>
        <span data-slot="meter-value" aria-hidden="true">
          {valueText ?? `${percent}%`}
        </span>
      </div>
      <meter
        {...rest}
        aria-labelledby={`${id}-label`}
        aria-valuetext={typeof valueText === "string" ? valueText : undefined}
        value={value}
        min={min}
        max={max}
        low={low}
        high={high}
        optimum={optimum}
        data-slot="meter-bar"
      />
    </div>
  );
}

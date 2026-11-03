import { useId, type CSSProperties, type ComponentPropsWithRef } from "react";
import { sliderSlot } from "./generated/slider.ts";

export interface SliderMark { value: number; label?: string }
export type SliderProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  /** Shows the current value above the thumb; the optional runtime updates it. */
  showValue?: boolean;
  valueSuffix?: string;
  /** Labelled positions. With the runtime, each can be chosen directly. */
  marks?: readonly SliderMark[];
};

/** Native input semantics remain intact; annotations are progressive enhancements. */
export function Slider({ showValue = false, valueSuffix = "", marks, ...props }: SliderProps) {
  const uid = useId();
  if (!showValue && !marks?.length) return <input {...props} type="range" data-slot={sliderSlot} />;
  const id = props.id ?? `slider-${uid}`;
  const min = Number(props.min ?? 0), max = Math.max(min, Number(props.max ?? 100));
  const raw = Math.max(min, Math.min(max, Number(props.value ?? props.defaultValue ?? (min + max) / 2)));
  const step = props.step === "any" ? 0 : Number(props.step ?? 1);
  const base = props.min !== undefined ? min : Number(props.value ?? props.defaultValue ?? 0);
  const steps = Math.max(Math.ceil((min - base) / step), Math.min(Math.floor((max - base) / step), Math.round((raw - base) / step)));
  const value = step > 0 ? Number((base + steps * step).toPrecision(12)) : raw;
  const percent = (number: number) => max === min ? 0 : (number - min) / (max - min) * 100;
  const stops = marks?.filter(mark => Number.isFinite(mark.value) && mark.value >= min && mark.value <= max) ?? [];
  const { className, style, ...inputProps } = props;
  return <div className={className} data-slot="slider-control" data-show-value={showValue || undefined} data-suffix={valueSuffix} data-disabled={props.disabled || undefined} style={{ ...style, "--ur-slider-progress": `${percent(value)}%` } as CSSProperties}>
    {showValue && <output data-slot="slider-value" htmlFor={id} aria-hidden="true">{value}{valueSuffix}</output>}
    <input {...inputProps} id={id} type="range" data-slot={sliderSlot} />
    {stops.length > 0 && <div data-slot="slider-marks">{stops.map((mark, index) => <button key={`${mark.value}-${index}`} type="button" data-slot="slider-mark" data-value={mark.value} data-edge={percent(mark.value) === 0 ? "start" : percent(mark.value) === 100 ? "end" : undefined} aria-pressed={value === mark.value} disabled style={{ "--ur-slider-mark": `${percent(mark.value)}%` } as CSSProperties}>{mark.label ?? `${mark.value}${valueSuffix}`}</button>)}</div>}
  </div>;
}

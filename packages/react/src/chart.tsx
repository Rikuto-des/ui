import type * as React from "react";
import { chartDefaults, chartSlot, type ChartOwnProps } from "./generated/chart.ts";

export type ChartProps = ChartOwnProps & Omit<React.ComponentPropsWithRef<"figure">, keyof ChartOwnProps | "children">;

/** A round top for the axis: 1, 2 or 5 times a power of ten, with four steps. */
function scale(max: number) {
  if (max <= 0) return { top: 4, ticks: [0, 1, 2, 3, 4] };
  const raw = max / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw)!;
  const ticks = Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6);
  return { top: ticks.at(-1)!, ticks };
}
const format = (n: number) => n.toLocaleString();

/**
 * Bars are flex columns sized in percent; lines are one SVG stretched over
 * the plot with non-scaling strokes, so text stays at its real size at any
 * width. Each column's tooltip is shown by :hover. No hooks: renders in
 * Server Components.
 */
export function Chart({
  type = chartDefaults.type,
  title,
  labels,
  series,
  unit,
  hideTitle = chartDefaults.hideTitle,
  height = chartDefaults.height,
  palette = chartDefaults.palette,
  style,
  ...rest
}: ChartProps) {
  const { top, ticks } = scale(Math.max(...series.flatMap((s) => s.values)));
  const pct = (v: number) => (v / top) * 100;
  const n = labels.length;
  const withUnit = (v: number | undefined) => (v === undefined ? "—" : `${format(v)}${unit ?? ""}`);
  return (
    <figure {...rest} data-slot={chartSlot} data-type={type} data-palette={palette} style={{ "--_height": `${height}px`, "--_columns": n, ...style } as React.CSSProperties}>
      <figcaption data-slot="chart-title" data-hidden={hideTitle ? "" : undefined}>
        {title}
      </figcaption>
      <ul data-slot="chart-legend" aria-hidden="true">
        {series.map((s, k) => (
          <li key={s.name} data-series={k}>
            {s.name}
          </li>
        ))}
      </ul>
      <div data-slot="chart-plot" aria-hidden="true">
        <div data-slot="chart-grid">
          {ticks.map((t) => (
            <span key={t} style={{ "--_at": `${pct(t)}%` } as React.CSSProperties}>
              <span>{format(t)}</span>
            </span>
          ))}
        </div>
        {type === "line" ? (
          <svg data-slot="chart-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {series.map((s, k) => (
              <polyline
                key={s.name}
                data-series={k}
                vectorEffect="non-scaling-stroke"
                points={s.values.map((v, i) => `${((i + 0.5) / n) * 100},${100 - pct(v)}`).join(" ")}
              />
            ))}
          </svg>
        ) : null}
        <div data-slot="chart-columns">
          {labels.map((label, i) => (
            <div key={label} data-slot="chart-column">
              {type === "bar"
                ? series.map((s, k) => <span key={s.name} data-slot="chart-bar" data-series={k} style={{ "--_value": `${pct(s.values[i] ?? 0)}%` } as React.CSSProperties} />)
                : series.map((s, k) => <span key={s.name} data-slot="chart-point" data-series={k} style={{ "--_value": `${pct(s.values[i] ?? 0)}%` } as React.CSSProperties} />)}
              <div data-slot="chart-tooltip">
                <b>{label}</b>
                {series.map((s, k) => (
                  <span key={s.name} data-series={k}>
                    {s.name}
                    <span>{withUnit(s.values[i])}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div data-slot="chart-labels">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      <table data-slot="chart-table">
        <caption>{title}</caption>
        <thead>
          <tr>
            <td />
            {series.map((s) => (
              <th key={s.name} scope="col">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {series.map((s) => (
                <td key={s.name}>{withUnit(s.values[i])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

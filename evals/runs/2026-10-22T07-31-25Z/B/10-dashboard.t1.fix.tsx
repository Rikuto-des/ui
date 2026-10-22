import { Card, Skeleton } from "@yourlib/react";
import type { CSSProperties } from "react";

type MetricKey = "revenue" | "newCustomers" | "churnRate";

type Metric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  /** true のあいだは数値の代わりにスケルトンを表示します */
  loading: boolean;
  revenue?: Metric;
  newCustomers?: Metric;
  churnRate?: Metric;
};

const METRICS: {
  key: MetricKey;
  label: string;
  format: (value: number) => string;
}[] = [
  {
    key: "revenue",
    label: "今月の売上",
    format: (value) =>
      new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        maximumFractionDigits: 0,
      }).format(value),
  },
  {
    key: "newCustomers",
    label: "新規顧客数",
    format: (value) => `${new Intl.NumberFormat("ja-JP").format(value)}人`,
  },
  {
    key: "churnRate",
    label: "解約率",
    format: (value) =>
      `${new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(value)}%`,
  },
];

const labelStyle: CSSProperties = { color: "var(--yl-color-text-muted)" };
const valueStyle: CSSProperties = { color: "var(--yl-color-text)" };
const captionStyle: CSSProperties = { color: "var(--yl-color-text-subtle)" };

function formatChange(changePercent: number): string {
  const rounded = Math.round(changePercent * 10) / 10;
  const formatted = new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 1,
  }).format(Math.abs(rounded));
  if (rounded > 0) return `+${formatted}%`;
  if (rounded < 0) return `-${formatted}%`;
  return "±0%";
}

function changeStyle(changePercent: number): CSSProperties {
  if (changePercent > 0) return { color: "var(--yl-color-success)" };
  if (changePercent < 0) return { color: "var(--yl-color-danger)" };
  return { color: "var(--yl-color-text-muted)" };
}

type SummaryCardProps = {
  label: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
};

function SummaryCard({ label, loading, metric, format }: SummaryCardProps) {
  const showSkeleton = loading || !metric;

  return (
    <Card padding="lg" aria-busy={loading || undefined}>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium" style={labelStyle}>
          {label}
        </p>

        {showSkeleton ? (
          <div
            className="flex flex-col gap-3"
            aria-label={`${label}を読み込み中`}
          >
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold tabular-nums" style={valueStyle}>
              {format(metric.value)}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold tabular-nums"
                style={changeStyle(metric.changePercent)}
              >
                {formatChange(metric.changePercent)}
              </span>
              <span className="text-xs" style={captionStyle}>
                前月比
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading,
  revenue,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  const data: Record<MetricKey, Metric | undefined> = {
    revenue,
    newCustomers,
    churnRate,
  };

  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      {METRICS.map(({ key, label, format }) => (
        <SummaryCard
          key={key}
          label={label}
          loading={loading}
          metric={data[key]}
          format={format}
        />
      ))}
    </section>
  );
}

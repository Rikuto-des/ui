"use client";

import { Badge, Card, Skeleton } from "@yourlib/react";

type Metric = {
  /** 現在の値 */
  value: number;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  /** true のあいだは数値の代わりにスケルトンを表示 */
  loading?: boolean;
  /** 今月の売上（円） */
  monthlySales?: Metric;
  /** 新規顧客数（人） */
  newCustomers?: Metric;
  /** 解約率（%） */
  churnRate?: Metric;
};

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat("ja-JP");

const percentFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function formatChange(changePercent: number): string {
  const sign = changePercent > 0 ? "+" : changePercent < 0 ? "-" : "±";
  return `${sign}${percentFormatter.format(Math.abs(changePercent))}%`;
}

type Trend = "up" | "down" | "flat";

function getTrend(changePercent: number): Trend {
  if (changePercent > 0) return "up";
  if (changePercent < 0) return "down";
  return "flat";
}

// 増加は緑（success）、減少は赤（danger）、横ばいは neutral のバリアントで表す
const trendTone = {
  up: "success",
  down: "danger",
  flat: "neutral",
} as const;

type SummaryCardProps = {
  title: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
};

function SummaryCard({ title, loading, metric, format }: SummaryCardProps) {
  const isLoading = loading || !metric;
  const change = metric?.changePercent ?? 0;
  const trend = getTrend(change);

  return (
    // 影の強さは className ではなく Card のバリアントで指定する
    <Card variant="elevated" aria-busy={isLoading} aria-live="polite">
      <div className="flex flex-col gap-3 p-6">
        <h3 className="text-sm font-medium text-[var(--yl-color-text-secondary)]">
          {title}
        </h3>

        {isLoading ? (
          <>
            <span className="sr-only">{title}を読み込み中</span>
            <Skeleton className="h-10 w-3/4" aria-hidden="true" />
            <Skeleton className="h-6 w-20" aria-hidden="true" />
          </>
        ) : (
          <>
            <p className="text-4xl font-bold tracking-tight text-[var(--yl-color-text-primary)]">
              {format(metric.value)}
            </p>
            <div className="flex items-center gap-2">
              <Badge tone={trendTone[trend]}>
                <span className="sr-only">前月比 </span>
                {formatChange(change)}
              </Badge>
              <span
                className="text-xs text-[var(--yl-color-text-secondary)]"
                aria-hidden="true"
              >
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
  loading = false,
  monthlySales,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      <SummaryCard
        title="今月の売上"
        loading={loading}
        metric={monthlySales}
        format={(v) => yenFormatter.format(v)}
      />
      <SummaryCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        format={(v) => `${countFormatter.format(v)}人`}
      />
      <SummaryCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        format={(v) => `${percentFormatter.format(v)}%`}
      />
    </section>
  );
}

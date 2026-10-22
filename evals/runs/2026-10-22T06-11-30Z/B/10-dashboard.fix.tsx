"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@yourlib/react";

export type MetricValue = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  monthlySales?: MetricValue;
  newCustomers?: MetricValue;
  churnRate?: MetricValue;
};

type MetricCardProps = {
  title: string;
  loading: boolean;
  metric?: MetricValue;
  format: (value: number) => string;
};

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat("ja-JP");

const percentFormatter = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatChange(changePercent: number): string {
  const rounded = Math.round(changePercent * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "-" : "±";
  return `${sign}${Math.abs(rounded)}%`;
}

function ChangeBadge({ changePercent }: { changePercent: number }) {
  // 指定どおり「増えていれば緑、減っていれば赤」。色は Badge のバリアントで表す。
  const variant = changePercent > 0 ? "success" : changePercent < 0 ? "danger" : "neutral";

  return (
    <Badge variant={variant} aria-label={`前月比 ${formatChange(changePercent)}`}>
      {formatChange(changePercent)}
    </Badge>
  );
}

function MetricCard({ title, loading, metric, format }: MetricCardProps) {
  const showSkeleton = loading || !metric;

  return (
    // 影を強めにするため、className ではなく Card の elevated バリアントを使う
    <Card variant="elevated" aria-busy={loading}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {showSkeleton ? (
          <div className="flex flex-col gap-3" aria-label={`${title}を読み込み中`}>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {format(metric.value)}
            </span>
            <div className="flex items-center gap-2 text-sm">
              <ChangeBadge changePercent={metric.changePercent} />
              <span>前月比</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SalesSummaryCards({
  loading,
  monthlySales,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  return (
    <section aria-label="売上サマリー" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="今月の売上"
        loading={loading}
        metric={monthlySales}
        format={(v) => currencyFormatter.format(v)}
      />
      <MetricCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        format={(v) => `${countFormatter.format(v)}人`}
      />
      <MetricCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        format={(v) => `${percentFormatter.format(v)}%`}
      />
    </section>
  );
}

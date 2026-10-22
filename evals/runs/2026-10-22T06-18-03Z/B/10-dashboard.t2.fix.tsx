"use client";

import { Badge, Card, Skeleton, Text } from "@yourlib/react";

type Metric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  monthlySales?: Metric;
  newCustomers?: Metric;
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
  const abs = percentFormatter.format(Math.abs(changePercent));
  if (changePercent > 0) return `+${abs}%`;
  if (changePercent < 0) return `-${abs}%`;
  return `±0%`;
}

function changeVariant(changePercent: number) {
  // 指定どおり「増えていれば緑、減っていれば赤」。
  // ※解約率は増加が悪化を意味するため、必要であれば反転を検討してください。
  if (changePercent > 0) return "success" as const;
  if (changePercent < 0) return "danger" as const;
  return "neutral" as const;
}

type StatCardProps = {
  title: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
};

function StatCard({ title, loading, metric, format }: StatCardProps) {
  const showSkeleton = loading || !metric;

  return (
    // 影の強さは className では変更できないため、Card の標準の見た目を使っています。
    // 強めの影が必要な場合は、yourlib の Card に用意されている影（elevation）の
    // バリアントまたはトークンを指定してください。
    <Card aria-busy={loading || undefined}>
      <div className="flex flex-col gap-3 p-5">
        <Text as="h3" size="sm" color="muted">
          {title}
        </Text>

        {showSkeleton ? (
          <>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-24" />
            {loading && <span className="sr-only">読み込み中</span>}
          </>
        ) : (
          <>
            <Text as="p" className="text-3xl font-bold tabular-nums">
              {format(metric.value)}
            </Text>
            <div className="flex items-center gap-2">
              <Badge variant={changeVariant(metric.changePercent)}>
                {formatChange(metric.changePercent)}
              </Badge>
              <Text as="span" size="sm" color="muted">
                前月比
              </Text>
            </div>
          </>
        )}
      </div>
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
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <StatCard
        title="今月の売上"
        loading={loading}
        metric={monthlySales}
        format={(v) => yenFormatter.format(v)}
      />
      <StatCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        format={(v) => `${countFormatter.format(v)}人`}
      />
      <StatCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        format={(v) => `${percentFormatter.format(v)}%`}
      />
    </section>
  );
}

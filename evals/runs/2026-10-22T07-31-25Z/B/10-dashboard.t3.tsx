"use client";

import { Badge, Card, Skeleton } from "@yourlib/react";

export type SalesMetric = {
  /** Unique key for the card */
  id: string;
  /** Card title */
  label: string;
  /** Formatted value, e.g. "¥12,345,000" */
  value: string;
  /** Change from last month in percent, e.g. 12 or -3.5 */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  /** While true, show skeletons instead of values */
  loading?: boolean;
  /** Three metrics for the cards. Defaults to sample data when omitted. */
  metrics?: SalesMetric[];
};

const DEFAULT_METRICS: SalesMetric[] = [
  { id: "revenue", label: "今月の売上", value: "¥12,480,000", changePercent: 12 },
  { id: "new-customers", label: "新規顧客数", value: "342", changePercent: 8.4 },
  { id: "churn-rate", label: "解約率", value: "2.1%", changePercent: -0.6 },
];

const percentFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function formatChange(changePercent: number): string {
  const sign = changePercent > 0 ? "+" : changePercent < 0 ? "−" : "±";
  return `${sign}${percentFormatter.format(Math.abs(changePercent))}%`;
}

function ChangeBadge({ changePercent }: { changePercent: number }) {
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;

  // Increase = green, decrease = red, unchanged = neutral
  const variant = isUp ? "success" : isDown ? "danger" : "neutral";
  const colorClass = isUp
    ? "bg-green-100 text-green-700"
    : isDown
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  const directionText = isUp ? "増加" : isDown ? "減少" : "変化なし";

  return (
    <Badge
      variant={variant}
      className={colorClass}
      aria-label={`前月比 ${formatChange(changePercent)}（${directionText}）`}
    >
      {formatChange(changePercent)}
    </Badge>
  );
}

function MetricCard({
  metric,
  loading,
}: {
  metric: SalesMetric;
  loading: boolean;
}) {
  const titleId = `metric-${metric.id}-title`;

  return (
    <Card
      className="rounded-xl p-6 shadow-lg"
      aria-labelledby={titleId}
      aria-busy={loading}
    >
      <p id={titleId} className="text-sm font-medium text-gray-600">
        {metric.label}
      </p>

      {loading ? (
        <div className="mt-3 flex flex-col gap-3">
          <span className="sr-only">読み込み中</span>
          <Skeleton className="h-10 w-40 rounded-md" aria-hidden="true" />
          <Skeleton className="h-6 w-28 rounded-full" aria-hidden="true" />
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-4xl font-bold tracking-tight text-gray-900 tabular-nums">
            {metric.value}
          </p>
          <div className="flex items-center gap-2">
            <ChangeBadge changePercent={metric.changePercent} />
            <span className="text-xs text-gray-500">前月比</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export function SalesSummaryCards({
  loading = false,
  metrics = DEFAULT_METRICS,
}: SalesSummaryCardsProps) {
  return (
    <section aria-label="売上サマリー" className="w-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} loading={loading} />
        ))}
      </div>
    </section>
  );
}

"use client";

/*
 * 注意: 「カードの影を少し強めに」というご要望は、このファイルでは反映していません。
 * <Card> の影や角の丸みはパックが決めており、className で上書きできません
 * （<Card> で選べる見た目は padding（sm | md | lg）だけです）。
 * 強めの影が必要な場合は、<Card> の新しいバリアントか、影の強いパックへの切り替えで対応する必要があります。
 */

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

  // Increase = ok (green), decrease = danger (red), unchanged = neutral
  const tone = isUp ? "ok" : isDown ? "danger" : "neutral";
  const directionText = isUp ? "増加" : isDown ? "減少" : "変化なし";

  return (
    <Badge
      tone={tone}
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
    <Card padding="lg" aria-labelledby={titleId} aria-busy={loading}>
      <p
        id={titleId}
        className="text-sm font-medium"
        style={{ color: "var(--yl-color-text-muted)" }}
      >
        {metric.label}
      </p>

      {loading ? (
        <div className="mt-3 flex flex-col gap-3">
          <span className="sr-only">読み込み中</span>
          <Skeleton className="h-10 w-40" aria-hidden="true" />
          <Skeleton className="h-6 w-28" aria-hidden="true" />
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <p
            className="text-4xl font-bold tracking-tight tabular-nums"
            style={{ color: "var(--yl-color-text)" }}
          >
            {metric.value}
          </p>
          <div className="flex items-center gap-2">
            <ChangeBadge changePercent={metric.changePercent} />
            <span
              className="text-xs"
              style={{ color: "var(--yl-color-text-subtle)" }}
            >
              前月比
            </span>
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

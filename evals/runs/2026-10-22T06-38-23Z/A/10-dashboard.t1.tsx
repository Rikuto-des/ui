// 補足: 「カードの影を少し強めに」は反映していません。
// Card の見た目（影を含む）はパックが決めるもので、className や style で上書きできません。
// Card には影を変える variant もないため、必要であれば Card の契約と全パックに
// 新しい variant（例: elevation="raised"）を追加する形で検討させてください。

import { Badge, Card, Skeleton } from "@yourlib/react";

type Metric = {
  /** 表示用に整形済みの値（例: "¥12,480,000"、"1,284"、"2.4%"） */
  value: string;
  /** 前月比（%）。例: 12 → +12%、-3 → -3% */
  change: number;
};

export type SalesSummaryCardsProps = {
  loading?: boolean;
  revenue?: Metric;
  newCustomers?: Metric;
  churnRate?: Metric;
};

function formatChange(change: number): string {
  const rounded = Math.round(change * 10) / 10;
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `${rounded}%`;
  return "±0%";
}

function changeTone(change: number): "ok" | "danger" | "neutral" {
  if (change > 0) return "ok";
  if (change < 0) return "danger";
  return "neutral";
}

function MetricCard({
  title,
  metric,
  loading,
}: {
  title: string;
  metric?: Metric;
  loading: boolean;
}) {
  const isLoading = loading || !metric;

  return (
    <Card title={title} headingLevel="h2" padding="md" className="w-full">
      <div aria-busy={isLoading ? "true" : undefined} className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton shape="block" className="h-10 w-40" />
            <Skeleton shape="text" lines={1} className="w-24" />
          </>
        ) : (
          <>
            <p
              className="text-4xl font-bold leading-tight"
              style={{
                color: "var(--yl-color-text)",
                fontVariantNumeric: "var(--yl-font-numeric)",
              }}
            >
              {metric.value}
            </p>
            <p
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--yl-color-text-muted)" }}
            >
              <span>前月比</span>
              <Badge tone={changeTone(metric.change)}>{formatChange(metric.change)}</Badge>
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading = false,
  revenue = { value: "¥12,480,000", change: 12 },
  newCustomers = { value: "1,284", change: 5.3 },
  churnRate = { value: "2.4%", change: -0.8 },
}: SalesSummaryCardsProps) {
  return (
    <section aria-label="売上サマリー" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard title="今月の売上" metric={revenue} loading={loading} />
      <MetricCard title="新規顧客数" metric={newCustomers} loading={loading} />
      <MetricCard title="解約率" metric={churnRate} loading={loading} />
    </section>
  );
}

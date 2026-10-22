import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * 注意: 「カードの影を少し強めに」は反映していません。
 * Card には影の強さを変える variant がなく、className や style で
 * 影を上書きすることはルールで禁止されています（見た目はパックが決めます）。
 * 強い影が必要な場合は、Card に新しい variant（例: elevation="raised"）を
 * 追加し、すべてのパックで定義する必要があります。追加してよいか確認させてください。
 *
 * 注意: 指示どおり、前月比は「増加 = 緑 / 減少 = 赤」で表示しています。
 * ただし解約率は増えると悪化を意味するため、緑で表示されます。
 * 解約率だけ色を逆にする場合はお知らせください。
 */

export type SalesMetric = {
  /** 表示用に整形済みの値（例: "¥12,340,000"、"128 人"、"2.4%"） */
  value: string;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  change: number;
};

export type SalesSummaryCardsProps = {
  loading?: boolean;
  monthlySales?: SalesMetric;
  newCustomers?: SalesMetric;
  churnRate?: SalesMetric;
};

function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}%`;
}

function ChangeBadge({ change }: { change: number }) {
  const tone = change > 0 ? "ok" : change < 0 ? "danger" : "neutral";
  const direction = change > 0 ? "増加" : change < 0 ? "減少" : "横ばい";
  return (
    <Badge tone={tone} dot>
      前月比 {formatChange(change)}（{direction}）
    </Badge>
  );
}

function MetricCard({
  title,
  metric,
  loading,
}: {
  title: string;
  metric?: SalesMetric;
  loading: boolean;
}) {
  const isLoading = loading || !metric;

  return (
    <Card title={title} headingLevel="h2" className="w-full">
      {isLoading ? (
        <div aria-busy="true" className="flex flex-col gap-3">
          <Skeleton shape="text" lines={1} className="w-40" />
          <Skeleton shape="text" lines={1} className="w-24" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p
            className="text-3xl font-bold leading-tight"
            style={{
              color: "var(--yl-color-text)",
              fontVariantNumeric: "var(--yl-font-numeric)",
            }}
          >
            {metric.value}
          </p>
          <div>
            <ChangeBadge change={metric.change} />
          </div>
        </div>
      )}
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
      aria-busy={loading ? "true" : undefined}
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <MetricCard title="今月の売上" metric={monthlySales} loading={loading} />
      <MetricCard title="新規顧客数" metric={newCustomers} loading={loading} />
      <MetricCard title="解約率" metric={churnRate} loading={loading} />
    </section>
  );
}

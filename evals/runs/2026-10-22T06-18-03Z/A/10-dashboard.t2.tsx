import { Badge, Card, Skeleton } from "@yourlib/react";

// 注: カードの影を強くする指定は入れていません。
// Card の見た目はパックが決めるため、className や style では変えられません。
// 影の強いカードが必要な場合は、Card に新しい variant（例: elevation="raised"）を
// コントラクトとすべてのパックに追加する必要があります。追加してよいか確認させてください。

type Metric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → +12%、-3.5 → -3.5% */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  /** 今月の売上（円） */
  revenue?: Metric;
  /** 新規顧客数（人） */
  newCustomers?: Metric;
  /** 解約率（%） */
  churnRate?: Metric;
};

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const count = new Intl.NumberFormat("ja-JP");
const percent = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const change = new Intl.NumberFormat("ja-JP", {
  signDisplay: "exceptZero",
  maximumFractionDigits: 1,
});

function ChangeBadge({ changePercent }: { changePercent: number }) {
  // 指定どおり、増加は緑（ok）、減少は赤（danger）、横ばいは neutral。
  // 色だけに頼らないよう、符号付きの数値と「前月比」をテキストで示します。
  const tone = changePercent > 0 ? "ok" : changePercent < 0 ? "danger" : "neutral";
  return (
    <Badge tone={tone} dot>
      前月比 {change.format(changePercent)}%
    </Badge>
  );
}

type MetricCardProps = {
  title: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
  unit?: string;
};

function MetricCard({ title, loading, metric, format, unit }: MetricCardProps) {
  const isLoading = loading || !metric;

  return (
    <Card title={title} headingLevel="h2" padding="md">
      <div aria-busy={isLoading ? "true" : undefined} className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton shape="block" className="h-10 w-40" />
            <Skeleton shape="text" className="w-24" />
          </>
        ) : (
          <>
            <p className="text-4xl font-bold tabular-nums leading-tight">
              {format(metric.value)}
              {unit ? <span className="ml-1 text-xl font-bold">{unit}</span> : null}
            </p>
            <div>
              <ChangeBadge changePercent={metric.changePercent} />
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
  return (
    <section aria-label="今月の概要" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="今月の売上"
        loading={loading}
        metric={revenue}
        format={(v) => yen.format(v)}
      />
      <MetricCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        format={(v) => count.format(v)}
        unit="人"
      />
      <MetricCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        format={(v) => percent.format(v)}
        unit="%"
      />
    </section>
  );
}

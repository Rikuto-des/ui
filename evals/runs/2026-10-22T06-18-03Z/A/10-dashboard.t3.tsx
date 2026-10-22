import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * 注意: カードの影を強くする指定は入れていません。
 * yourlib では見た目はパックが決めるため、className や style で Card の影を
 * 上書きすることはルール違反になります（Card の className で変えてよいのは
 * margin・width・layout・position だけです）。
 * 影の強いカードが必要な場合は、Card に新しい variant（例: elevation="raised"）を
 * コントラクトとすべてのパックに追加する必要があります。追加してよいか確認させてください。
 */

type Metric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → +12%、-3.5 → -3.5% */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  loading?: boolean;
  revenue?: Metric;
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
  if (changePercent > 0) return `+${percentFormatter.format(changePercent)}%`;
  if (changePercent < 0) return `-${percentFormatter.format(Math.abs(changePercent))}%`;
  return "±0%";
}

function changeTone(changePercent: number): "ok" | "danger" | "neutral" {
  if (changePercent > 0) return "ok";
  if (changePercent < 0) return "danger";
  return "neutral";
}

type MetricCardProps = {
  title: string;
  description: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
};

function MetricCard({ title, description, loading, metric, format }: MetricCardProps) {
  const isLoading = loading || !metric;

  return (
    <Card title={title} description={description} headingLevel="h2" padding="md">
      <div aria-busy={isLoading ? "true" : undefined} className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton shape="text" lines={1} />
            <Skeleton shape="text" lines={1} className="w-24" />
          </>
        ) : (
          <>
            <p className="text-4xl font-bold tabular-nums leading-tight">
              {format(metric.value)}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <span>前月比</span>
              <Badge tone={changeTone(metric.changePercent)}>
                {formatChange(metric.changePercent)}
              </Badge>
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading = false,
  revenue,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  return (
    <section aria-label="今月の概要" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="今月の売上"
        description="今月 1 日から今日までの売上合計"
        loading={loading}
        metric={revenue}
        format={(value) => yenFormatter.format(value)}
      />
      <MetricCard
        title="新規顧客数"
        description="今月新たに契約した顧客の数"
        loading={loading}
        metric={newCustomers}
        format={(value) => `${countFormatter.format(value)} 社`}
      />
      <MetricCard
        title="解約率"
        description="今月解約した顧客の割合"
        loading={loading}
        metric={churnRate}
        format={(value) => `${percentFormatter.format(value)}%`}
      />
    </section>
  );
}

import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * 売上ダッシュボード上段のサマリーカード（今月の売上・新規顧客数・解約率）
 *
 * Card の影は強めていません。
 * yourlib では見た目を pack が決めるため、className や style で影を上書きできません。
 * Card には影を選ぶ variant もありません。
 * 影を強くするには、Card の契約に variant（例: elevation="raised"）を追加し、
 * すべての pack に定義する必要があります。必要であれば、その追加を相談してください。
 *
 * 前月比の色はご指定どおり、増加なら緑（ok）、減少なら赤（danger）です。
 * 解約率は増えると悪い指標なので、逆の配色にしたい場合は
 * metric に higherIsBetter: false を指定してください。
 */

export type SalesMetric = {
  id: string;
  title: string;
  /** 表示用に整形済みの値（例: "¥12,480,000"） */
  value: string;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  changePercent: number;
  /** false の場合、増加を赤・減少を緑で表示する（初期値は true） */
  higherIsBetter?: boolean;
};

export type SalesSummaryCardsProps = {
  loading?: boolean;
  metrics?: SalesMetric[];
};

const defaultMetrics: SalesMetric[] = [
  { id: "revenue", title: "今月の売上", value: "¥12,480,000", changePercent: 12 },
  { id: "new-customers", title: "新規顧客数", value: "342", changePercent: 8 },
  { id: "churn-rate", title: "解約率", value: "2.4%", changePercent: -0.6 },
];

function formatChange(percent: number): string {
  if (percent === 0) return "±0%";
  const sign = percent > 0 ? "+" : "-";
  const abs = Math.abs(percent);
  const text = Number.isInteger(abs) ? abs.toString() : abs.toFixed(1);
  return `${sign}${text}%`;
}

function changeTone(
  percent: number,
  higherIsBetter: boolean,
): "ok" | "danger" | "neutral" {
  if (percent === 0) return "neutral";
  const isUp = percent > 0;
  return isUp === higherIsBetter ? "ok" : "danger";
}

function MetricCard({
  metric,
  loading,
}: {
  metric: SalesMetric;
  loading: boolean;
}) {
  const { title, value, changePercent, higherIsBetter = true } = metric;

  return (
    <Card title={title} headingLevel="h2" padding="md">
      <div aria-busy={loading ? "true" : undefined} className="flex flex-col gap-3">
        {loading ? (
          <>
            <Skeleton shape="block" className="h-10 w-40" />
            <Skeleton shape="text" lines={1} className="w-24" />
          </>
        ) : (
          <>
            <p
              className="m-0 text-4xl font-bold leading-tight"
              style={{
                color: "var(--yl-color-text)",
                fontVariantNumeric: "var(--yl-font-numeric)",
              }}
            >
              {value}
            </p>
            <div>
              <Badge tone={changeTone(changePercent, higherIsBetter)} dot>
                前月比 {formatChange(changePercent)}
              </Badge>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading = false,
  metrics = defaultMetrics,
}: SalesSummaryCardsProps) {
  return (
    <section
      aria-label="今月のサマリー"
      aria-busy={loading ? "true" : undefined}
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} loading={loading} />
      ))}
    </section>
  );
}

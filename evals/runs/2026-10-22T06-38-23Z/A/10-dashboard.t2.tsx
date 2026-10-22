import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * 売上ダッシュボード上段の KPI カード（今月の売上・新規顧客数・解約率）
 *
 * 注意: 「カードの影を少し強めに」は反映していません。
 * Card には影を変える variant がなく、className / style で影を上書きすることは
 * yourlib の規約（SKILL.md ルール 1・2）で禁止されています。
 * 強い影が必要な場合は、Card に新しい variant（例: elevation="raised"）を追加し、
 * 全パックに定義する必要があります。追加してよいかご判断ください。
 *
 * 補足: 前月比は指定どおり「増加 = 緑 / 減少 = 赤」で表示しています。
 * 解約率は増加が悪化を意味するため、逆の色にしたい場合は
 * KpiCard の higherIsBetter を false にしてください。
 */

export type KpiMetric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 なら +12%、-3.5 なら -3.5% */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  sales?: KpiMetric;
  newCustomers?: KpiMetric;
  /** value は解約率（%）。例: 2.4 なら 2.4% */
  churnRate?: KpiMetric;
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

const changeFormat = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function formatChange(changePercent: number): string {
  if (changePercent > 0) return `+${changeFormat.format(changePercent)}%`;
  if (changePercent < 0) return `-${changeFormat.format(Math.abs(changePercent))}%`;
  return "±0%";
}

type KpiCardProps = {
  title: string;
  loading: boolean;
  metric?: KpiMetric;
  formatValue: (value: number) => string;
  /** false にすると、増加を赤・減少を緑で表示します */
  higherIsBetter?: boolean;
};

function KpiCard({
  title,
  loading,
  metric,
  formatValue,
  higherIsBetter = true,
}: KpiCardProps) {
  const isLoading = loading || !metric;

  let tone: "ok" | "danger" | "neutral" = "neutral";
  if (metric && metric.changePercent !== 0) {
    const increased = metric.changePercent > 0;
    tone = increased === higherIsBetter ? "ok" : "danger";
  }

  return (
    <Card title={title} headingLevel="h2" padding="md" className="w-full">
      <div aria-busy={isLoading ? "true" : undefined} className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton shape="text" lines={1} className="w-40" />
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
              {formatValue(metric.value)}
            </p>
            <p className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: "var(--yl-color-text-muted)" }}
              >
                前月比
              </span>
              <Badge tone={tone}>{formatChange(metric.changePercent)}</Badge>
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading,
  sales,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  return (
    <section aria-label="今月のサマリー" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <KpiCard
        title="今月の売上"
        loading={loading}
        metric={sales}
        formatValue={(v) => yen.format(v)}
      />
      <KpiCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        formatValue={(v) => `${count.format(v)} 人`}
      />
      <KpiCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        formatValue={(v) => `${percent.format(v)}%`}
      />
    </section>
  );
}

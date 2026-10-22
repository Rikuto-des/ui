import { Badge, Card, Skeleton } from "@yourlib/react";

// 注意:
// - カードの影はパックの --yl-shadow-panel で決まり、Card には影を強めるバリアントがありません。
//   className / style で上書きするとパックの契約に反するため、ここでは標準の影のままにしています。
//   影を強くする場合は、Card の契約と全パックに新しいバリアント（例: elevation="raised"）を追加する必要があります。追加しますか？
// - 前月比はご指定どおり「増加=緑 / 減少=赤」です。解約率は増えると悪化を意味するため、
//   解約率だけ色を逆にする場合はお知らせください。

type Metric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 は +12%、-3.5 は -3.5% */
  changePercent: number;
};

type SalesSummaryCardsProps = {
  loading: boolean;
  revenue?: Metric;
  newCustomers?: Metric;
  /** value は % で渡します（例: 2.4 は 2.4%） */
  churnRate?: Metric;
};

const yenFormat = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const countFormat = new Intl.NumberFormat("ja-JP");

const rateFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const changeFormat = new Intl.NumberFormat("ja-JP", {
  signDisplay: "exceptZero",
  maximumFractionDigits: 1,
});

function ChangeBadge({ changePercent }: { changePercent: number }) {
  if (changePercent === 0) {
    return <Badge tone="neutral">前月比 ±0%</Badge>;
  }

  const tone = changePercent > 0 ? "ok" : "danger";

  return (
    <Badge tone={tone} dot>
      前月比 {changeFormat.format(changePercent)}%
    </Badge>
  );
}

function MetricCard({
  title,
  loading,
  metric,
  format,
}: {
  title: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
}) {
  const showSkeleton = loading || !metric;

  return (
    <Card title={title} headingLevel="h2">
      <div className="flex flex-col gap-3" aria-busy={showSkeleton ? "true" : undefined}>
        {showSkeleton ? (
          <>
            <div className="flex h-10 items-center">
              <Skeleton shape="text" className="w-40" />
            </div>
            <Skeleton shape="text" className="w-24" />
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
              {format(metric.value)}
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
    <section
      aria-label="売上サマリー"
      aria-busy={loading ? "true" : undefined}
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <MetricCard
        title="今月の売上"
        loading={loading}
        metric={revenue}
        format={(value) => yenFormat.format(value)}
      />
      <MetricCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        format={(value) => `${countFormat.format(value)} 人`}
      />
      <MetricCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        format={(value) => `${rateFormat.format(value)}%`}
      />
    </section>
  );
}

import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * ⚠️ About the "slightly stronger shadow" request:
 * The yourlib rules don't allow restyling a Card's look (including its shadow)
 * with className or style. Visuals come from the active pack only.
 * Card also has no variant for shadow strength, so this file uses the pack's
 * default shadow. If you need a stronger shadow, please consider adding a variant
 * such as `elevation="raised"` to the Card contract and to every pack.
 *
 * The large, bold numbers are applied to this screen's own <p> element, not to a component.
 */

type Trend = {
  /** Change versus last month, in percent (e.g. 12 means +12%, -3.5 means -3.5%) */
  changePercent: number;
};

export type SalesSummary = {
  /** This month's sales (JPY) */
  monthlyRevenue: number;
  /** Number of new customers */
  newCustomers: number;
  /** Churn rate (%) */
  churnRate: number;
  revenueTrend: Trend;
  newCustomersTrend: Trend;
  churnRateTrend: Trend;
};

export type SalesSummaryCardsProps = {
  /** While true, show loading shapes instead of the numbers */
  loading?: boolean;
  data?: SalesSummary;
};

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const count = new Intl.NumberFormat("ja-JP");
const percent = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function formatChange(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  return `${sign}${percent.format(Math.abs(value))}%`;
}

/*
 * As requested: green (ok) for an increase, red (danger) for a decrease.
 * Zero is shown as neutral.
 * Note: for churn rate, a rise is the bad direction.
 * To color by good/bad instead, flip the tone for the churn card only.
 */
function toneFor(value: number): "ok" | "danger" | "neutral" {
  if (value > 0) return "ok";
  if (value < 0) return "danger";
  return "neutral";
}

type MetricCardProps = {
  title: string;
  value: string;
  trend: Trend;
  loading: boolean;
};

function MetricCard({ title, value, trend, loading }: MetricCardProps) {
  return (
    <Card title={title} headingLevel="h2" padding="md" className="w-full">
      {loading ? (
        <div aria-busy="true">
          <Skeleton shape="text" lines={2} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-3xl font-bold tabular-nums leading-tight">
            {value}
          </p>
          <div>
            <Badge tone={toneFor(trend.changePercent)}>
              前月比 {formatChange(trend.changePercent)}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}

const sampleData: SalesSummary = {
  monthlyRevenue: 12_840_000,
  newCustomers: 342,
  churnRate: 2.4,
  revenueTrend: { changePercent: 12 },
  newCustomersTrend: { changePercent: 5.3 },
  churnRateTrend: { changePercent: -0.8 },
};

export function SalesSummaryCards({
  loading = false,
  data = sampleData,
}: SalesSummaryCardsProps) {
  return (
    <section
      aria-label="今月のサマリー"
      aria-busy={loading ? "true" : undefined}
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <MetricCard
        title="今月の売上"
        value={yen.format(data.monthlyRevenue)}
        trend={data.revenueTrend}
        loading={loading}
      />
      <MetricCard
        title="新規顧客数"
        value={`${count.format(data.newCustomers)} 人`}
        trend={data.newCustomersTrend}
        loading={loading}
      />
      <MetricCard
        title="解約率"
        value={`${percent.format(data.churnRate)}%`}
        trend={data.churnRateTrend}
        loading={loading}
      />
    </section>
  );
}

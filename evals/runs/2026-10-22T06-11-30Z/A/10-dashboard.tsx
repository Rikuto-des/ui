import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * 売上ダッシュボード上段のサマリーカード（3 枚）。
 *
 * ※ カードの影について:
 *   yourlib の Card は見た目（影・角丸・背景など）を pack が決めます。
 *   Card の契約にある className は margin / width / layout / position の調整だけなので、
 *   className や style で影を強めることはできません。
 *   影の強いカードが必要なら、Card に新しい variant（例: elevation="raised"）を
 *   契約とすべての pack に追加する必要があります。追加してよいか確認させてください。
 *   それまでは pack 標準の影で表示しています。
 *
 * ※ 前月比の色:
 *   指定どおり「増えたら緑、減ったら赤」にしています。
 *   解約率は増えると悪い指標なので、逆の色にしたい場合は
 *   higherIsBetter を false にすると色が反転します。
 */

export type SalesSummaryMetrics = {
  /** 今月の売上（円） */
  monthlyRevenue: number;
  /** 前月比（%）。例: 12 なら +12% */
  monthlyRevenueChange: number;
  /** 新規顧客数（人） */
  newCustomers: number;
  /** 前月比（%） */
  newCustomersChange: number;
  /** 解約率（%）。例: 2.4 なら 2.4% */
  churnRate: number;
  /** 前月比（%） */
  churnRateChange: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  metrics?: SalesSummaryMetrics;
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

function formatChange(change: number): string {
  if (change > 0) return `+${percent.format(change)}%`;
  if (change < 0) return `−${percent.format(Math.abs(change))}%`;
  return `±0%`;
}

function changeTone(
  change: number,
  higherIsBetter: boolean,
): "ok" | "danger" | "neutral" {
  if (change === 0) return "neutral";
  const isUp = change > 0;
  return isUp === higherIsBetter ? "ok" : "danger";
}

type MetricCardProps = {
  title: string;
  loading: boolean;
  value?: string;
  change?: number;
  higherIsBetter?: boolean;
};

function MetricCard({
  title,
  loading,
  value,
  change,
  higherIsBetter = true,
}: MetricCardProps) {
  const isLoading = loading || value === undefined || change === undefined;

  return (
    <Card title={title} headingLevel="h2" padding="md">
      <div aria-busy={isLoading ? "true" : undefined}>
        {isLoading ? (
          <Skeleton shape="text" lines={2} />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-bold tabular-nums">{value}</p>
            <p className="flex items-center gap-2 text-sm">
              <span>前月比</span>
              <Badge tone={changeTone(change, higherIsBetter)}>
                {formatChange(change)}
              </Badge>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({ loading, metrics }: SalesSummaryCardsProps) {
  return (
    <section
      aria-label="今月のサマリー"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <MetricCard
        title="今月の売上"
        loading={loading}
        value={metrics ? yen.format(metrics.monthlyRevenue) : undefined}
        change={metrics?.monthlyRevenueChange}
      />
      <MetricCard
        title="新規顧客数"
        loading={loading}
        value={metrics ? `${count.format(metrics.newCustomers)}人` : undefined}
        change={metrics?.newCustomersChange}
      />
      <MetricCard
        title="解約率"
        loading={loading}
        value={metrics ? `${percent.format(metrics.churnRate)}%` : undefined}
        change={metrics?.churnRateChange}
      />
    </section>
  );
}

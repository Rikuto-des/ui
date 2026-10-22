import { Badge, Card, Skeleton } from "@yourlib/react";

export type SalesSummaryData = {
  /** 今月の売上（円） */
  monthlyRevenue: number;
  /** 売上の前月比（%）。例: 12 → +12% */
  monthlyRevenueChange: number;
  /** 新規顧客数 */
  newCustomers: number;
  /** 新規顧客数の前月比（%） */
  newCustomersChange: number;
  /** 解約率（%）。例: 2.4 → 2.4% */
  churnRate: number;
  /** 解約率の前月比（%） */
  churnRateChange: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  data?: SalesSummaryData;
};

type MetricCardProps = {
  title: string;
  value: string;
  change: number;
  loading: boolean;
};

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("ja-JP");

const percentFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function formatChange(change: number): string {
  if (change > 0) return `+${percentFormatter.format(change)}%`;
  if (change < 0) return `${percentFormatter.format(change)}%`; // マイナス記号は formatter が付与
  return "±0%";
}

function changeClassName(change: number): string {
  // 指定どおり「増加 = 緑 / 減少 = 赤」で統一しています。
  // ※ 解約率は増加が悪化を意味するため、必要に応じて色を反転させてください。
  if (change > 0) return "bg-green-100 text-green-800";
  if (change < 0) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
}

function changeArrow(change: number): string {
  if (change > 0) return "▲";
  if (change < 0) return "▼";
  return "―";
}

function MetricCard({ title, value, change, loading }: MetricCardProps) {
  return (
    <Card
      className="flex flex-col gap-3 rounded-xl p-6 shadow-lg"
      aria-busy={loading}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>

      {loading ? (
        <div className="flex flex-col gap-3" aria-label={`${title}を読み込み中`}>
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      ) : (
        <>
          <p className="text-4xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <div className="flex items-center gap-2">
            <Badge
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold ${changeClassName(
                change,
              )}`}
            >
              <span aria-hidden="true">{changeArrow(change)}</span>
              {formatChange(change)}
            </Badge>
            <span className="text-xs text-gray-500">前月比</span>
          </div>
        </>
      )}
    </Card>
  );
}

export function SalesSummaryCards({ loading, data }: SalesSummaryCardsProps) {
  const isLoading = loading || !data;

  const metrics: Array<{ title: string; value: string; change: number }> = [
    {
      title: "今月の売上",
      value: data ? currencyFormatter.format(data.monthlyRevenue) : "",
      change: data?.monthlyRevenueChange ?? 0,
    },
    {
      title: "新規顧客数",
      value: data ? `${integerFormatter.format(data.newCustomers)}人` : "",
      change: data?.newCustomersChange ?? 0,
    },
    {
      title: "解約率",
      value: data ? `${percentFormatter.format(data.churnRate)}%` : "",
      change: data?.churnRateChange ?? 0,
    },
  ];

  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          loading={isLoading}
        />
      ))}
    </section>
  );
}

import { Card, Skeleton } from "@yourlib/react";

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

function changeColor(change: number): string {
  // 指定どおり「増加 = 緑 / 減少 = 赤」で統一しています。
  // ※ 解約率は増加が悪化を意味するため、必要に応じて色を反転させてください。
  if (change > 0) return "var(--yl-color-success)";
  if (change < 0) return "var(--yl-color-danger)";
  return "var(--yl-color-text-muted)";
}

function changeArrow(change: number): string {
  if (change > 0) return "▲";
  if (change < 0) return "▼";
  return "―";
}

function MetricCard({ title, value, change, loading }: MetricCardProps) {
  // カードの影の強さはパックのトークン／バリアントで決まるため、
  // ここでは className で上書きしていません。強めの影はパック側の設定で指定してください。
  return (
    <Card aria-busy={loading}>
      <div className="flex flex-col gap-3">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--yl-color-text-muted)" }}
        >
          {title}
        </p>

        {loading ? (
          <div
            className="flex flex-col gap-3"
            aria-label={`${title}を読み込み中`}
          >
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-6 w-28" />
          </div>
        ) : (
          <>
            <p
              className="text-4xl font-bold tracking-tight"
              style={{ color: "var(--yl-color-text)" }}
            >
              {value}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: changeColor(change) }}
              >
                <span aria-hidden="true">{changeArrow(change)}</span>
                {formatChange(change)}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--yl-color-text-subtle)" }}
              >
                前月比
              </span>
            </div>
          </>
        )}
      </div>
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

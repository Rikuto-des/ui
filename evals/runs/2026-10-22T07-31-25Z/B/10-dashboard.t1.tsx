import { Badge, Card, Skeleton } from "@yourlib/react";

type MetricKey = "revenue" | "newCustomers" | "churnRate";

type Metric = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → "+12%"、-3.5 → "-3.5%" */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  /** true のあいだは数値の代わりにスケルトンを表示します */
  loading: boolean;
  revenue?: Metric;
  newCustomers?: Metric;
  churnRate?: Metric;
};

const METRICS: {
  key: MetricKey;
  label: string;
  format: (value: number) => string;
}[] = [
  {
    key: "revenue",
    label: "今月の売上",
    format: (value) =>
      new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        maximumFractionDigits: 0,
      }).format(value),
  },
  {
    key: "newCustomers",
    label: "新規顧客数",
    format: (value) => `${new Intl.NumberFormat("ja-JP").format(value)}人`,
  },
  {
    key: "churnRate",
    label: "解約率",
    format: (value) =>
      `${new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(value)}%`,
  },
];

function formatChange(changePercent: number): string {
  const rounded = Math.round(changePercent * 10) / 10;
  const formatted = new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 1,
  }).format(Math.abs(rounded));
  if (rounded > 0) return `+${formatted}%`;
  if (rounded < 0) return `-${formatted}%`;
  return "±0%";
}

function changeClassName(changePercent: number): string {
  if (changePercent > 0) return "bg-green-100 text-green-700";
  if (changePercent < 0) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

type SummaryCardProps = {
  label: string;
  loading: boolean;
  metric?: Metric;
  format: (value: number) => string;
};

function SummaryCard({ label, loading, metric, format }: SummaryCardProps) {
  const showSkeleton = loading || !metric;

  return (
    <Card
      className="flex flex-col gap-3 p-6 shadow-lg"
      aria-busy={loading || undefined}
    >
      <p className="text-sm font-medium text-gray-600">{label}</p>

      {showSkeleton ? (
        <div className="flex flex-col gap-3" aria-label={`${label}を読み込み中`}>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold tabular-nums text-gray-900">
            {format(metric.value)}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={changeClassName(metric.changePercent)}>
              {formatChange(metric.changePercent)}
            </Badge>
            <span className="text-xs text-gray-500">前月比</span>
          </div>
        </>
      )}
    </Card>
  );
}

export function SalesSummaryCards({
  loading,
  revenue,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  const data: Record<MetricKey, Metric | undefined> = {
    revenue,
    newCustomers,
    churnRate,
  };

  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      {METRICS.map(({ key, label, format }) => (
        <SummaryCard
          key={key}
          label={label}
          loading={loading}
          metric={data[key]}
          format={format}
        />
      ))}
    </section>
  );
}

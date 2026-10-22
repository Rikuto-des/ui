"use client";

import { Badge, Card, Skeleton } from "@yourlib/react";

type Metric = {
  /** Current value */
  value: number;
  /** Month-over-month change (%), e.g. 12 → "+12%" */
  change: number;
};

export type SalesSummaryCardsProps = {
  loading?: boolean;
  revenue?: Metric;
  newCustomers?: Metric;
  churnRate?: Metric;
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

function formatChange(change: number) {
  const sign = change > 0 ? "+" : change < 0 ? "−" : "±";
  return `${sign}${percent.format(Math.abs(change))}%`;
}

function changeClassName(change: number) {
  if (change > 0) return "bg-green-100 text-green-800";
  if (change < 0) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
}

type StatCardProps = {
  title: string;
  value: string;
  change: number;
  loading: boolean;
};

function StatCard({ title, value, change, loading }: StatCardProps) {
  return (
    <Card
      className="flex flex-col gap-3 p-6 shadow-lg"
      aria-busy={loading}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>

      {loading ? (
        <div className="flex flex-col gap-3" aria-label={`${title}を読み込み中`}>
          <Skeleton className="h-9 w-32 rounded" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900">
            {value}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={changeClassName(change)}>
              {formatChange(change)}
            </Badge>
            <span className="text-xs text-gray-500">前月比</span>
          </div>
        </>
      )}
    </Card>
  );
}

export function SalesSummaryCards({
  loading = false,
  revenue = { value: 12_480_000, change: 12 },
  newCustomers = { value: 348, change: 8.5 },
  churnRate = { value: 2.4, change: -3 },
}: SalesSummaryCardsProps) {
  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <StatCard
        title="今月の売上"
        value={yen.format(revenue.value)}
        change={revenue.change}
        loading={loading}
      />
      <StatCard
        title="新規顧客数"
        value={`${count.format(newCustomers.value)}人`}
        change={newCustomers.change}
        loading={loading}
      />
      {/* Per the spec, increases are green and decreases are red (applies to churn rate too) */}
      <StatCard
        title="解約率"
        value={`${percent.format(churnRate.value)}%`}
        change={churnRate.change}
        loading={loading}
      />
    </section>
  );
}

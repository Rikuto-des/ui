"use client";

import { Badge, Card, Skeleton, Text } from "@yourlib/react";

export type SalesSummary = {
  /** 今月の売上（円） */
  monthlyRevenue: number;
  /** 今月の売上の前月比（%） */
  monthlyRevenueChange: number;
  /** 新規顧客数 */
  newCustomers: number;
  /** 新規顧客数の前月比（%） */
  newCustomersChange: number;
  /** 解約率（%） */
  churnRate: number;
  /** 解約率の前月比（%） */
  churnRateChange: number;
};

export type SalesSummaryCardsProps = {
  data?: SalesSummary;
  loading?: boolean;
};

type StatCardProps = {
  title: string;
  value?: string;
  change?: number;
  loading: boolean;
};

const formatChange = (change: number): string => {
  const rounded = Math.round(change * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
  return `${sign}${Math.abs(rounded)}%`;
};

const changeClassName = (change: number): string => {
  if (change > 0) return "bg-green-100 text-green-700";
  if (change < 0) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

function StatCard({ title, value, change, loading }: StatCardProps) {
  const isLoading = loading || value === undefined || change === undefined;

  return (
    <Card
      className="flex flex-col gap-3 p-6 shadow-lg"
      aria-busy={isLoading}
      aria-label={title}
    >
      <Text className="text-sm font-medium text-gray-500">{title}</Text>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      ) : (
        <>
          <Text className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
            {value}
          </Text>
          <div className="flex items-center gap-2">
            <Badge className={`tabular-nums ${changeClassName(change)}`}>
              {formatChange(change)}
            </Badge>
            <Text className="text-xs text-gray-500">前月比</Text>
          </div>
        </>
      )}
    </Card>
  );
}

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const count = new Intl.NumberFormat("ja-JP");

export function SalesSummaryCards({ data, loading = false }: SalesSummaryCardsProps) {
  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <StatCard
        title="今月の売上"
        loading={loading}
        value={data ? yen.format(data.monthlyRevenue) : undefined}
        change={data?.monthlyRevenueChange}
      />
      <StatCard
        title="新規顧客数"
        loading={loading}
        value={data ? `${count.format(data.newCustomers)}人` : undefined}
        change={data?.newCustomersChange}
      />
      <StatCard
        title="解約率"
        loading={loading}
        value={data ? `${data.churnRate.toFixed(1)}%` : undefined}
        change={data?.churnRateChange}
      />
    </section>
  );
}

"use client";

import { Card, Skeleton } from "@yourlib/react";

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

// 増加は緑、減少は赤、変化なしは控えめな文字色。色はパックのトークンで指定する。
const changeColor = (change: number): string => {
  if (change > 0) return "var(--yl-color-success)";
  if (change < 0) return "var(--yl-color-danger)";
  return "var(--yl-color-text-muted)";
};

function StatCard({ title, value, change, loading }: StatCardProps) {
  const isLoading = loading || value === undefined || change === undefined;

  return (
    // 影を強めるには Card の見た目を className で変えられないため、
    // パックが提供するバリアント（例: 強めの elevation）が確認できしだい、ここで指定してください。
    <Card className="h-full" aria-busy={isLoading} aria-label={title}>
      <div className="flex flex-col gap-3 p-6">
        <h2
          className="text-sm font-medium"
          style={{ color: "var(--yl-color-text-muted)" }}
        >
          {title}
        </h2>

        {isLoading ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        ) : (
          <>
            <p
              className="text-3xl font-bold tracking-tight tabular-nums"
              style={{ color: "var(--yl-color-text)" }}
            >
              {value}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: changeColor(change) }}
              >
                {formatChange(change)}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--yl-color-text-muted)" }}
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

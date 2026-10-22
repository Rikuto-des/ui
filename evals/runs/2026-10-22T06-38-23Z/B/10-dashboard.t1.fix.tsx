"use client";

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
  value?: string;
  change?: number;
  loading: boolean;
};

const formatChange = (change: number): string => {
  const rounded = Math.round(change * 10) / 10;
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `${rounded}%`;
  return "±0%";
};

// 指定どおり「増えていれば緑、減っていれば赤」。変化なしは中立色。
// TODO: このパレット色は Badge を className で上書きしており、yourlib の方針
// （見た目はトークンかバリアントで表す）に沿っていません。lint では検出されませんでしたが、
// 緑・赤に当たる --yl-color-* トークンか Badge のバリアント名を確認して置き換えてください。
const changeClassName = (change: number): string => {
  if (change > 0) return "bg-green-100 text-green-700";
  if (change < 0) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

function MetricCard({ title, value, change, loading }: MetricCardProps) {
  const showSkeleton = loading || value === undefined || change === undefined;

  return (
    // TODO: 「影を少し強めに」は className（shadow-lg）では指定できません。
    // 影を強めるパックのトークンかバリアントを確認して指定してください。
    <Card title={title} aria-busy={showSkeleton}>
      {showSkeleton ? (
        <div className="flex flex-col gap-3" aria-label={`${title}を読み込み中`}>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--yl-color-text)" }}
          >
            {value}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={changeClassName(change)}>{formatChange(change)}</Badge>
            <span className="text-xs" style={{ color: "var(--yl-color-text-subtle)" }}>
              前月比
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat("ja-JP");

export function SalesSummaryCards({ loading, data }: SalesSummaryCardsProps) {
  return (
    <section aria-label="売上サマリー" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="今月の売上"
        loading={loading}
        value={data ? yenFormatter.format(data.monthlyRevenue) : undefined}
        change={data?.monthlyRevenueChange}
      />
      <MetricCard
        title="新規顧客数"
        loading={loading}
        value={data ? `${countFormatter.format(data.newCustomers)}人` : undefined}
        change={data?.newCustomersChange}
      />
      <MetricCard
        title="解約率"
        loading={loading}
        value={data ? `${data.churnRate.toFixed(1)}%` : undefined}
        change={data?.churnRateChange}
      />
    </section>
  );
}

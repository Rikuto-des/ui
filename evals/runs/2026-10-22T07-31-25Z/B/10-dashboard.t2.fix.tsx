"use client";

import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * Note: <Card> can't take a stronger shadow. Its only visual option is padding,
 * and the pack sets the shadow. A stronger shadow needs a new variant or pack.
 *
 * Note: Badge's color props aren't confirmed, so the month-over-month label
 * uses a <span> with color tokens instead.
 * --yl-color-success / --yl-color-danger are assumed token names.
 */

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

function changeColor(change: number) {
  if (change > 0) return "var(--yl-color-success)";
  if (change < 0) return "var(--yl-color-danger)";
  return "var(--yl-color-text-muted)";
}

type StatCardProps = {
  title: string;
  value: string;
  change: number;
  loading: boolean;
};

function StatCard({ title, value, change, loading }: StatCardProps) {
  return (
    <Card padding="lg" aria-busy={loading}>
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
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        ) : (
          <>
            <p
              className="text-3xl font-bold tabular-nums tracking-tight"
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
      {/* As specified, increases are green and decreases are red, including churn rate */}
      <StatCard
        title="解約率"
        value={`${percent.format(churnRate.value)}%`}
        change={churnRate.change}
        loading={loading}
      />
    </section>
  );
}

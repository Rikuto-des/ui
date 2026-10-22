"use client";

import { Badge, Card, Skeleton } from "@yourlib/react";

export type SummaryMetric = {
  /** 表示用に整形済みの値（例: "¥12,345,000"、"128 人"、"2.4%"） */
  value: string;
  /** 前月比（パーセント値。例: 12 は +12%、-3.5 は -3.5%） */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  /** true のあいだは数値の代わりにスケルトンを表示する */
  loading: boolean;
  monthlySales?: SummaryMetric;
  newCustomers?: SummaryMetric;
  churnRate?: SummaryMetric;
};

type CardDefinition = {
  key: "monthlySales" | "newCustomers" | "churnRate";
  title: string;
};

const CARD_DEFINITIONS: CardDefinition[] = [
  { key: "monthlySales", title: "今月の売上" },
  { key: "newCustomers", title: "新規顧客数" },
  { key: "churnRate", title: "解約率" },
];

function formatChange(changePercent: number): string {
  const rounded = Math.round(changePercent * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

function ChangeBadge({ changePercent }: { changePercent: number }) {
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;

  const variant = isUp ? "success" : isDown ? "danger" : "neutral";
  const description = isUp ? "増加" : isDown ? "減少" : "変化なし";

  return (
    <Badge
      variant={variant}
      aria-label={`前月比 ${formatChange(changePercent)}（${description}）`}
    >
      {formatChange(changePercent)}
    </Badge>
  );
}

function SummaryCard({
  title,
  metric,
  loading,
}: {
  title: string;
  metric?: SummaryMetric;
  loading: boolean;
}) {
  return (
    <Card variant="elevated" aria-busy={loading}>
      <div className="flex flex-col gap-3 p-6">
        <p className="text-sm font-medium text-[var(--yl-color-text-secondary)]">
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
        ) : metric ? (
          <>
            <p className="text-3xl font-bold tracking-tight text-[var(--yl-color-text-primary)]">
              {metric.value}
            </p>
            <div className="flex items-center gap-2">
              <ChangeBadge changePercent={metric.changePercent} />
              <span className="text-xs text-[var(--yl-color-text-secondary)]">
                前月比
              </span>
            </div>
          </>
        ) : (
          <p className="text-3xl font-bold tracking-tight text-[var(--yl-color-text-disabled)]">
            —
          </p>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading,
  monthlySales,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  const metrics: Record<CardDefinition["key"], SummaryMetric | undefined> = {
    monthlySales,
    newCustomers,
    churnRate,
  };

  return (
    <section
      aria-label="売上サマリー"
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      {CARD_DEFINITIONS.map(({ key, title }) => (
        <SummaryCard
          key={key}
          title={title}
          metric={metrics[key]}
          loading={loading}
        />
      ))}
    </section>
  );
}

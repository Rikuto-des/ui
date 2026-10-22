import { Badge, Card, Skeleton } from "@yourlib/react";

/*
 * 売上ダッシュボード上段の指標カード（今月の売上・新規顧客数・解約率）
 *
 * 実装時のメモ:
 * - 「カードの影を少し強めに」は未対応です。yourlib ではカードの影はパック
 *   （--yl-shadow-panel）が決め、className や style で上書きできません。
 *   Card に強調用の variant（例: elevation="raised"）を追加して全パックに
 *   定義するか、パック側で --yl-shadow-panel を調整するかを決めてください。
 *   決まればここに反映します。
 * - 前月比は指定どおり「増加 = 緑 / 減少 = 赤」です。ただし解約率は増えると
 *   悪化を意味するため、解約率だけ色を逆にするか確認してください
 *   （invertTone を true にすると逆になります）。
 * - 色だけに頼らないよう、ラベルに符号（+ / -）と「前月比」の文字を入れています。
 */

export type MetricValue = {
  /** 今月の値 */
  value: number;
  /** 前月比（%）。例: 12 → +12%、-3.5 → -3.5% */
  changePercent: number;
};

export type SalesSummaryCardsProps = {
  loading: boolean;
  /** 今月の売上（円） */
  sales?: MetricValue;
  /** 新規顧客数（人） */
  newCustomers?: MetricValue;
  /** 解約率（%） */
  churnRate?: MetricValue;
};

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const count = new Intl.NumberFormat("ja-JP");
const percent = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const changeFormat = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function formatChange(changePercent: number): string {
  if (changePercent === 0) return "±0%";
  const sign = changePercent > 0 ? "+" : "-";
  return `${sign}${changeFormat.format(Math.abs(changePercent))}%`;
}

function changeTone(
  changePercent: number,
  invertTone: boolean,
): "ok" | "danger" | "neutral" {
  if (changePercent === 0) return "neutral";
  const isUp = changePercent > 0;
  const isGood = invertTone ? !isUp : isUp;
  return isGood ? "ok" : "danger";
}

type MetricCardProps = {
  title: string;
  loading: boolean;
  metric?: MetricValue;
  format: (value: number) => string;
  unit?: string;
  invertTone?: boolean;
};

function MetricCard({
  title,
  loading,
  metric,
  format,
  unit,
  invertTone = false,
}: MetricCardProps) {
  const isLoading = loading || metric === undefined;

  return (
    <Card title={title} headingLevel="h2" padding="md">
      <div aria-busy={isLoading ? "true" : undefined} className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <div className="flex h-10 items-center">
              <Skeleton shape="text" className="w-40" />
            </div>
            <div className="flex h-6 items-center">
              <Skeleton shape="text" className="w-24" />
            </div>
          </>
        ) : (
          <>
            <p
              className="flex items-baseline gap-1 text-4xl font-bold leading-tight"
              style={{
                color: "var(--yl-color-text)",
                fontVariantNumeric: "var(--yl-font-numeric)",
              }}
            >
              {format(metric.value)}
              {unit ? (
                <span
                  className="text-base font-normal"
                  style={{ color: "var(--yl-color-text-muted)" }}
                >
                  {unit}
                </span>
              ) : null}
            </p>
            <p className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: "var(--yl-color-text-muted)" }}
              >
                前月比
              </span>
              <Badge tone={changeTone(metric.changePercent, invertTone)}>
                {formatChange(metric.changePercent)}
              </Badge>
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

export function SalesSummaryCards({
  loading,
  sales,
  newCustomers,
  churnRate,
}: SalesSummaryCardsProps) {
  return (
    <section aria-label="今月の主要指標" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="今月の売上"
        loading={loading}
        metric={sales}
        format={(v) => yen.format(v)}
      />
      <MetricCard
        title="新規顧客数"
        loading={loading}
        metric={newCustomers}
        format={(v) => count.format(v)}
        unit="人"
      />
      <MetricCard
        title="解約率"
        loading={loading}
        metric={churnRate}
        format={(v) => `${percent.format(v)}%`}
      />
    </section>
  );
}

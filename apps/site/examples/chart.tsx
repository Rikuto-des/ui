"use client";
import { useState } from "react";
import { Chart, ToggleGroup } from "@urushi/react";
const labels = ["6月", "7月", "8月", "9月", "10月", "11月"];
const data = {
  sales: { title: "月ごとの売上（万円）", unit: "万円", series: [{ name: "今年", values: [42, 51, 47, 63, 71, 78] }, { name: "去年", values: [38, 40, 45, 49, 52, 58] }] },
  visits: { title: "月ごとの訪問者（千人）", unit: "千人", series: [{ name: "今年", values: [12.4, 14.1, 13.2, 17.8, 19.5, 21.0] }, { name: "去年", values: [10.2, 11.0, 11.8, 12.1, 13.4, 14.0] }] },
};
export default function ChartExample() {
  const [metric, setMetric] = useState<keyof typeof data>("sales");
  const current = data[metric];
  const growth = Math.round((current.series[0].values.at(-1)! / current.series[1].values.at(-1)! - 1) * 100);
  return (
    <div className="interaction-study">
      <header>
        <h3>今年と去年を比べる</h3>
      </header>
      <ToggleGroup legend="表示する数字" name="chart-metric" type="single" size="sm" defaultValue="sales" onChange={(e) => setMetric((e.nativeEvent.target as HTMLInputElement).value as keyof typeof data)}>
        <ToggleGroup.Item value="sales">売上</ToggleGroup.Item>
        <ToggleGroup.Item value="visits">訪問者</ToggleGroup.Item>
      </ToggleGroup>
      <Chart key={metric} type={metric === "sales" ? "bar" : "line"} title={current.title} unit={current.unit} labels={labels} series={current.series} />
      <p className="study-caption" role="status">
        11月は去年より {growth}% 多い。
      </p>
    </div>
  );
}

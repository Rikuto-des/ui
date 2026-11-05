// Installed by `urushi add pricing-01`. Three plans side by side, the recommended one marked in words as well as by its look.
import { Badge, Button, Card } from "@urushi/react";
import { CheckIcon } from "@urushi/react/icons";
import "./pricing-01.css";

const plans = [
  { name: "フリー", price: "¥0", unit: "ずっと無料", features: ["プロジェクト 3 件", "メンバー 2 人", "ファイル 1 GB"], action: "無料で始める", recommended: false },
  { name: "チーム", price: "¥1,200", unit: "1 人あたり／月", features: ["プロジェクト無制限", "メンバー 50 人", "ファイル 100 GB", "権限の設定"], action: "14 日間試す", recommended: true },
  { name: "エンタープライズ", price: "お見積もり", unit: "年間契約", features: ["メンバー無制限", "シングルサインオン", "操作ログの保存", "専任の窓口"], action: "相談する", recommended: false },
];

export default function Pricing01() {
  return (
    <main className="b-pricing">
      <header className="b-pricing-head">
        <h1>料金プラン</h1>
        <p>どのプランも、いつでも変更・解約できます。表示は税込みです。</p>
      </header>
      <ul className="b-pricing-plans">
        {plans.map((plan) => (
          <li key={plan.name}>
            <Card
              title={plan.name}
              headingLevel="h2"
              padding="lg"
              selected={plan.recommended}
              description={plan.recommended ? <Badge tone="accent">おすすめ</Badge> : undefined}
              footer={
                <Button variant={plan.recommended ? "primary" : "secondary"} size="lg" aria-label={`${plan.action}（${plan.name}）`}>
                  {plan.action}
                </Button>
              }
            >
              <p className="b-pricing-price">
                {plan.price}
                <span>{plan.unit}</span>
              </p>
              <ul className="b-pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckIcon size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}

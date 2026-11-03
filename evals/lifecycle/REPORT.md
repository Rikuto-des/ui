# CSS・依存更新・Navigation Menuの結果

2026年10月27日。対象は前回AIが生成した3課題×2試行です。

| ライブラリ | 更新前 | 更新後 | 更新で増えた失敗 | JS＋CSS・React込み・gzip KiB |
| --- | --- | --- | --- | --- |
| Urushi | 6/6 | 6/6 | 0 | 85.7–86.1 |
| Base UI | 4/6 | 4/6 | 0 | 92.3–139.1 |
| Radix UI | 6/6 | 6/6 | 0 | 89.1–110.9 |
| shadcn/ui | 6/6 | 6/6 | 0 | 101.0–122.3 |

UrushiのサイズはNavigation MenuとSafariのフォーカス補助を含む現在の実装です。部品＋パックCSSは11.2 KiBから2.8–3.0 KiBへ、約73〜75%減りました。今回の6画面ではReact・共通CSS込みでも最小でした。

依存更新では全ライブラリが既存の合格を維持しました。Urushiだけの優位性は出ていません。Base UIの2件は更新前から同じキーボード条件で不合格です。

Navigation Menuは入れ子・キーボード・RTL・狭い画面・JavaScriptなしの基本操作に対応しました。実画面で見つけたアクセシビリティツリーの問題と、SafariのDialogフォーカス復帰も修正しています。Navigation Menuの競合AI生成比較は未実施です。

[条件・修正履歴・検証範囲・再実行方法](README.md) · [集計JSON](../../generated/lifecycle-summary.json) · [保存した証拠のハッシュ](evidence-manifest.json)

# 調査資料（2026-10-22）

shadcn/ui のような新しい UI ライブラリを設計するための市場・技術調査。

| ファイル | 内容 |
|---|---|
| [00-summary.md](00-summary.md) | **まとめ**: 全体の地図、空白地帯、避けるべきこと、設計の方向性（3 案と推奨）、技術選定 |
| [01-shadcn-ui.md](01-shadcn-ui.md) | shadcn/ui 本体の 2024〜2026 年の変化と弱点 |
| [02-headless-primitives.md](02-headless-primitives.md) | 見た目を持たない土台層（Radix / Base UI / React Aria / Ark など）の比較とバンドルサイズ実測 |
| [03-ecosystem.md](03-ecosystem.md) | 派生コンポーネント集、テーマツール、大手のデザインシステム、収益モデル |
| [04-styling-platform.md](04-styling-platform.md) | Tailwind とその代替、デザイントークン、ブラウザ新機能の対応表、見た目のトレンド |
| [05-ai-native.md](05-ai-native.md) | AI が UI ライブラリを「使う」側、AI 製品向け UI 部品、AI が UI を生成する仕組み（Generative UI）のプロトコル |
| [06-multi-framework-mobile.md](06-multi-framework-mobile.md) | Vue / Svelte / Angular 版、Web Components、React Native、各フレームワーク本体の変化 |
| [07-community.md](07-community.md) | State of JS / CSS / React の結果、HN と Zenn での不満、要望ランキング |
| [08-metrics.md](08-metrics.md) | npm（187 パッケージ）と GitHub（113 リポジトリ）の勢いの比較 |
| [data/](data/) | 08 の生データ（CSV / JSON） |

## 注意

- **Web 検索の上限**: 8 つの調査で Web 検索の上限（合計 200 回）に達した。その後は公式ページの直接取得と各種 API で補っている。
- **npm の欠損**: npm API は 2026-10-13〜15 のデータが欠けている。01、02、04、05、06 の「10/12〜18 の週」の数値は約 45% 少なく出ている（各ファイルの冒頭に注記あり）。正しい数値は 08 を見ること。
- **推測の扱い**: 【推測】と書いた箇所は、調査担当者の解釈であり、事実ではない。

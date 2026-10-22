# 02. ヘッドレス / プリミティブ層（2026-10-22 時点）

> **数値の注意（2026-10-22 追記）**: 本文の npm 週間 DL で「2026-10-12〜18」の週を使っている値は、npm API の欠損（10/13〜15 の 3 日間、全パッケージ 0）により **約 45% 少なく出ている**。正確な値は [08-metrics.md](08-metrics.md)（2026-09-28〜10-04 の週）を参照。例: shadcn CLI 745 万 → 実際は約 1,336 万、@base-ui/react 1,085 万 → 1,927 万、tailwindcss 8,470 万 → 1.63 億。同じ週どうしの比較（どちらが多いか）は有効だが、前年比は過小評価になっている（shadcn CLI は 17 倍ではなく約 40 倍）。

## 1. 要約

- **React の土台は「Radix 一強」から「Base UI が標準」に変わった。**
  - shadcn/ui は 2026-07 に既定の土台を Base UI に切り替え、同じ月に React Aria を 3 つ目の選択肢として加えた。
  - 統合パッケージの npm 週間 DL は Base UI 1,085 万、radix-ui 1,067 万でほぼ並んだ（2026/10/12〜18）。
- **Radix は止まっていたが、また動き出した。**
  - 2025-08〜2026-06 の約 10 か月はリリースがなかった。6 月以降は 1.6→1.8.1 と頻繁に出ている。
  - ただし直近 90 日の人間によるコミットは約 100 件中 95 件が chaance（Chance Strickland）1 人で、特定の個人に依存している。
- **合成 API は `render` prop に収束しつつある。** 採用しているのは Base UI、Ariakit（最初に採用）、React Aria（1.15 で DOM 差し替え用に追加）、Ark v6 next（`asChild` を非推奨化）、shadcn 自身の `@shadcn/react`。
- **a11y と i18n では React Aria が一段上。**
  - 文字列を組み込んだロケールが 37、暦法（和暦など）に対応、ネイティブスクロールで動く新しい Sheet がある。
  - 一方、`client-only` を import しているため、RSC では自前の client ラッパーが必要になる。
- **ネイティブ機能（popover / `<dialog>` / anchor positioning）への置き換えは、主要ライブラリではまだ進んでいない。** 確認できた採用例は、Melt の次世代版の popover 属性と、React Aria Sheet のスクロール系 CSS だけ。
- **単機能のライブラリは入れ替わりが進んでいる。**
  - vaul は作者が README で unmaintained と明言している。cmdk も更新が止まっている。
  - shadcn の Base UI 版では、Drawer がすでに Base UI 製に置き換わった。
- **2026 年の新顔は `@shadcn/react`。** AI チャット向けのヘッドレス部品（MessageScroller、Questionnaire）で、週約 210 万 DL。これ以外に、土台として有力な新しいライブラリは見当たらない。

## 2. 主要ライブラリの現状

### Radix（WorkOS 傘下、`radix-ui` 1.8.1、2026-10-14）

- **2026 年の変更**
  - 6 月: 合成用の unstable パーツ（Provider / Trigger / BubbleInput）
  - 7 月: プリミティブごとのサブパス import（`radix-ui/accordion`）、tree-shaking の改善
  - 7〜10 月: Popover.Title / Description、ScrollArea.Content の追加、RSC 互換の修正
- **合成 API**: `render` prop は確認できず、`asChild` のまま。
- **健全性**
  - open issue 124 件（うち 2024 年以前のものが 76 件）、open PR 116 件
  - 直近 90 日に close された issue は 105 件
- **ネイティブ機能への姿勢**: 「Popover API へ移行してほしい」という issue #2941 は、2026-06-08 に not planned で close された。
- **AI 対応**: リポジトリに AGENTS.md と context7.json が追加されている。

### Base UI（`@base-ui/react` 1.9.0、2026-10-09）

- **バージョン**
  - 2025-12-11 に v1.0 の安定版。パッケージ名が `@base-ui-components/react` から `@base-ui/react` に変わった（旧名は deprecated）。
  - 以降は毎月 minor を出している。
  - 追加の経緯: 1.2 で Drawer（1.3 で安定版）、1.4 で OTPField（1.6 で安定版）、1.8 で `createItems`、1.9 でメニューのフィルタリング（preview）。
- **規模**: 37 部品（npm パッケージに同梱された docs で確認）。
- **API**
  - `render` に要素か `(props, state)` を受け取る関数を渡す。補助として `useRender` / `mergeProps` がある。
  - React 17 以上。
- **内部構成**
  - Floating UI を内部にフォークして持っている（`floating-ui-react`）。
  - 日付処理の内部実装 `internals/temporal` と、任意の peer dependency としての date-fns がすでに入っている。日付系の部品を準備中と推測される。
- **AI 対応**: npm パッケージにドキュメントの Markdown を同梱している。
- **体制**
  - 「Radix・Material UI・Floating UI の作者陣」と名乗っている。
  - MUI のチームが複数人で開発している（直近 90 日のコミット: atomiks 56、michaldudak 31 など）。

### React Aria Components（Adobe、Apache-2.0、1.22.1）

- **リリース**: 毎月。2025-12 に新しいドキュメントと Spectrum 2 の安定版を出した。
- **主な追加**
  - 1.15: DOM 差し替え用の `render` prop、Agent Skills
  - 1.16: 複数選択の ComboBox
  - 1.18: Calendar の複数選択
  - 1.20: PreviewTrigger、TokenField（alpha、AI のプロンプト入力欄向け）、右クリックメニュー
  - 1.21: NavigationTree
  - 1.22: Sheet
- **shadcn での扱い**: 2026-07 に 3 つ目の土台として正式対応された。

### Ark UI / Zag.js（Chakra チーム）

- **構成**: Zag は 51 種類のステートマシンを持ち、React / Vue / Solid / Svelte に対応している。
- **6.0.0-next.0（2026-10-06）の変更**
  - `asChild` を非推奨にし、`render` を推奨。
  - data 属性を `data-scope` + `data-part` から `data-popover-trigger` 形式へ変更（破壊的変更）。
  - Zag v2 への移行、Virtualizer の追加。
  - a11y の修正（Accordion の見出し、空状態の読み上げ）。
- **5.38**: 閉じた内容の隠し方として、React 19 の `<Activity>` を選べるようになった。
- **利用の減少**: React 版の週間 DL は 165 万（2025-10）から 54 万に減った。

### Headless UI（Tailwind Labs）

- 最終リリースは 2.2.10（2026-04-07）。直近 90 日のコミットも、close された issue も 0 件。
- Tailwind Labs は 2026-01 にエンジニア 4 人中 3 人を解雇した。
- **新しく採用する土台としては不適。**

### Ariakit

- 0.4.42 で、まだ 1.0 前。
- Diego Haz がほぼ 1 人で開発しているが、活動量は非常に多い（直近 90 日のコミット 171 件）。
- `render` prop を最初に採用したライブラリ。Solid 版（0.2）もある。
- 2026-05 に `@ariakit/components` を公開した。リポジトリ内では、まだ非公開のスタイル付き「Ariakit UI」を開発中。

### Floating UI

- 直近 90 日のコミットは 8 件で、大半はスポンサー表示の更新。
- 実質的な開発は Base UI 側に移っているとみられる。

### React 以外のフレームワーク

- **Vue — Reka UI 2.11.0**
  - 約 65 部品。日付、Color、TagGroup、Drawer などもある。
  - Nuxt UI と shadcn-vue の土台になっている。
- **Svelte — Bits UI 2.20.0**
  - 約 41 部品。Command を内蔵している。
  - Melt は、旧版の `@melt-ui/svelte` が 2025-03 で止まり、次世代版の `melt` 0.44（週約 6 千 DL）に移っている。
- **Solid — Kobalte 0.13.14 / 2.0.0-alpha.4（Solid 2 対応）**
  - corvu は動きが少ない。

## 3. 比較表

| ライブラリ | 合成 API / スタイル用のフック | a11y・i18n | RSC | 対応 FW | 部品数 | 最新版 | 体制・資金 | ライセンス |
|---|---|---|---|---|---|---|---|---|
| Radix | compound、`asChild`（Slot）、`data-state` | WAI-ARIA。Combobox と日付系がない | `'use client'` あり | React | 約 32 | 10/14 | WorkOS。実質 1 人 | MIT |
| Base UI | compound、`render`（要素 / 関数）、`data-open`・`data-starting-style`・CSS 変数 | APG 重視、RTL 対応。文字列は利用者が用意 | `'use client'` あり | React 17+ | 37 | 10/09 | MUI。複数人がフルタイム | MIT |
| React Aria | slots / context、className の render props、`data-pressed` など、`render` | 最上位（37 ロケール、暦法、仮想キーボード対応） | `client-only` のため client ラッパー必須 | React（hooks 層あり） | 50+ | 10/09 | Adobe | Apache-2.0 |
| Ark/Zag | compound、`asChild`→`render`（v6）、data 属性を刷新 | 良好。ステートマシンで一貫している | `'use client'` あり | React・Vue・Solid・Svelte | 約 50 | 10/06 | Chakra（Segun Adebayo 中心） | MIT |
| Headless UI | `as` と render props、`data-open` | 良好だが部品が少ない | あり | React・Vue | 約 18 | 4/07 | 縮小中 | MIT |
| Ariakit | store、`render` | 非常に強い | あり | React・Solid | 約 25 | 10/14 | 個人 | MIT |
| Reka / Bits / Kobalte | `asChild` / `child` snippet / `as` | Radix 系 | – | Vue / Svelte / Solid | 65 / 41 / 50 | 10/05・10/20・10/20 | 少人数 | MIT |

### バンドルサイズ（esbuild で実測、minify + gzip、React は含まない）

| ライブラリ | Popover のみ | Dialog のみ | 6 部品 |
|---|---|---|---|
| Radix | 24.8KB | 14.3KB | 44.3KB |
| Ark | 31.2KB | 20.5KB | 59.8KB |
| React Aria | 32.0KB | 28.6KB | 67.6KB |
| Base UI | 41.2KB | 23.9KB | 87.4KB |
| Headless UI | 30.3KB | 16.8KB | – |
| Ariakit | 30.4KB | 21.3KB | – |

- 6 部品は Dialog / Popover / Menu / Select / Tabs / Tooltip。
- React Aria の数値には、各ロケールの文字列が含まれる。`@react-aria/optimize-locales-plugin` を使えば削れる（1.22 で Turbopack にも対応）。
- Base UI は機能が多いぶん最も重い。

## 4. 単機能ライブラリ（週間 DL は 10/12〜18）

| パッケージ | 状態 |
|---|---|
| cmdk | 1.1.1（2025-03）で止まっている。直近 90 日に close された issue は 0 件。DL 2,538 万。shadcn の Base 版と Radix 版の Command はまだこれを使っている。Aria 版は React Aria Components に置き換え済み |
| vaul | README で「unmaintained」と明言（2025-10）。DL 2,054 万。shadcn の Base 版と Aria 版の Drawer は `@base-ui/react/drawer` に置き換え済み。Radix 版はまだ vaul |
| sonner | 2.0.8（2026-08）。更新は年 1 回程度だが保守されている。DL 3,003 万。shadcn は全土台でまだ使っている。Base 版には Base UI の Toast も追加された |
| react-day-picker | v10（2026-05、新しいパッケージ名は `@daypicker/react`）。DL 2,538 万 |
| downshift | 9.4.0（2026-06）。成熟して安定している |
| TanStack | Table v9 が安定版（2026-08-04。機能単位で tree-shake でき、小さい表なら約 6〜7KB）。Virtual は活発。Form は 1.33 で、v2 が alpha |
| フォーム | react-hook-form 7.90 / v8 beta.4（DL 3,217 万）。Conform 1.21.2（プログレッシブエンハンスメント対応、DL 16 万） |

## 5. ネイティブ Web 機能への向き合い方

| 機能 | ブラウザの状況 | ライブラリの姿勢 |
|---|---|---|
| popover 属性 / `<dialog>` / top layer | 全主要ブラウザで使える | Radix は移行を not planned にした（2026-06）。Base UI は「`<dialog>` を使う」issue #485 が 2022 年から open のまま。React Aria は 2026-02 に「汎用ライブラリでは `<dialog>` は使えない」と回答した（理由は後述の 5 点）。**popover 属性を採用しているのは Melt の次世代版だけ**（ポータル不要、配置は Floating UI） |
| CSS anchor positioning | Firefox 147（2026-01）で Baseline に入ったばかり | Base UI には「Positioner をやめてネイティブで配置したい」という #1663 が open のまま。Base UI のブラウザ方針は「最後のメジャーリリース時点で Baseline Widely Available になっているものだけ使う」なので、採用は次のメジャー以降になるとみられる。主要ライブラリのコードを検索しても、`anchor-name` と `showPopover` はどちらも 0 件 |
| customizable select / invoker commands | customizable select は Chrome と Safari 27 が対応、Firefox はフラグの裏。invoker commands は Baseline 2025 | プリミティブ層での採用は確認できない。shadcn は registry に `native-select` を用意している |
| その他 | – | React Aria の Sheet は、scroll-snap とスクロール連動アニメーションで動く（ジェスチャ用の JS が要らない）。Ark は React 19 の Activity を使っている |

React Aria が「汎用ライブラリでは `<dialog>` は使えない」とした理由は次の 5 点。

1. top layer に出る要素どうしの重なり順を、他の部品と合わせられない
2. 閉じるときのアニメーション
3. 背景のスクロールを止める処理
4. フォーカスを中に閉じ込める処理
5. aria-modal による副作用

## 6. 新ライブラリへの示唆

1. **React の土台は Base UI を第一候補にする。**
   - 理由: shadcn の既定であること、毎月リリースされていること、複数人で開発されていること、Combobox / Autocomplete / Drawer / OTP / Toast まで揃っていること。
   - 注意: バンドルは最も重い。部品ごとのサブパス import とサイズ計測を CI に組み込む。
2. **合成 API は `render` を正にする。** 業界の流れがそちらに向いている。`asChild` は移行用の互換層にとどめる。
3. **data 属性と CSS 変数は「公開 API」として固定し、ドキュメントに書く。**
   - Ark v6 では data 属性の名前変更が破壊的変更になった。
   - 土台を差し替えても名前が変わらない自前の属性層（例: `data-slot` + 状態属性）を持てば、土台を交換できる。
4. **Radix だけに依存しない。** 10 か月リリースが止まった前例があり、今も実質 1 人体制。既存ユーザー向けの互換用の土台にとどめる。
5. **最初から複数の土台に対応できる registry 設計にする。**
   - shadcn は Base UI / Radix / React Aria を `registry:base` で切り替えている。
   - a11y と i18n を売りにするなら、React Aria を 2 つ目の土台にする。その場合は `client-only` 対策として、`'use client'` を付けたラッパーを生成する。
6. **単機能ライブラリの依存を入れ替える。**
   - vaul → Base UI の Drawer か React Aria の Sheet
   - cmdk → Base UI の Autocomplete（1.9 のメニューフィルタも使える）か React Aria の Autocomplete
   - sonner、react-day-picker v10、TanStack Table v9 は使い続けてよい。
7. **自前で持つべき層は次の 4 つ。**
   - (a) スタイルの約束事（トークン、バリアント、属性）
   - (b) プリミティブがまだない新しい分野（AI チャットのスクロール、トークン入力、質問フロー）。shadcn ですら `@shadcn/react` を自作している。
   - (c) 移行用の codemod と AI 向けのスキル
   - (d) 機械が読めるドキュメント（Base UI の npm 同梱 Markdown、React Aria の MCP / Agent Skills を参考にする）
8. **ネイティブ機能には「差し替えられる抽象」と「使う側が選んで有効にする形」で備える。**
   - 配置（Positioner）は差し替え可能なインターフェースにしておき、将来 CSS anchor positioning に移れるようにする。
   - top layer 系（popover / `<dialog>`）は、主要ライブラリが見送っているので既定にはしない。
   - スクロール系の CSS で作るジェスチャ（Sheet 型）は、今すぐ取り入れる価値がある。
9. **マルチフレームワークを狙うなら、Zag のステートマシンをコアにする。** 各フレームワーク向けの Radix 系移植（Reka / Bits / Kobalte）は少人数で運営されていて、品質にばらつきがある。
10. **新しく作るなら React 19 以上に絞ってよい。**
    - 根拠: `@shadcn/react` は React 19 必須。Ark は Activity を採用。React Compiler 対応の修正も相次いでいる。
    - フォームは特定のフォームライブラリを抱え込まない。Field / Form のプリミティブと、各ライブラリ向けのアダプタで対応する。

**調査の制約**: WebSearch の上限に達したため、2026 年の新しいライブラリは GitHub 検索と公式サイトの取得だけで探した。小さな新興ライブラリ（hydrateless、base-gpui、dokuma、kumiki）はどれもスター 100 前後以下。

## 出典

- Radix
  - https://www.radix-ui.com/primitives/docs/overview/releases
  - https://github.com/radix-ui/primitives/blob/main/packages/react/radix-ui/CHANGELOG.md
  - https://github.com/radix-ui/primitives/issues/2941
- Base UI
  - https://base-ui.com/react/overview/releases
  - https://base-ui.com/react/overview/about
  - https://base-ui.com/react/handbook/composition
  - https://github.com/mui/base-ui/issues/485
  - https://github.com/mui/base-ui/issues/1663
- shadcn
  - https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
  - https://ui.shadcn.com/docs/changelog/2026-07-react-aria
  - https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/bases
  - https://www.npmjs.com/package/@shadcn/react
- React Aria
  - https://github.com/adobe/react-spectrum/releases
  - https://react-aria.adobe.com/blog/sheet
  - https://react-aria.adobe.com/customization
  - https://github.com/adobe/react-spectrum/discussions/9696
- Ark: https://github.com/chakra-ui/ark/releases
- Headless UI
  - https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/CHANGELOG.md
  - https://www.devclass.com/2026/01/08/tailwind-labs-lays-off-75-percent-of-its-engineers-thanks-to-brutal-impact-of-ai/
- Ariakit: https://ariakit.com/guide/composition
- Floating UI: https://floating-ui.com/docs/react
- React 以外のフレームワーク
  - https://github.com/unovue/reka-ui/releases
  - https://github.com/huntabyte/bits-ui/releases
  - https://github.com/kobaltedev/kobalte/releases
  - https://next.melt-ui.com/components/popover
- 単機能ライブラリ
  - https://github.com/emilkowalski/vaul
  - https://github.com/dip/cmdk
  - https://github.com/gpbl/react-day-picker/releases/tag/v10.0.0
  - https://tanstack.com/blog/announcing-tanstack-table-v9
  - https://github.com/edmundhung/conform/releases
- Web 標準
  - https://web.dev/blog/web-platform-01-2026
  - https://developer.mozilla.org/docs/Web/API/Invoker_Commands_API
  - https://caniuse.com/mdn-css_properties_appearance_base-select
- 数値: npm Downloads API（2026-10-12〜18）、GitHub API（2026-10-22）、esbuild による実測

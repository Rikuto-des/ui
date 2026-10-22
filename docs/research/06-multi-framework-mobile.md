# 06. React 以外・ネイティブ・Web Components・フレームワーク本体の動向（2026-10-22 時点）

> **数値の注意（2026-10-22 追記）**: 本文の npm 週間 DL で「2026-10-12〜18」の週を使っている値は、npm API の欠損（10/13〜15 の 3 日間、全パッケージ 0）により **約 45% 少なく出ている**。正確な値は [08-metrics.md](08-metrics.md)（2026-09-28〜10-04 の週）を参照。例: shadcn CLI 745 万 → 実際は約 1,336 万、@base-ui/react 1,085 万 → 1,927 万、tailwindcss 8,470 万 → 1.63 億。同じ週どうしの比較（どちらが多いか）は有効だが、前年比は過小評価になっている（shadcn CLI は 17 倍ではなく約 40 倍）。

> npm の数値は、2026-10-12〜18 の週と前年の同じ週を比べたもの。react 本体が前年の 2.49 倍に増えていて、全体の数字が膨らんでいる（CI や AI エージェントによるダウンロードと推測）。伸び率は「2.5 倍」を基準にして読むこと。GitHub のスター数は 2026-10-22 に `gh api` で取得した。

## 1. 要約

- **shadcn の他フレームワーク移植は「仕様は共有し、コードは各フレームワークで書き直す」形で定着した。**
  - Vue（shadcn-vue / Reka UI）、Svelte（shadcn-svelte / Bits UI）、Angular（Spartan 1.0）は、本家の新しい部品を数週間で追いかけている。
  - ただし規模は本家の 1〜2% ほど（週間 DL: shadcn 745 万、shadcn-svelte 12.4 万、shadcn-vue 6 万）。
  - 移植作業は AI への依存が目立つ。shadcn-vue は直近半年のコミットの約 3 割に Claude の共著表記がある。
- **1 つのコードを複数フレームワークに配る方式は、結果がまちまち。**
  - Zag/Ark はフレームワークごとのアダプタで挙動がずれる問題を抱えている。
  - Mitosis は普及しなかった。Material Web は保守のみ、Franken UI は廃止、shadcn-solid は停滞している。
- **Web Components の土台は 2026 年に大きく整った。**
  - React 19 が完全に対応した。Scoped Registry も Chrome 146 と Safari 26 に入った。
  - それでも React 利用者の主流にはなっていない。SSR、Tailwind との相性、shadow DOM の境界を越えた ARIA 参照が未解決のままだから。
- **React Native は「Tailwind の className＋shadcn 型の配布」に収束しつつある**（NativeWind / Uniwind / React Native Reusables / HeroUI Native）。
  - 「Web とネイティブを 1 つの実装で」という方向は後退した。gluestack v5 は Next.js 対応を非推奨にし、Expo UI は SwiftUI / Jetpack Compose を直接使う道を選んだ。
- **React 19.3（2026-09）で ViewTransition と Fragment Refs が安定版になった。**
  - React Compiler 1.0 は、Expo / Vite / Next の新規プロジェクトのテンプレートに入っている。
  - 一方 RSC は、React Router v8 でも unstable のまま。TanStack は自社サイトから RSC を外した。
- **他のフレームワークも大きな版を一斉に準備している。**
  - Vue 3.6 Vapor（RC）、Solid 2.0（RC）、SvelteKit 3、Angular 22（Angular Aria が安定版に）、htmx 4。
  - どれも「VNode や children の中身を覗き見る実装」と相性が悪い方向に進んでいる。

## A-1. shadcn の他フレームワーク移植と、フレームワーク非依存の試み

| 名前 | 対象 | 土台 | ★ | 週間 DL（今年 / 前年） | 直近の節目 | 状態 |
|---|---|---|---|---|---|---|
| shadcn/ui（参考） | React | Radix / Base UI | 126.1k | 745 万 / 43 万（17 倍） | — | 基準 |
| shadcn-vue | Vue | Reka UI（123 万、3.2 倍） | 10.7k | 6.0 万 / 2.4 万 | v2.8.2（2026-08） | 活発。questionnaire / marker / attachment を移植済み |
| shadcn-svelte | Svelte 5 | Bits UI（78 万、3.1 倍） | 9.2k | 12.4 万 / 0.7 万 | 1.7.0（2026-09）、`@shadcn-svelte/primitives`（2026-10） | 活発。registry を `sv` のアドオンとして提供 |
| Spartan | Angular | brain（独自のヘッドレス層） | 3.0k | brain 5.1 万 / 0.6 万 | **1.0（2026-06-24）**、MCP を同梱。現在 1.8 | 活発 |
| Zard UI | Angular | — | 1.2k | 0.2 万 | v1.1（2026-10） | 新興 |
| shadcn-solid | Solid | Kobalte 系 | 0.8k | — | 最終 0.7.7（2025-03） | 停滞 |
| Basecoat | HTML/CSS＋小さな JS | なし | 4.4k | 1.8 万 / 0.2 万（9 倍） | **1.0（2026-06-27）**、41 部品 | 安定版 |
| Franken UI | HTML（UIkit＋Lit） | — | 2.6k | 560 | 2026-06 に廃止を告知、「0build」へ移行 | 終了 |
| daisyUI | Tailwind プラグイン（CSS のみ） | — | 42.7k | 65.6 万 / 50.2 万（1.3 倍） | 5.7.x | 成熟。React 全体より伸びが遅い |
| shadcn_ui（Flutter） | Flutter | — | 2.8k | pub.dev 7.9 万 / 30 日、965 likes | 0.57.2（2026-10） | 1.0 前だが活発 |

- **Basecoat 1.0 の方針**
  - 「React / Radix / Base UI / `data-slot` の DOM をそのまま移植するものではない」と明言している。
  - shadcn の考え方を、意味を持つ HTML と `data-*` 属性に置き換えて作っている。
  - Nunjucks / Jinja のテンプレートを同梱している。
- **registry 仕様は React 専用ではない**
  - shadcn の registry 仕様には「React に限らない」と公式に書かれている。
  - Svelte 界隈でも registry で配るものが出てきた（Edra v3、CossUI-Svelte）。
- **【推測】**
  - AI のおかげで移植のコストが下がり、本家に追いつくまでの遅れが縮んでいる。
  - 一方で、担い手が 1 人に偏っている移植（Solid）は止まりやすい。

## A-2. Web Components 系

| 名前 | 後ろ盾 | ★ | 週間 DL（今年 / 前年） | 状態 |
|---|---|---|---|---|
| Web Awesome | Font Awesome | 1.4k | 17.5 万 / 0.4 万 | 3.0（2025-10-28）、現在 3.14。Free 版（MIT、約 66〜70 部品）と商用の Pro 版。Declarative Shadow DOM による SSR は 3.8 からあるが実験的 |
| Shoelace | — | 13.8k | 6.2 万 / 7.7 万（減） | 最終 2025-03。2026-05 にリポジトリがアーカイブされた |
| Lit | OpenJS Foundation（2025-10-14 に移管） | 21.9k | 397 万 / 350 万（1.13 倍） | 3.3.3。v4 は出ていない |
| Material Web | Google | 11.4k | 9.1 万 / 5.8 万 | **保守のみ**（新機能の予定なし） |
| Fluent UI WC | Microsoft | — | 3.9 万 / 2.7 万 | v3 正式版（2026-06-29） |
| Stencil | Ionic | 13.1k | 85 万 / 86 万 | 横ばい |

### React 界隈で普及しない理由

1. **React 18 以前の名残**: Web Awesome は今も React 18 以前向けのラッパーを配っている。React 19 なら、ラッパーなしで直接使える。
2. **SSR**: shadow DOM をサーバーで描画するには Declarative Shadow DOM が必要で、まだ実験的。Next.js や RSC の前提と噛み合わない。
3. **a11y**
   - ARIA の ID 参照は、shadow DOM の境界を越えられない。
   - 解決策の Reference Target は、Chrome では Intent to Ship（出荷予定の表明）の段階で、Interop 2026 の候補になっている。出荷済みかは未確認。
4. **型とイベント**: `event.target` のキャストや、`custom-elements-jsx.d.ts` の追加が必要になる。
5. **【推測】文化の違い**
   - shadow DOM で中身を閉じ込める作りは、Tailwind のユーティリティや「コードを自分で所有する」shadcn 流と正反対。
   - LLM が出力するコードは、React＋shadcn が圧倒的に多い。

### 2026 年に変わったこと

- Scoped Custom Element Registries が、Chrome 146（2026-03）と Safari 26 に入った。Firefox は 159（10-27）で入る予定。
- 結論:
  - 複数のフレームワークを使う企業のデザインシステムや、CMS・サーバーで HTML を作るサイトでは、現実的な選択肢になった。
  - React アプリの中心となる部品としては、2026 年も少数派のまま。

## A-3. マルチフレームワーク戦略の成功例と失敗例

| 方式 | 例 | 評価（根拠） |
|---|---|---|
| ステートマシンを共有し、フレームワークごとにアダプタを書く | Zag.js / Ark UI | **React 以外では成功、React 側では後退。** Skeleton（Svelte 版）は前年比 3.6 倍。一方 React 側は、React 全体が +149% のなかで `@chakra-ui/react` −62%、`@zag-js/react` −64%、`@ark-ui/react` −67%。Ark v6-next の変更履歴には、Toaster の `render` が「フレームワークごとに違う壊れ方をして、toast が黙って消えた」ため削除した、と書かれている |
| 1 つのコードから各フレームワーク向けに変換する | Mitosis | ★14.4k に対して週間 DL は 2,863。ほぼ Builder.io の自社 SDK でしか使われていない |
| 仕様だけ共有し、各フレームワークで書き直す | shadcn 移植群、Reka / Bits | **最も成功している**（Reka 123 万・Bits 78 万。どちらも約 3 倍） |
| CSS だけ共有する | daisyUI、Basecoat | サーバーで HTML を作る構成で効く（Basecoat は 9 倍） |
| ランタイムごと埋め込む | TanStack devtools（Solid＋Kobalte） | 小さなウィジェットなら成立する。ただしこの影響で、solid-js の DL は 4.9 倍、`@kobalte/core` は 33 倍に膨らんでいる |

## B. モバイル / ネイティブ

| 名前 | 種別 | ★ | 週間 DL（今年 / 前年） | 節目 |
|---|---|---|---|---|
| React Native Reusables | RN 版の shadcn（コピー配布） | 8.7k | `@rn-primitives/slot` 48 万 / 9 万 | CLI 0.7（2026-03）。NativeWind と Uniwind の両方に対応 |
| NativeWind | Tailwind を RN で使う | 8.1k | 123 万 / 38 万 | 安定版は 4.2.7。**v5 は RC（2026-09-13）**: Tailwind v4 ベース、RN 0.81 以上、New Architecture 専用 |
| Uniwind | Tailwind v4 を RN で使う | 1.7k | **64 万 / 0.1 万** | Unistyles のチームが開発、現在 1.13。Pro 版は有償で C++ エンジン |
| Tamagui | Web とネイティブ共通のスタイル＋UI | 14.3k | core 15 万 / 12 万 | **v3（2026-10-09）**: C++ のネイティブ側の仕組み、React Strict DOM との統合、Tailwind の書き方に対応 |
| gluestack-ui | コピー配布 | 5.3k | 8.3 万 / 1.3 万 | **v5（2026-06-25）で、Next.js 用と Web・ネイティブ共通のモノレポ用アダプタを非推奨にした** |
| HeroUI Native | スタイル付きライブラリ | 3.7k | 14.6 万 / 0.1 万 | v1.0（2026-03）、Uniwind ベース。Web 版とは別のリポジトリ |
| Expo UI | SwiftUI / Jetpack Compose のラッパー | — | **349 万 / 1.4 万** | SDK 56（2026-05-26）で安定版。create-expo-app の標準テンプレートに入った |
| React Strict DOM | Web の API をネイティブで動かす | 3.6k | 32 万 / 2.2 万 | 0.0.55。まだ experimental |
| react-native-web | — | 22.2k | 480 万 / 126 万 | 0.21.4（2026-10-08） |

- **State of React Native 2025**
  - コンポーネントライブラリの利用率: RN Paper 37%、Tamagui 17.4%、RNR 12.6%、gluestack 10.7%
  - スタイリング: NativeWind が 42.1%
  - 不満の中に「shadcn に当たるものがない」という声がある
- **Expo UI の位置づけ**
  - 公式に「UI コンポーネントライブラリでもデザインシステムでもない」と明言している。
  - OS 標準の見た目にしたい画面のためのもの。shadcn 系の Web デザインを使いたいなら、DOM components（Web の部品をそのまま埋め込む仕組み）を勧めている。
- **「Web とネイティブで同じコンポーネント」は 2026 年に現実的か**
  - 共有できるようになったもの: スタイルの書き方（Tailwind の className）、トークン、ヘッドレス API の形（rn-primitives は Radix と同じ形）。
  - 1 つの実装で両方を動かす方向は後退している。
  - 現実的な答えは **「同じ API・同じトークン・実装は別」**。

## C. フレームワーク本体の変化が UI ライブラリに与える影響

### React

- **19.2（2025-10）**: `<Activity>`、`useEffectEvent`
- **19.3（2026-09-09）**
  - `<ViewTransition>` と Fragment Refs が安定版になった。
  - Server Component から、`'use client'` のモジュールにある Context を、Provider なしで直接描画できるようになった。
  - SSR を避けるための `use(browser())` が入った。
  - 影響: フォーカス管理のためのラッパー `<div>`、RSC 用の Provider ラッパー、アニメーション用の依存ライブラリが要らなくなる。
- **React Compiler 1.0（2025-10-07）**
  - Expo / Vite / Next の新規テンプレートで標準になった。
  - 部品は手書きの memo をやめ、Compiler が前提とする書き方に合わせる必要がある。

### RSC

- Base UI 1.9.0 は、部品ごとのモジュールに `'use client'` を付けている（841 JS ファイル中 420）。
- React Router v8（2026-06-17）でも RSC は unstable のまま。
- TanStack は tanstack.com から RSC を外した。理由は、サーバーとクライアントの境界をまたいだ管理が複雑になるから。
- TanStack Start 1.0 の安定版は 2026-10-13。

### 勢力図（State of JS 2025）

- React は利用率 83.6%。一方で、不満の声が最も多いのも React。
- Next.js は利用率 59% だが、満足度では Astro に 39 ポイント差をつけられている。
- 選択肢にないものを書き込む欄では、TanStack Start が 1 位（235 件）。
- Solid は満足度で 5 年連続 1 位。関心が伸びたのは Solid と Preact だけ。

| フレームワーク | 2026-10 の状態 | UI ライブラリへの影響 |
|---|---|---|
| Svelte | 5.57 / SvelteKit 3.0.0 | remote functions はまだ実験的。registry で配る方式が広がっている |
| Vue | 3.5.44 が安定版、**3.6 は RC12（Vapor モード）** | 公式の注意: VNode に依存する機能は Vapor では動かない。VDOM 前提の部品ライブラリには不具合が残る。`slots.default()` を「試しに描画する」用途に使うのは安全ではない。asChild 型の実装や、イベント委譲＋`stopPropagation` は要注意 |
| Solid | 1.9 が安定版、**2.0 は RC16** | 非同期処理がリアクティブの仕組みに組み込まれた。Server Components に対応。エラー診断から AI エージェント向けの修正 skill に誘導する |
| Angular | **v22（2026-06）**: Signal Forms と **Angular Aria** が安定版、OnPush が既定に | 公式のヘッドレス部品（Angular Aria）と Spartan などが競合する |
| htmx / Datastar | htmx 4.0（2026-08-28）、Datastar 1.0 | 「React なしの shadcn」（Basecoat）が受け入れられる土壌になっている |

## 3. 新ライブラリへの示唆

### 主問: 最初は React に絞るべきか

**結論: 実装は React に絞る。ただし仕様は最初から他フレームワークに移植しやすい形にしておく。**

- **需要が React に集中している。** 利用率は 83.6% で、shadcn 本家と移植版の規模の差は 50〜100 倍ある。
- **仕様が移植しやすければ、移植は外部の人が勝手に作ってくれる。** Vue / Svelte / Angular / HTML / Flutter で実例がある。AI のおかげで移植のコストも下がっている。
- **自分で複数フレームワークを抱えた例は成績が悪い。** Zag/Ark はアダプタで挙動がずれ、Chakra は利用が減り、Mitosis / Material Web / Franken UI / shadcn-solid は止まった。
- **ネイティブを最初から狙う必要はない。** 1 つの実装で Web とネイティブを両立させる方向は後退している。

**例外**: 次の層を狙うなら、最初から別の形で作る意味がある（どちらも空白地帯）。

- Rails / Django / htmx の利用者 → CSS を中心にした形（Basecoat 型。9 倍の伸び）
- 複数フレームワークを使う企業 → Web Components（Fluent / Web Awesome 型）

### その他の示唆

1. **状態は `data-*` 属性と CSS 変数で外に出す**（Basecoat 1.0 と Ark v6 も同じ方向）。React・RSC・htmx のどれでも、同じ書き方でスタイルを当てられる。
2. **children や VNode の中身を覗き見る合成 API を避ける。** cloneElement 型の asChild や、slot を試しに描画する実装は、Vue Vapor や Solid 2 で壊れやすい。合成の仕組みは最小限にし、どのフレームワークでも表現できる形にする（Ark が `render` を削った教訓）。
3. **RSC を前提に作る。**
   - `'use client'` は部品ごとに付ける。
   - React 19.3 の「Context を直接描画する」機能を使い、Provider のラッパーは作らない。
   - Fragment Refs を使い、ラッパーの `<div>` をなくす。
4. **React Compiler を有効にした状態でテストする。** 手書きの memo はやめる。Compiler の前提に反する書き方（props を書き換えるなど）をなくす。
5. **アニメーションは ViewTransition＋CSS（@starting-style）を基本にする。** これらは DOM 専用なので、RN 版には別の方法を残しておく。
6. **トークンと className の語彙は、Uniwind / NativeWind でもそのまま使える範囲に収める。** そうすれば RN への移植（RNR 型）が安く済む。OS 標準の見た目は Expo UI に任せる（競合ではなく補完の関係）。
7. **AI 向けの配布を初日から用意する。** Spartan の MCP、shadcn-vue の skills、Solid の修正 skill、Angular の Agent Skills のように、llms.txt / skills / MCP はもう標準の装備になっている。
8. **トークンから「素の HTML＋CSS の層」を副産物として出す。** htmx 4 / Datastar / Rails の利用者に、低いコストで届けられる。
9. **Web Components はまだ中心に据えない。** Reference Target が全ブラウザに入るのを待つ。末端の部品を Web Components として書き出す選択肢は残しておく。
10. **成長は相対値で見る。** npm 全体が約 2.5 倍に膨らんでいるうえ、依存経由の水増しもある（Solid / Kobalte は TanStack devtools 経由）。

**検証しきれなかった点**（WebSearch の上限に達したため）:

- Reference Target が Chrome の何版で出荷されたか
- Datastar 1.0 の正式な発表日
- `@tanstack/react-start` の 69 倍、react-strict-dom の 14.7 倍という伸びの原因

## 出典

- **調査**
  - https://2025.stateofjs.com/en-US/libraries/front-end-frameworks/
  - https://2025.stateofjs.com/en-US/libraries/meta-frameworks/
  - https://www.infoq.com/news/2026/03/state-of-js-survey-2025
  - https://results.stateofreactnative.com/en-US/styling/
  - https://results.stateofreactnative.com/en-US/component-libraries/
- **他フレームワーク移植**
  - GitHub の各リリース: unovue/shadcn-vue、huntabyte/shadcn-svelte、spartan-ng/spartan v1.0.0、hunvreus/basecoat 1.0.0、chakra-ui/ark 6.0.0-next.0
  - https://basecoatui.com/introduction
  - https://0build.dev
  - https://ui.shadcn.com/docs/registry
  - https://svelte.dev/blog/whats-new-in-svelte-august-2026
  - https://pub.dev/packages/shadcn_ui
- **Web Components**
  - https://blog.fontawesome.com/how-does-web-awesome-stack-up-against-shoelace/
  - https://webawesome.com/docs/frameworks/react
  - https://github.com/material-components/material-web/discussions/5642
  - https://lit.dev/blog/
  - https://developer.chrome.com/blog/scoped-registries
  - https://htmhell.dev/adventcalendar/2025/4/
- **React Native / ネイティブ**
  - https://expo.dev/blog/expo-ui-stable-sdk-56
  - https://www.nativewind.dev/v5/guides/migrate-from-v4
  - https://docs.uniwind.dev/
  - https://tamagui.dev/blog/version-three
  - https://gluestack.io/blogs/gluestack-ui-v5-stable-release
  - https://heroui.com/docs/native/releases
  - https://github.com/facebook/react-strict-dom
- **フレームワーク本体**
  - https://react.dev/blog/2026/09/09/react-19-3
  - https://react.dev/blog/2025/10/01/react-19-2
  - https://react.dev/blog/2025/10/07/react-compiler-1
  - https://remix.run/blog/react-router-v8
  - https://tanstack.com/blog/we-stopped-using-rsc-on-tanstack-com
  - https://angular.dev/guide/aria/overview
  - https://www.infoq.com/news/2026/08/angular-v22-released
  - https://four.htmx.org/announcements/2026-08-28-htmx-4.0.0-is-released

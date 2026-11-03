# 設計ドラフト v1（2026-10-22）

> 議論用のたたき台。名前は未定なので、本文では仮に **`@urushi`** / `urushi` と書く。
> 前提にしている調査は [../research/00-summary.md](../research/00-summary.md)。

## 決定済みの方針

| 項目 | 決定 |
|---|---|
| 方向性 | A＋C（エージェントが壊せない「契約」を骨格にし、見た目を丸ごと切り替えるスタイルパックを見せ場にする） |
| 和文組版 | スタイルパックの 1 つとして持つ。ライブラリの基本は世界向けにする |
| 収益化 | 当面は OSS（MIT）だけ |
| 作り方 | **すべてスクラッチで作る。** Radix・Base UI・Floating UI など外部の UI ライブラリには依存せず、振る舞いはブラウザ標準を土台に自作する |
| 配布 | **自前の CLI だけで配る。** shadcn との互換は持たない |

## 1. コンセプト

**ブラウザ標準の上にゼロから作る UI ライブラリ。AI に書かせても崩れず、見た目は丸ごと持ち替えられる。**

柱は 3 本。

1. **ブラウザ標準を土台にする**
   - `<button>`、`<dialog>`、`popover` 属性、anchor positioning（要素を別の要素の位置に合わせて置く CSS 機能）、invoker commands（JS なしでダイアログなどを開閉できる HTML 属性）、ネイティブの `<input>` と `<select>` を使う。
   - 振る舞いの多くをブラウザに任せ、足りない分だけ小さな JS で補う。
   - 結果として**軽く**、**Server Components のままで動く部品が多い**。
2. **契約（Contracts）**
   - 部品ごとに 1 ファイルの「契約」を書く。中身は props、バリアント、状態、a11y の要件、上書きしてよい範囲。
   - 型・lint・ドキュメント・Skill・配布用のデータは、すべて契約から生成する。
   - 契約に違反したコードはエラーになる。人が書いたか AI が書いたかは関係ない。
3. **スタイルパック（Packs）**
   - 形・密度・組版・動き・色をまとめて切り替える。
   - 切り替えは実行時にでき、アプリ全体でも一部分だけでもよい。
   - 看板の 1 つは和文組版のパック。

一言でいうと、**"Native, contracted, and wearable."**

## 2. 設計原則

1. **ネイティブ要素を優先する**
   - ネイティブ要素で表現できるものは、ネイティブ要素をそのまま使う。
   - ARIA の第一原則「ネイティブの要素を使え」に従う。
   - 調査では「ラジオボタン 1 つにコンポーネント 45 行と依存 215 行」という批判記事が HN で 528 点を集めた。この批判にそのまま応える方針。
2. **実行時の依存は react / react-dom だけ**
   - ほかの UI ライブラリ、位置計算のライブラリ、アニメーションのライブラリ、CSS フレームワークは使わない。
   - zod などは、契約からファイルを生成するときに使うだけで、ブラウザに送るコードには入れない。
3. **JS は最後の手段**
   - 優先順位は「HTML の属性 → CSS → 小さな JS」。
   - JS が要るのは、ロービングフォーカス、タイプアヘッド、トーストの順番待ち、ホバーの遅延などだけ。
   - その JS も、フレームワークに依存しない素の TypeScript で書く。
4. **Server Components を最初から前提にする**
   - JS の要らない部品は `"use client"` を付けずに作る。
   - 開いたり閉じたりする部品も、invoker commands を使えば、クライアント側の JS を読み込まずに動く形を用意する。
5. **契約を唯一の正とする**
   - 仕様は契約ファイルに 1 回だけ書き、他はすべてそこから生成する。手で二重に書かない。
6. **見た目はパックが受け持ち、アプリのコードは組み立てと配置だけを書く**
   - スタイルはパックの CSS が、`data-slot` や状態を表す `data-*` 属性を目印にして当てる。
   - アプリ側で `className` を使ってよいのは、契約が許した範囲だけ。
7. **段階的に強化する**
   - 新しいブラウザ機能は `@supports` で、使えるときだけ有効にする。
   - 対応していないブラウザでも、壊れずに「ネイティブの見た目」で動く状態に落ちる。
8. **移植しやすくする**
   - 実装は React だけにする。
   - ただし、素の TS で書いた振る舞い・パックの CSS・契約（JSON Schema）は、他のフレームワークでもそのまま使える。

## 3. 外部依存の方針

| 区分 | 方針 |
|---|---|
| 実行時 | peerDependencies は `react` と `react-dom`（19 以上）だけ。それ以外はゼロ |
| ビルド時 | zod（契約）、DTCG トークンの変換、TypeScript |
| CSS | 素の CSS（入れ子、`@layer`、カスタムプロパティ）だけで書く。**Tailwind は不要** |
| Tailwind | 任意で連携できるようにする。`@urushi/tailwind` が `@theme` にトークンを対応させるので、アプリのレイアウトには Tailwind を使える |
| アイコン | 同梱しない。部品は `icon` のスロットで受け取る |

## 4. 対応ブラウザ

**方針: 公開する時点で Baseline Newly available（主要 3 ブラウザすべてで使えるようになったばかりの段階）にある機能を「必須」にする。それより新しい機能は段階的強化で使う。**

### 必須にする機能（候補）

| 機能 | Chrome | Safari | Firefox | 使いどころ |
|---|---|---|---|---|
| Popover API | 114 | 17 | 125 | すべてのオーバーレイを top layer に出す |
| anchor positioning | 125 | 26 | 147 | Popover / Menu / Tooltip の位置合わせ（Floating UI の代わり） |
| invoker commands（`command` / `commandfor`） | 135 | 26.2 | 144 | JS なしでの開閉。Server Components から使う |
| `@starting-style`、`transition-behavior` | 117 | 17.5 | 129 | 出入りのアニメーション |
| `:has()`、`:modal`、`@layer`、CSS の入れ子 | 済 | 済 | 済 | 背景のスクロールを止める、状態に応じてスタイルを当てる |
| `light-dark()`、relative color、`color-mix()` | 125 | 18 | 128 | ダークモード、派生色 |

→ ここから決まる対応ブラウザの下限（暫定）: **Chrome / Edge 135、Safari 26.2（iOS 26.2）、Firefox 147**。Phase 0 で実際に検証してから確定する。

### 段階的強化で使う機能

| 機能 | 使える場合の効果 | 使えない場合 |
|---|---|---|
| `appearance: base-select`（Chrome 135 / Safari 27 / Firefox はフラグ付き） | Select をパックの見た目にできる | ネイティブの select の見た目のまま |
| `closedby`（Safari は TP） | Dialog の外側クリックで閉じる | 小さな JS で補う |
| `popover="hint"`（Safari は TP） | Tooltip が他のポップオーバーを閉じない | `popover="manual"` と JS で補う |
| `corner-shape` | スクワークル角（Soft パック） | 普通の border-radius |
| `field-sizing`、`sibling-index()`、container style queries、`::details-content` | 自動で伸びる Textarea、順番にずらすアニメ、密度の条件分岐、アコーディオンの開閉アニメ | 固定の高さ / アニメなし / 変数の継承だけで対応 |
| top layer の退場アニメ（`overlay` の transition） | 閉じるときのアニメ | すぐに消える（※対応状況は要確認） |
| Chromium だけの機能（`interestfor`、`if()`、`reading-flow` など） | **使わない** | — |

## 5. 振る舞い層の設計

### 部品の難易度（Tier）

| Tier | 実装の考え方 | 部品の例 | 描画場所 |
|---|---|---|---|
| **1: ネイティブ要素そのまま** | ネイティブ要素＋`data-slot`＋パックの CSS。JS はゼロ | Button、Link、Input、Textarea、Checkbox（`<input type=checkbox>`）、Radio、Switch（`role="switch"`）、Field / Label、Accordion（`<details name>`）、Progress / Meter、Separator、Badge、Card、Avatar、Skeleton、Spinner | **Server** |
| **2: ブラウザ API＋少しの JS** | `<dialog>`、`popover`、anchor positioning、invoker commands。足りない部分だけ JS で補う | Dialog、Popover、Tooltip、Toast、Tabs、ToggleGroup、Select（ネイティブの select＋base-select） | 開閉を属性に任せる形なら Server。状態を親から制御する形なら Client |
| **3: 独自のふるまいが多い** | 状態管理と、APG（WAI-ARIA のパターン集）の厳密な実装 | Menu（タイプアヘッド、サブメニュー）、Combobox、DateField、Tree、データグリッド | Client |

### パッケージの構成

- **`@urushi/core`**: 素の TS で書いた小さな振る舞いの集まり。
  - roving focus（矢印キーでフォーカスを移す）
  - タイプアヘッド（文字を打つとその項目に飛ぶ）
  - 閉じる順番の管理（Esc で一番上のものから閉じる）
  - トーストの順番待ち
  - スクリーンリーダーへの読み上げ通知（live announcer）
  - フレームワークに依存せず、React 以外や htmx からも使える。
- **`@urushi/react`**
  - 部品本体。`data-slot` と状態属性（`data-state`、`data-disabled` など）の仕様は自分たちで決める。
  - 組み合わせ方は compound components と `render` prop。
  - `asChild`（子要素を複製して props を流し込む方式）は使わない。

### Dialog の例（Server Components で JS なしに開閉する形）

```tsx
// Server Component のままでよい（"use client" なし）
<Dialog.Root id="delete-confirm">
  <Dialog.Trigger>削除</Dialog.Trigger>          {/* <button command="show-modal" commandfor="delete-confirm"> */}
  <Dialog.Content>                               {/* <dialog id="delete-confirm" closedby="any"> */}
    <Dialog.Title>本当に削除しますか？</Dialog.Title>
    <Dialog.Close>キャンセル</Dialog.Close>       {/* <button command="close" commandfor="delete-confirm"> */}
  </Dialog.Content>
</Dialog.Root>
```

- 開閉の状態を親から持ちたい場合は、`<Dialog.Root open={open} onOpenChange={...}>` を使う。こちらは Client 版になる。

### 目標

- **バンドルサイズ**: Dialog / Popover / Menu / Select / Tabs / Tooltip の 6 部品で **gzip 10KB 未満**（CI で計測）。
  - 調査で同じ 6 部品を実測した結果は、Radix 44KB、Base UI 87KB。
- **Server Components で使える部品の割合**: MVP の部品のうち **6 割以上**。
  - 比較対象の shadcn は 64 部品中 40 部品が Client。

## 6. a11y をどう保証するか（一番のリスク）

React Aria のチームは、2026-02 に「汎用ライブラリでは `<dialog>` は使えない」と述べた。その理由 5 つに、それぞれどう答えるかを最初に決めておく。

| 懸念 | 対策 |
|---|---|
| ① top layer と、他のライブラリが重ねて表示する要素との相互運用 | ライブラリ内のオーバーレイはすべて top layer に統一する。他のライブラリが z-index で出すポータルとの混在は「非対応」と明記し、回避策をドキュメントに書く |
| ② 閉じるときのアニメ | `overlay` と `display` の allow-discrete で実装する。対応していないブラウザでは、アニメなしで即座に閉じる |
| ③ 背景のスクロールを止める | `html:has(dialog:modal) { overflow: hidden }` と `scrollbar-gutter: stable` を使う。iOS Safari は実機で検証する |
| ④ フォーカスを閉じ込める | `showModal()` が背景を inert（操作できない状態）にする、ネイティブの仕組みに任せる。初期フォーカスと、閉じた後にフォーカスを戻す先は契約で決める |
| ⑤ `aria-modal` の副作用 | 自分で ARIA を付けず、ネイティブのモーダルの意味づけに任せる。スクリーンリーダーごとの差を検証表に記録する |

### 検証のしかた

- **APG に沿ったテスト**: キーボード操作の表を契約から生成し、Playwright で 3 つのブラウザエンジンすべてで実行する。
- **自動検査**: axe（Vitest と Playwright の両方）で検査する。
- **スクリーンリーダーでの手動検証**: 次の組み合わせで行い、部品ごとの結果を**ドキュメントに公開する**（調査で見つかった「a11y を検証できる形で示す」という空白地帯）。
  - VoiceOver（macOS / iOS）
  - NVDA（Firefox / Chrome）
  - TalkBack
- **Tier 3 の部品**は、この検証の仕組みができてから着手する。

## 7. スタイルパック（実行時に切り替える CSS）

部品の TSX には意味だけを書き、見た目はパックの CSS が当てる。

```tsx
// components/ui/button.tsx（`urushi add` で手元にコピーされる。薄い）
import { Button as Native } from "@urushi/react/button";
export function Button({ variant = "secondary", size = "md", ...props }) {
  return <Native data-variant={variant} data-size={size} {...props} />;
}
```

```css
/* @urushi/packs/ledger/button.css */
@layer urushi.pack {
  [data-slot="button"] {
    block-size: var(--ur-control-md);
    padding-inline: var(--ur-space-3);
    border-radius: var(--ur-radius-control);
    font: var(--ur-font-control);
  }
  [data-slot="button"][data-variant="primary"] {
    background: var(--ur-color-action);
    color: var(--ur-color-on-action);
  }
}
```

### 切り替え方

- **パック全体**: `<html data-pack="ledger">`。一部分だけ変えるなら `<section data-pack="sumi">`。
- **密度**: `data-density="compact"` を付けると、CSS 変数の継承で子要素すべてに反映される。style query は必須にしない。

### パック（2026-10-22 決定）

書体は 2 つとも Noto Sans JP（ゴシックのみ）。トークンの正本は `packages/packs/<pack>/tokens.json`、使い方の決まりは [デザインシステム](https://claude.ai/artifact/81F4wiBJYhaYfJKNKvqqZg)（生成元は `design-system/` と `scripts/design-system.tsx`）。

| 軸 | Graphite（業務・道具） | Lucent（一般向け・素材） |
|---|---|---|
| 色 | 主ボタンも墨色。色はフォーカス・選択・危険だけ（信号の青） | ラグーンの青緑 1 色 |
| 形 | 部品 8px・面 12px・ダイアログ 14px | 部品 12px・面 22px・ダイアログ 28px（スクワークル対応時 16・30・36px） |
| 素材 | 不透明。縁は 1px の輪 | 半透明＋`backdrop-filter: blur(28px) saturate(1.8)` |
| 密度 | 28 / 34 / 40px | 30 / 36 / 44px |
| 動き | 120〜140ms、弾まない、0.98 倍から | 160〜260ms、わずかに弾む、0.95 倍から |
| ダーク | 主ボタンが明るい色に反転 | 暗い青緑のガラス |

すべての文字色の組み合わせは、4 テーマ（各パック × ライト／ダーク）で 4.5:1 以上、フォーカスリングは 3:1 以上を満たす（2026-10-22 に計算して調整済み）。

### すべてのパックに共通すること

- 色は、基準色・アクセント色・コントラストの 3 つの入力から、OKLCH で全トークンを生成する。
- `light-dark()` でダークモードに対応する。
- `prefers-contrast`（高コントラスト設定）と `prefers-reduced-motion`（動きを減らす設定）に対応する。
- パックごとに Skill を付ける。例:「Ledger では影を使わない」。

## 8. 契約（スキーマ案）

```ts
// contracts/dialog.contract.ts
import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "dialog",
  tier: 2,
  summary: "作業を中断して確認や入力を求める、モーダルなダイアログ",
  use: ["破壊的な操作の確認", "短い入力フォーム"],
  avoid: [{ case: "補足情報の表示", instead: "popover" }, { case: "通知", instead: "toast" }],
  native: { element: "dialog", method: "showModal" },
  rendering: { uncontrolled: "server", controlled: "client" },
  platform: {
    requires: ["popover", "invoker-commands", ":modal"],
    enhances: [{ feature: "dialog-closedby", fallback: "light-dismiss.js" }],
  },
  anatomy: { required: ["root", "content", "title"], optional: ["trigger", "description", "close"] },
  props: z.object({
    open: z.boolean().optional().describe("指定すると Client 版（状態を親から制御する）になる"),
    dismissible: z.enum(["any", "closerequest", "none"]).default("any"),
  }),
  states: ["open", "closing"],
  a11y: {
    apg: "dialog-modal",
    keyboard: { Escape: "close", Tab: "cycle-within" },
    focus: { initial: "first-focusable | [data-autofocus]", restore: "trigger" },
    rules: ["Title は必須", "Description があれば aria-describedby で関連付ける"],
  },
  overrides: { className: ["layout", "width", "max-width"] },
  tokens: ["color.surface.overlay", "radius.overlay", "shadow.overlay", "motion.overlay"],
  examples: [/* ... */],
});
```

### 契約から生成するもの

- 型
- lint の設定（上書きしてよい範囲、必須のパーツ、a11y のルール）
- キーボード操作のテスト（Playwright）
- ドキュメント（`.mdx` と `.md`。props の表、キーボード操作の表、対応ブラウザと代替動作の表、a11y の検証結果）
- llms.txt と SKILL.md
- 配布用のデータ
- 後のフェーズで: 生成 UI 用のカタログ（json-render / A2UI）、Figma の Code Connect

## 9. 配布と更新（自前の CLI と自前の形式）

shadcn と互換にしないので、**最初から「後で更新できる」形式で設計できる**。調査で不満の 2 位だった「コピーした後に更新できない」を、作りの段階で解決する。

### コマンド

| コマンド | 内容 |
|---|---|
| `urushi init` | パック・密度・トークンの入力（基準色など）を選ぶ。`urushi.json` を作る |
| `urushi add dialog` | 薄い TSX をコピーする。パックの CSS は「管理モード」（npm から import する）か「所有モード」（手元にコピーする）を選べる |
| `urushi diff` / `urushi update` | lockfile に記録した「入れたときの版とハッシュ」を元にして、3-way merge で更新する。衝突したら、エージェントに渡す説明を出す |
| `urushi add-variant button brand` | 契約にバリアントを足し、パックの CSS の雛形を作る |
| `urushi info --json` | パック・導入済みの部品・バージョンを出力する（エージェント向け） |

### 配布する項目の形式（案）

```json
{
  "name": "dialog",
  "version": "0.3.0",
  "contract": "dialog.contract.json",
  "files": [
    { "path": "components/ui/dialog.tsx", "owner": "user", "hash": "sha256-…" },
    { "path": "styles/urushi/ledger/dialog.css", "owner": "user|managed", "hash": "sha256-…" }
  ],
  "dependencies": { "@urushi/react": "^0.3.0" }
}
```

- lockfile（`urushi.lock`）は Phase 0 から書き出している。3-way merge の `urushi update` は Phase 1 で前倒しして実装した（`docs/phase1/README.md`）。
- **署名と来歴（provenance）**: npm provenance と、配布データへの署名を最初から入れる。調査で shadcn の PR にマルウェアが混入した事件があったことへの対策。

## 10. エージェント向けの仕組み

### `@urushi/eslint-plugin` のルール

| ルール | 検出するもの | エラー文の例 |
|---|---|---|
| `no-visual-override` | 契約で許可されていない `className` / `style` での見た目の上書き | 「Button の色は className では変えられません。`variant="danger"` を使ってください」 |
| `no-raw-color` / `no-arbitrary-value` | 生の色の値や任意の値 | 代わりに使えるトークンの候補を出す |
| `require-parts` | 必須パーツが足りない | 例: Dialog に Title がない |
| `a11y-contract` | 契約にある a11y ルールへの違反 | 例: アイコンだけのボタンに `aria-label` がない |
| `prefer-native` | ネイティブ要素で済むところでの、`div` ＋ `onClick` などの自作 | — |

実装では、`no-visual-override`・`no-raw-color`・`valid-idref`（id の参照先と種類）・`required-props`・`accessible-name`・`prefer-native`・`tabs-match`（Tabs.Tab と Tabs.Panel の value の対応）の 7 個になった（2026-10-22、Phase 1）。AI に画面を作らせる計測（`docs/phase1/ai-lint-rate.md`）のあとで、`valid-token`（どのパックにもないトークン名）と `valid-import`（`@urushi/react` にない名前の import と部品。近い部品を示す）を足して 9 個にした。

### Skill（`@urushi/skills`）

- 組み合わせのルール、禁止事項、トークンの一覧、良い例と悪い例、パックごとの決まりごとを書く。
- 生成を始める前の手順も含める: まずパックとトークンをどう使うか計画を立てる。

### AI 向けのドキュメントと MCP

- llms.txt を置き、全ページに `.md` 版を用意する。
- 独自の MCP は Phase 2 で作る（エージェントは CLI の `--json` 出力でも操作できる）。

### shadcn の配布経路を使わない分の補い

- LLM は HTML をよく知っている。そこで部品の props は、ネイティブ要素の属性に近い名前と意味にそろえる（例: `disabled`、`required`、`name`、`value`、`open`）。
- lint のエラー文で、エージェントに正しい書き方を伝える。
- Context7 などのドキュメント配信サービスにも登録する。

## 11. MVP の部品（約 20 個）

| Tier | 部品 |
|---|---|
| 1 | Button、Link、Field（ラベル・説明・エラー）、Input、Textarea、Checkbox、RadioGroup、Switch、Accordion、Card、Badge、Separator、Skeleton、Spinner |
| 2 | Dialog、Popover、Tooltip、Toast、Tabs、Select（ネイティブ＋base-select） |
| 3 | Menu（サブメニューなし）。※Phase 0 の結果を受けて MVP に入れた |

2026-10-22 の Phase 1 で、上の 21 個を実装した（`docs/phase1/README.md`）。

### 公開時の目玉

- 同じアプリを 3 つのパックで見せる「パック切り替えデモ」（ダッシュボード、設定画面、記事ページ）。
- 「6 部品で 10KB 未満」「多くが Server Components で動く」「a11y の検証結果を公開」という数字。

## 12. リポジトリの構成（案）

```
.
├─ packages/
│  ├─ core/            # フレームワークに依存しない振る舞い（素の TS）
│  ├─ react/           # 部品（ネイティブ要素＋data-slot＋状態属性）
│  ├─ contract/        # defineContract とスキーマ（zod → JSON Schema）
│  ├─ tokens/          # DTCG の元データ → CSS 変数 / Figma 用 / Tailwind 連携
│  ├─ packs/           # ledger / soft / sumi の CSS と、パックごとの Skill
│  ├─ cli/             # init / add / diff / update / add-variant / info
│  ├─ eslint-plugin/   # エージェントにも読めるエラー文の lint
│  ├─ skills/          # 生成した SKILL.md
│  └─ tailwind/        # 任意で使う Tailwind 連携（@theme への対応付け）
├─ contracts/          # 部品ごとの *.contract.ts
├─ registry/           # 部品の TSX テンプレート → build で配布データにする
├─ tests/
│  ├─ a11y/            # 契約から生成するキーボード操作のテスト（Playwright、3 エンジン）
│  └─ visual/          # パックごとの見た目の回帰テスト
└─ apps/
   ├─ docs/            # ドキュメント（配布データ、llms.txt、.md 版もここから配信）
   └─ playground/      # パック切り替えデモ
```

## 13. 段階的な計画

| フェーズ | ゴール | 完了の条件 |
|---|---|---|
| **0. 実現性の確認** | **一番危ない部分（オーバーレイの a11y）がネイティブで成り立つか確かめる** | Button・Dialog・Popover の 3 つで、次の 6 点を満たす。①3 エンジン × スクリーンリーダーの検証表で重大な問題がない ②React Aria が挙げた 5 つの懸念それぞれに結論を出す ③契約から型・ドキュメント・lint・配布データを生成できる ④2 つのパックを実行時に切り替えられる ⑤`urushi add` でサンプルアプリ（Next.js と Vite）に入る ⑥サイズを計測する |
| **1. MVP の公開** | 約 20 部品、3 パック、lint、Skill、lockfile、ドキュメント、デモ | 全部品が axe・キーボードテスト・見た目の回帰テストを通る。AI に画面を作らせたときに lint が通った割合を測って公開する |
| **2. 拡張** | Menu の完成版（サブメニュー）、Combobox、DateField、MCP（`urushi update` は Phase 1 で実装済み） | — |
| **3. AI ネイティブ化と複雑な部品** | 生成 UI のカタログ書き出し、MCP Apps のホストへの対応、Figma 連携、Tree、データグリッド | — |

## 14. リスク

| リスク | 対策 |
|---|---|
| **a11y の保証コストが大きい**（スクラッチで作る場合の最大のコスト） | 検証の仕組みを Phase 0 で先に作る。Tier 3 は後回しにする。検証結果を公開する |
| **対応ブラウザが新しいものに限られる**（Safari 26.2 未満などは対象外） | 2027 年に始まる新規プロジェクトを主な対象にする。新しい機能は段階的強化で使う |
| **shadcn と AI のつながりを使えない**（AI は shadcn をよく学習している） | ネイティブに近い API にする（LLM は HTML を知っている）、lint のエラー文、Skill、llms.txt、Context7 への登録で補う |
| **作業が 1 人に集中する**（調査で Radix や vaul について批判した点がそのまま当てはまる） | 範囲を小さく保つ。テストを自動で生成する。振る舞いは素の TS で小さく分ける |
| **部品がネイティブ要素に縛られて、デザインの自由度が下がる** | 段階的強化で見た目を合わせていく（base-select など）。Tier 3 で独自の部品を用意する |

## 15. 次に確認したいこと

1. **対応ブラウザの下限**（Chrome 135 / Safari 26.2 / Firefox 147）で問題ないか。
2. **名前**（パッケージのスコープ、CLI の名前、パックの名前）。
3. **Phase 0 から始めてよいか。** Button・Dialog・Popover の 3 つで、ネイティブ要素で作った場合の a11y の検証から入る。

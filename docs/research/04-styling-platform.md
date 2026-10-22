# 04. スタイリング技術・Web プラットフォーム・ビジュアルトレンド（2026-10-22 時点）

> **数値の注意（2026-10-22 追記）**: 本文の npm 週間 DL で「2026-10-12〜18」の週を使っている値は、npm API の欠損（10/13〜15 の 3 日間、全パッケージ 0）により **約 45% 少なく出ている**。正確な値は [08-metrics.md](08-metrics.md)（2026-09-28〜10-04 の週）を参照。例: shadcn CLI 745 万 → 実際は約 1,336 万、@base-ui/react 1,085 万 → 1,927 万、tailwindcss 8,470 万 → 1.63 億。同じ週どうしの比較（どちらが多いか）は有効だが、前年比は過小評価になっている（shadcn CLI は 17 倍ではなく約 40 倍）。

WebSearch の上限に達したので、後半は次の一次情報で確認した。【推測】と書いたもの以外は、すべて出典で裏を取ってある。

- WebFetch で取得した公式ページ
- GitHub API / npm API / webstatus.dev API
- MDN browser-compat-data（BCD）v8.1.6（2026-10-15）
- wpt.fyi の Interop 2026 生データ

## 1. 要約

- **Tailwind**
  - 最新は v4.3.3（2026-07）。v5 の公式発表はまだない。
  - 2026-01 にエンジニア 4 人中 3 人が解雇された。その後のコミットの約 9 割は Robin Malfait 1 人によるもの。
  - 利用は伸び続けているが、開発がほぼ 1 人に依存しているリスクがはっきり見える。
- **CSS-in-JS**
  - 実行時に CSS を生成する方式は終わりつつある。styled-components はメンテナンスモード、Pigment CSS は凍結。
  - 勝ち残っているのはビルド時に CSS を出す方式。StyleX（Linear が移行、Meta の Astryx が採用）と、Panda 2.0（Rust で書き直したコンパイラ、2026-09-29）。
- **デザイントークン**
  - DTCG 2025.10 が初の安定版になった。Style Dictionary 5.x と Figma のネイティブ import/export も対応した。
  - トークンの共通フォーマットは、ほぼ決着がついた。
- **すでに揃った Web 機能**
  - Popover / anchor positioning（2026-01 に Baseline）/ invoker commands（2025-12）/ @scope / style queries / field-sizing / sibling-index()
  - これでオーバーレイ（ポップオーバーやメニュー）まわりの JS は、かなり CSS と HTML に置き換えられる。
- **まだ 1 つのエンジンが足りない機能**
  - customizable select / closedby / popover=hint / scroll-driven animations / cross-document View Transitions / corner-shape
  - 今は「対応しているブラウザでだけ効く」形（段階的強化）で書いておけば、1〜2 年後に効いてくる。
- **リリース周期**: Chrome（153〜）と Firefox（155〜）は 2026-09 から 2 週間ごとのリリースに移った。新機能が届くのが速くなっている。
- **ビジュアルの潮流**: 控えめな Liquid Glass、低コントラストで落ち着いた高密度 UI、ルールとして書かれたモーション、AI っぽい画一的な見た目への反発。

## A. スタイリング技術

### A-1. Tailwind CSS v4.x

**最近のリリース**

- v4.2.0（2026-02-18）
  - `@tailwindcss/webpack`
  - 論理プロパティのユーティリティ（`pbs-*`、`inline-*`、`inset-s-*` など）
  - `font-features-*`
  - 新しい色 4 系統（mauve / olive / mist / taupe）
- v4.3.0（2026-05-08）
  - `scrollbar-*`、`scrollbar-gutter-*`、`@container-size`、`zoom-*`、`tab-*`
  - `@variant` の重ね掛けと複合
  - `--default()`
- v4.3.3（2026-07-16）が最新版。

**未リリース（CHANGELOG の Unreleased）**

- `@tailwindcss/turbopack`。Vercel の Tim Neutkens もコミットしている。
- `tailwindcss canonicalize` の大量の改良。たとえば `bg-[#fff]` を `bg-white` のような正規の形に書き換える。AI が生成したクラスの整形に使える。

**設計の前提（v4.0 から変わらず）**

- 設定は CSS ファイルの中に書く（`@theme` / `@utility` / `@custom-variant`）。
- 標準パレットは OKLCH。
- 対応ブラウザの下限は Chrome 111 / Safari 16.4 / Firefox 128。

**新しいプラットフォーム機能への追従は遅い**

- anchor positioning 専用のユーティリティがない。
- corner-shape の PR #19298 は、2025-11 から open のまま。

**v5**: 公式ブログ・GitHub・CHANGELOG のどこにも言及がない。

**Tailwind Labs の経営（事実）**

- 2026-01-06 に 3 人を解雇した（エンジニアの 75%）。残ったのは、共同創業者 3 人と Robin Malfait、Peter Suhm。
- Adam Wathan によると、利用は伸びている一方で、売上はほぼ 8 割減、ドキュメントへのアクセスは 40% 減った。AI 経由で使われるため、有料製品へ流れる導線が失われたのが原因。
- 「このままでは約 6 か月で給与が払えなくなる」とも述べている。
- 直後に Vercel、Google AI Studio、Lovable、Gumroad、Macroscope、Profound、Supabase がスポンサーを表明した。Partner tier は月 $5,000。
- v4.2 の論理プロパティと `font-features-*` は、Partners Program を通じた Netflix・Vercel との協業から生まれた（公式ブログ）。
- 2026-09 に Shopify への合流が発表された（tailwindcss.com/blog/tailwind-is-joining-shopify、[07-community.md](07-community.md) を参照）。

**GitHub の実データ**

| 期間 | コミット数 |
|---|---|
| 2025-04〜10 | Malfait 84、Pittman 41、Spiess 27 |
| 2026-04〜10 | Malfait 123、その他は外部コントリビュータが数件ずつ |

**【推測】リスク**

- 週 8,470 万 DL かつ MIT ライセンスなので、消えるリスクは低い。
- 現実的なリスクは 3 つ。
  - 新しい CSS 機能への追従が遅れる
  - 中心の 1 人が抜けると止まる
  - 有料製品の Tailwind Plus に頼るビジネスモデルが細る

### A-2. バリアント管理

| パッケージ | 状況 | 週間 DL |
|---|---|---|
| cva | 安定版 `class-variance-authority` は 0.7.1（2024-11）で止まっている。後継の `cva@1.0.0-beta.12`（2026-09）は 2 年以上ベータのまま | 4,050 万（shadcn 経由） |
| tailwind-variants | v3.3.1（2026-08）。v3 で、tailwind-merge を使わない `lite` 版と通常版に分かれた | 273 万 |
| tailwind-merge | v3.7.0（2026-09）。v3.6 で Tailwind v4.3 に対応し、`light-dark()` も色として扱えるようになった。Tailwind が更新されるたびに追いかけ続ける必要がある、という構造上のコストがある | 5,200 万 |
| tw-animate-css | 1.4.0（2026-02）。旧来の `tailwindcss-animate` からの置き換えが進んでいる | 2,460 万（旧パッケージは 1,220 万） |

### A-3. 代替技術

**StyleX**（0.19.1、週 117 万 DL）

- Meta 社内のほぼすべての Web サービスで標準になっている。Meta 以外の採用例として Figma と Snowflake が挙げられている。
- Linear は styled-components から StyleX に移行した（2026-08-26）。
  - 理由: スタイルの約束事を外から上書きしにくいこと、合成の順序が予測できること。この 2 点がエージェントの書くコードに向いている。
  - 効果: 重いページでメインスレッドの CPU が 20〜35% 減った。
- Meta は StyleX ベースのデザインシステム Astryx を MIT で公開した（2026-06 パブリックベータ）。CLI と、AGENTS.md / CLAUDE.md の書き出しを持つ。コンポーネント数は資料によって 90 超から 150 超までばらつく。

**Panda CSS 2.0**（2026-09-29、週 28 万 DL）

- Oxc ベースの Rust コンパイラに書き直した。スタイルの抽出が 15〜37 倍、監視モードが約 360 倍速くなった。
- 追加: `panda lib`（デザインシステムを配布する機能）、`viewTransition()` / `positionTry()` のファクトリ、MCP を別パッケージ化。
- ESM 専用で、Node 22 以上が必要。

**その他**

- vanilla-extract: 1.21.x で安定（週 170 万 DL）。Linear は「API が細かく分かれすぎている」として採用しなかった。
- Pigment CSS（MUI）: 0.0.31 のアルファで凍結。MUI は「進めるには別のアプローチが必要」と明言し、Base UI に力を入れている。
- UnoCSS: 66.x（週 31 万 DL）。Tailwind 互換の小さな市場にとどまる。
- CSS Modules
  - Linear は、StyleX では書けない場面の逃げ道として使っている（グローバルセレクタ、サードパーティの DOM）。
  - Tailwind 公式は併用を勧めていない。併用はできるが、ファイルごとに Tailwind が走るので遅くなる。

**プレーン CSS に戻る流れ**

- Web Awesome 3（週 17.5 万 DL）
- daisyUI 5（週 66 万 DL）: Tailwind のプラグインで、意味のあるクラス名と CSS 変数のテーマを使う
- Basecoat（★4.4k）: React を使わない shadcn 風
- shadcn 自身も同じ方向に動いている
  - 最近の 8 スタイル（luma / rhea / sera など）では、コンポーネント側には `cn-slider-track` のような意味のあるクラス名だけを書く。
  - 実際の見た目は別の CSS に `.style-luma { .cn-* { @apply … } }` の形でまとめている。
  - 【推測】見た目を丸ごと差し替えられる層として、今後の主流の設計になる。

**実行時の CSS-in-JS**

- styled-components は 2025-03 にメンテナンスモードを宣言し、新規プロジェクトには勧めていない。
- それでも既存の資産として DL は大きい（styled-components 週 590 万、Emotion 週 1,130 万）。

### A-4. デザイントークン

- **DTCG**
  - 2025-10-28 に初の安定版「2025.10」が出た。Format / Color / Resolver の 3 モジュールで構成される。
  - 対応範囲: テーマ / マルチブランド、Display P3 や OKLCH を含む 14 の色空間、エイリアス。
  - W3C の正式な標準ではなく、Community Group の最終レポートという位置づけ。
- **Style Dictionary 5.x**（週 115 万 DL）
  - 5.3〜5.7（2026-10）で、DTCG 2025.10 の機能に順に対応した。構造化された色、dimension オブジェクト、duration、`$root`。
  - 別の参照実装 Terrazzo は週 7 万 DL。
- **Figma**
  - Schema 2025（2025-10-28）で、変数のネイティブ import/export（2025-11 提供）を DTCG と結び付けて発表した。
  - 同時に発表: extended collections（マルチブランド）、Slots、Code Connect の UI、MCP の一般提供。
- 【推測】「DTCG JSON を正本にして、Figma と CSS 変数の両方に書き出す」形は、もう標準的なやり方と言ってよい。

## B. Web プラットフォーム（2026-10）

- 安定版: Chrome 156 / Firefox 158 / Safari 27。
- Chrome は 153 から、Firefox は 155 から 2 週間ごとのリリースになった。
- 表の「Newly」「Widely」「Limited」は Baseline の段階を表す。
  - Newly: 主要ブラウザすべてで使えるようになったばかり
  - Widely: Newly から約 2 年半が経ち、広く使える
  - Limited: まだ一部のブラウザでしか使えない

| 機能 | 状態 | Chrome / Safari / Firefox | UI ライブラリでの使い道 |
|---|---|---|---|
| Popover API | Newly（2025-01） | 114 / 17（iOS 18.3）/ 125 | ポップオーバー、メニュー、トーストを最前面の層（top layer）に出す。外側クリックで閉じる。z-index の管理が要らなくなる |
| popover="hint" | Limited | 151（133 は部分対応）/ TP / 153 | ツールチップ。開いているメニューを閉じずに重ねて出せる |
| anchor positioning | **Newly（2026-01-13）** | 125 / 26 / 147 | Floating UI の代わり。`position-try` で画面端に来たら反対側に出す。Safari 27 で transform への追従に対応 |
| customizable select（base-select） | Limited | 135 / **27** / 149（フラグ付き） | ネイティブの select を自由に見た目変更できる。`::picker`、`::checkmark` |
| dialog closedby | Limited | 134 / TP / 141 | 背景クリックや Esc で閉じる動作を属性で書ける |
| invoker commands（command / commandfor） | **Newly（2025-12）** | 135 / 26.2 / 144 | JS なしでダイアログやポップオーバーを開閉。Server Components と相性が良い |
| interest invokers（interestfor） | Chrome のみ | 142 / × / × | ホバーカード。Mozilla は neutral（用途に懸念あり）、WebKit は懸念ありで態度を保留 |
| @scope | Newly（2026-03） | 118 / 26.4 / 146 | コンポーネント単位でスタイルを閉じ込める。内側に別コンポーネントが来たらそこで止める「ドーナツ型」の範囲指定もできる |
| container size queries | Widely（2025-08） | 105 / 16 / 110 | 置かれた場所の幅に合わせて形を変える部品 |
| container style queries | **Newly（2026-05）** | 111 / 18 / 151 | 親から子へ `--variant` や `--density` を伝えて、テーマやバリアントを切り替える |
| scroll-state queries | Chrome のみ | 133 / × / × | 固定ヘッダーが張り付いたときの影、スナップ中の強調 |
| :has() | **Widely（2026-06）** | 105 / 15.4 / 121 | フォームの状態や、子要素の有無に応じたレイアウト |
| View Transitions（同一ページ内） | Newly（2025-10） | 111 / 18 / 144 | タブの切り替え、リストの並べ替え、共有要素の遷移 |
| View Transitions（ページをまたぐ） | Limited | 126 / 18.2 / × | MPA でのページ遷移（Interop 2026 の重点項目） |
| View Transitions（要素の中だけ） | Chrome のみ | 147 / × / × | 部品の中に閉じたトランジション |
| scroll-driven animations | Limited | 115 / 26 / Nightly | 進捗バー、視差効果。【推測】Firefox Nightly の Interop テストが 100% なので、近いうちに出荷される |
| @starting-style / transition-behavior | Newly（2024-08） | 117 / 17.5 / 129 | 表示・非表示の切り替え時のアニメーションを CSS だけで書ける |
| field-sizing | **Newly（2026-06）** | 123 / 26.2 / 152 | 中身に合わせて伸び縮みする textarea / input |
| light-dark() | Newly（2024-05）。2026-11 に Widely | 123 / 17.5 / 120 | 1 つのトークンでライトとダークの両方に対応 |
| relative color / color-mix() | Newly / Widely | 125・111 / 18・16.2 / 128・113 | ホバー時の色や半透明の色を、トークンから計算して作る |
| contrast-color() | Newly（2026-04） | 147 / 26 / 146 | ボタンの文字色を背景から自動で選ぶ（今のところ白か黒のどちらかだけ） |
| CSS if() | Chrome のみ | 137 / × / × | CSS の中でバリアントを分岐する |
| @function | Limited | 139 / TP / × | トークンを計算する関数（WebKit は賛成の立場） |
| mixins（@mixin） | 未実装 | × / × / × | 仕様を策定中。Tailwind の `@apply` に当たる機能 |
| sibling-index() / count() | **Newly（2026-08）** | 138 / 26.2 / 154 | 要素を少しずつずらして順に動かすアニメーションを、JS なしで書ける |
| corner-shape（スクワークル） | Limited | 139 / TP / Nightly | スクワークル（角が滑らかにつながる角丸）。`@supports` で対応ブラウザだけに当てる |
| text-box-trim | 3 エンジンとも実装済み（BCD）。ただし web-features の判定はまだ Limited | 133 / 18.2 / 154 | ボタンやバッジの中で、文字を上下の真ん中に正確に揃える |
| reading-flow | Chrome のみ | 137 / × / × | grid で見た目の並びとフォーカスの順番がずれる問題を解消する |
| gap decorations（row-rule） | Chrome のみ | 149 / × / × | テーブルやベントーの区切り線（2 つのベンダーとも賛成） |
| `<details name>` / ::details-content | Newly（2024-09）/ Newly（2025-09） | 120・131 / 17.2・18.4 / 130・143 | JS なしで、1 つ開くと他が閉じるアコーディオン。高さのアニメーションに使う interpolate-size は Chrome のみ |
| その他 | — | — | :open は Newly（2026-05）。typed attr() は Chrome 133・Firefox 155・Safari TP。random() は Chrome 156・Safari 26.2。grid-lanes（メイソンリー）は Safari 26.4 のみ。CSS だけで作るカルーセル（`::scroll-marker`）は Chrome のみ |

### Interop 2026（2026-02-12 発表、重点 20 項目）

**UI に関係する項目**

- anchor positioning
- container style queries
- dialogs と popovers（closedby、`:open`、hint）
- scroll-driven animations
- View Transitions（ページをまたぐものを含む）
- attr()、contrast-color()、shape()
- custom highlights、scroll snap、zoom

**2026-10-21 の安定版スコア**

| 項目 | スコア |
|---|---|
| dialogs と popovers | Safari 55%（年初は 27%）、Chrome と Firefox は 100% |
| scroll-driven animations | Firefox 9% |
| View Transitions | Firefox 80% |

**実験版のスコア**: Safari TP の dialogs と popovers は 98%、Firefox Nightly の scroll-driven animations は 100%。

【推測】このペースなら、2027 年前半までに多くの項目が Baseline に入る。

## C. ビジュアルトレンド

### Liquid Glass

- Apple が 2025-06-09 に発表し、iOS / macOS 26 全体に採用した。
- Web 向けの npm ライブラリは小さい。liquid-glass-react は週 2.2 万 DL で、2025-06 から更新が止まっている。
- 実際の採用は「控えめに解釈し直す」形が中心。
  - Linear の iOS アプリは、ブラー・SDF シェーダーによるハイライト・可変ブラーを自前で実装した。
  - 一方で屈折は「密度の高い業務 UI では読みにくくなる」として採用しなかった。
  - コントラストを上げる設定のときは、輪郭線を表示する。
- Web で現実的にできるのは `backdrop-filter`（Baseline 2024）と半透明の組み合わせまで。shadcn の 8 スタイルも、ポップオーバーの背景に `backdrop-blur-xs/sm` を入れる程度にとどめている。

### スクワークル

- Chrome 139 で corner-shape が入った。Safari と Firefox もプレビュー版には実装済み（BCD）。
- 【推測】1〜2 年で Baseline に入り、border-radius に次ぐ「角の形のトークン」になる。
- 今の主要ライブラリは、まだどこも採用していない。

### モーションのクラフト

- **Emil Kowalski のルール**
  - UI のアニメーションは 300ms 未満にする
  - キーボード操作にはアニメーションを付けない
  - よく使う操作ほどアニメーションを減らす
  - 入場は `scale(0.95)` から始める
  - イージングは ease-out を基本にする
  - さらに「センスの良さを、エージェント用のスキルファイルにルールとして書く」ことを提唱している。
- 流行りのクラフトは、派手さではなく、ルールとして書ける「抑制」に向かっている。
- 一方で、派手なアニメーション部品の需要も根強い（React Bits ★5 万、Magic UI ★2.3 万）。
- **関連パッケージの利用**
  - motion は週 1,575 万 DL（framer-motion 経由を含めると約 4,700 万）。
  - vaul は「unmaintained」と明記されたまま、週 2,050 万 DL（shadcn 経由で使われている）。

### 高密度 UI

- Linear は 2026-03 のリニューアルで、情報密度を保ったまま次のように変えた。
  - 区切り線のコントラストを下げる
  - サイドバーを暗くする
  - グレーを暖色寄りにする
  - 方針は「構造は見せるのではなく、感じさせる」。
- カスタムテーマは、基準色・アクセント色・コントラストの 3 つを入力すると、LCH 色空間で 100 以上の変数を自動生成する。

### AI っぽい画一的な見た目への反発

- Anthropic は「Inter + 白地に紫のグラデーション」に集まってしまう現象を distributional convergence と呼び、スキルでそれを避ける方法を公開した（2025-11）。
- shadcn はスタイルのプリセットを 8 種類に増やした。
- Linear の CEO は「Output isn't design」（2026-04）で、生成された見た目を「問題を解いたこと」と取り違える危険を指摘した。

### ネオブルータリズム / ベントー

- neobrutalism-components（★5.6k、shadcn ベース）は根強い人気がある。
- ベントーはマーケティングサイトの定番になったが、目新しさは薄れている。
- どちらも主流ではなく、テーマの選択肢の 1 つという位置づけ。

## 3. 新ライブラリへの示唆

**【賭ける】**

1. **トークンの正本は DTCG 2025.10 の JSON と CSS カスタムプロパティにする。**
   - Tailwind / StyleX / Panda は、そこから書き出す先（出力アダプタ）として扱う。
   - 色は OKLCH で持ち、派生色は relative color / color-mix() / light-dark() で作る。
   - Linear のように、少ない入力から全テーマを生成する。
2. **Tailwind は使うが、差し替えられる構造にする。**
   - shadcn の `cn-*` 意味クラス + スタイル CSS の方式で、見た目の層を分ける。
   - `tailwindcss canonicalize` は、AI が生成したクラスの正規化に使える。
3. **オーバーレイ系は、Popover API + anchor positioning + invoker commands を基本にする。**
   - 3 つとも Baseline に入っている。
   - Floating UI は、古いブラウザ向けのフォールバックに下げる。
   - a11y とフォーカスの管理は、ヘッドレス層の担当と調整が必要（[02-headless-primitives.md](02-headless-primitives.md) の、React Aria が挙げた 5 つの理由を参照）。
4. **モーションは CSS を基本にする。**
   - @starting-style / transition-behavior / 同一ページ内の View Transitions / sibling-index() を使う。
   - 時間・イージング・キーボード操作では動かさない、などのモーションのルールを、エージェント用のスキルや AGENTS.md として同梱する。

**【1〜2 年後に効く】**

5. **段階的強化の層を今から書いておく。**
   - 対象: customizable select / closedby / popover=hint / scroll-driven animations / cross-document View Transitions / corner-shape / @function
   - 例: `@supports (appearance: base-select)` が通るブラウザでだけ、ネイティブの select をスタイルする。
6. **style queries（2026-05 に Baseline）で、バリアントや密度を CSS 変数として伝える。** cva や tailwind-merge の実行時コストと、Tailwind の更新への追従作業を減らせる。

**【避ける】**

7. **Chromium にしかない機能を必須にしない。** 対象は interestfor / reading-flow / gap decorations / scroll-state queries / CSS だけのカルーセル / if()。
8. **実行時の CSS-in-JS と Pigment CSS は使わない。** Tailwind 以外の基盤を選ぶなら、StyleX か Panda 2.0。特に StyleX は「エージェントが書くコードを縛りやすい」という点で評価が上がっている。
9. **個人の趣味プロジェクトや、長くベータのままのものに深く依存しない。**
   - 対象: vaul（unmaintained）、cva 1.0（2 年ベータ）。
   - バリアントを組み立てる関数は、薄いものを自前で持つか、tailwind-variants の lite 版で足りる。

**【ビジュアル】**

10. **既定の見た目を「AI っぽい shadcn 風」から外す。**
    - 最初から複数のスタイルプリセット、密度の切り替え、角の形のトークンを用意する。
    - Liquid Glass は、控えめなブラーとハイライトまでにとどめ、屈折は使わない。コントラストを上げる設定への対応は必須。

## 出典

**Tailwind**

- https://tailwindcss.com/blog/tailwindcss-v4-3
- https://github.com/tailwindlabs/tailwindcss/releases
- https://github.com/tailwindlabs/tailwindcss/blob/main/CHANGELOG.md
- https://tailwindcss.com/docs/compatibility
- https://github.com/tailwindlabs/tailwindcss/pull/19298

**Tailwind Labs の経営**

- https://www.devclass.com/2026/01/08/tailwind-labs-lays-off-75-percent-of-its-engineers-thanks-to-brutal-impact-of-ai/
- https://ppc.land/tech-giants-rush-to-sponsor-tailwind-css-after-devastating-layoffs/
- https://thenewstack.io/tailwind-creator-says-ai-played-a-role-in-downsizing/

**バリアント管理**

- https://github.com/dcastil/tailwind-merge/releases
- https://github.com/heroui-inc/tailwind-variants/releases
- https://www.npmjs.com/package/cva

**代替技術**

- https://panda-css.com/blog/panda-css-v2
- https://engineering.fb.com/2025/11/11/web/stylex-a-styling-library-for-css-at-scale/
- https://linear.app/now/styling-linear-for-the-future-stylex
- https://blog.openreplay.com/first-look-astryx-meta-design-system/
- https://mui.com/blog/2026-and-beyond/
- https://opencollective.com/styled-components/updates/thank-you

**デザイントークン**

- https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
- https://www.designtokens.org/tr/2025.10/
- https://github.com/style-dictionary/style-dictionary/blob/main/CHANGELOG.md
- https://www.figma.com/blog/schema-2025-design-systems-recap/

**Web プラットフォーム**

- https://web.dev/blog/interop-2026
- https://wpt.fyi/interop-2026
- https://webstatus.dev
- https://github.com/mdn/browser-compat-data
- https://github.com/web-platform-dx/web-features
- https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/
- https://chromiumdash.appspot.com/schedule
- https://github.com/mozilla/standards-positions/issues/1181
- https://github.com/WebKit/standards-positions/issues/464

**ビジュアルトレンド**

- https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- https://linear.app/now/linear-liquid-glass
- https://linear.app/now/behind-the-latest-design-refresh
- https://linear.app/now/output-isn-t-design
- https://emilkowal.ski/ui/agents-with-taste
- https://emilkowal.ski/ui/you-dont-need-animations
- https://www.claude.com/blog/improving-frontend-design-through-skills
- https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/styles

**数値**

- npm ダウンロード数: api.npmjs.org（2026-10 中旬の 1 週間）
- GitHub: GitHub API（2026-10-22）

# 01. shadcn/ui 本体の現状と進化（2024〜2026年10月）

> **数値の注意（2026-10-22 追記）**: 本文の npm 週間 DL で「2026-10-12〜18」の週を使っている値は、npm API の欠損（10/13〜15 の 3 日間、全パッケージ 0）により **約 45% 少なく出ている**。正確な値は [08-metrics.md](08-metrics.md)（2026-09-28〜10-04 の週）を参照。例: shadcn CLI 745 万 → 実際は約 1,336 万、@base-ui/react 1,085 万 → 1,927 万、tailwindcss 8,470 万 → 1.63 億。同じ週どうしの比較（どちらが多いか）は有効だが、前年比は過小評価になっている（shadcn CLI は 17 倍ではなく約 40 倍）。

調査日: 2026-10-22。一次情報は公式 changelog 原稿（GitHub `apps/v4/content/docs/changelog/*.mdx` 全件）、CLI/Skills/MCP docs、GitHub Releases・Issues、npm API。数値は断りがなければ 2026-10-22 時点。

## 1. 要約

- shadcn/ui は 2 年で「コピペ用コンポーネント集」から、**コード配布基盤（registry + CLI + MCP + GitHub レジストリ）＋ デザインシステム生成器（`shadcn create`・プリセット・8スタイル）＋ プリミティブ選択層（Radix / Base UI / React Aria）＋ AI 向け UI キット（Chat 系・Trace・AI Elements）** に変わった。
- 2026 年の転換点:
  - 3 月: CLI v4（Skills・`--preset`・`--diff`）
  - 7/2: Base UI がデフォルトに（Radix も継続）。React Aria を 3 つ目のベースとして追加
  - 9 月: `clsx` + `tailwind-merge` を自作の `cn` パッケージに置き換え
  - 10 月: AI Elements（21 パターン）を出し、Vercel の AI SDK Elements を置き換えると宣言
- 見た目の画一化は本人も認めている。対策はスタイル 8 種（Vega / Nova / Maia / Lyra / Mira / Luma / Sera / Rhea）とプリセット。
- アップデート問題は構造的に未解決。`update` コマンドはなく、「`add --diff` で差分を見て、AI エージェントにマージさせる」という方針。
- 依存ライブラリの弱点:
  - vaul はメンテ停止を明言
  - cmdk の最終リリースは 2025-03
  - Recharts v3 への対応は約 9 か月遅れた
  - react-resizable-panels v4 と react-day-picker v10 で壊れた件が未解決
- 規模: GitHub スター 126,149、open issue 792、open PR 987。レジストリ索引に 479 件。作業は作者 1 人に集中している（リリースノートの大半が @shadcn 本人）。

## 2. 時系列

| 時期 | 主な変更 |
|---|---|
| 2024-08 | CLI を全面書き直し（`npx shadcn init`）。URL からの追加、registry スキーマ |
| 2024-10 | Sidebar（部品 25 個）。React 19 / Next 15 に対応 |
| 2024-11〜12 | new-york スタイルのアイコンを Lucide に。モノレポ対応 |
| 2025-02 | Tailwind v4 / React 19 のプレビュー。forwardRef 廃止、`data-slot` 追加、色を HSL→OKLCH に。`default` スタイルと `toast` を非推奨（→ sonner） |
| 2025-03 | tailwindcss-animate → tw-animate-css |
| 2025-04 | 2.5.0「resolve anywhere」（ファイルをどこに置いても解決できる）。MCP 初版 |
| 2025-06 | Calendar を React DayPicker 新版に。`migrate radix`（radix-ui 統合パッケージへの移行） |
| 2025-07 | ローカル JSON からの追加。Universal item（フレームワークに依存しない任意ファイルの配布） |
| 2025-08 | **CLI 3.0**: 名前空間 `@registry/name`、認証付きプライベートレジストリ、view / search / list、MCP 刷新、依存解決エンジンを書き直し |
| 2025-09〜10 | Registry Index / Directory。新コンポーネント 7 つ（Spinner, Kbd, Button Group, Input Group, Field, Item, Empty） |
| 2025-12 | **`npx shadcn create`**。スタイル 5 種（Vega, Nova, Maia, Lyra, Mira）。全コンポーネントを Base UI でも作り直した |
| 2026-01 | Base UI 版の docs。RTL 対応（CLI がインストール時に `ml-4` などを `ms-4` などの論理プロパティに変換） |
| 2026-02 | Blocks を両ベースで提供。new-york も radix-ui 統合パッケージへ |
| 2026-03 | **CLI v4**: shadcn/skills、`--preset`、`--dry-run` / `--diff` / `--view`、`init --template`（Next / Vite / TanStack Start / React Router / Astro / Laravel）、`info`、`docs`、`registry:base` / `registry:font`。Luma 追加。Recharts v3 対応（3/23） |
| 2026-04 | Composition 節（ツリー図で AI に入れ子の正しい組み方を教える）。`apply`（`--only theme,font` で一部だけ適用）、`preset decode/resolve/url/open`。Sera 追加。`--pointer` |
| 2026-05 | `package.json#imports` 対応、target alias、registry の `include` / `validate`、Rhea 追加、`eject` |
| 2026-06 | **GitHub Registries**（`owner/repo/item` の形式で、ビルドなしで配布）。**Chat 系**（MessageScroller, Message, Bubble, Attachment, Marker）。**@shadcn/react**（ヘッドレス部品） |
| 2026-07 | **Base UI がデフォルトに**（4.13.0）。React Aria を 3 つ目のベースに。Toast（Base UI 版）。typeset。@shadcn/helpers（AI SDK の会話を決まった結果で再現するモック）。Dynamic Search |
| 2026-08 | Questionnaire。Human-in-the-loop のモック。プライベート GitHub レジストリ（gh 認証または GH_TOKEN） |
| 2026-09 | **`cn` パッケージ**（Aiden Bai と共作、README では「30 倍高速」と主張）。`migrate cn` |
| 2026-10 | `@shadcn/registry`（CLI の解決エンジンを別パッケージに分離）。Zod 4 へ移行。**Trace / Code Block / AI Elements** |

## 3. 現在のアーキテクチャ（リポジトリの実装から確認）

### ベース × スタイルの掛け算生成

- 手で書かれているのは「ベース（base / radix / aria）ごとの実装」と「スタイルごとの CSS（`style-*.css`）」だけ。
- コンポーネントのクラスは `cn-button-variant-default` のような意味名のプレースホルダーになっている。ビルド時に、選んだスタイルのユーティリティクラスへ展開される。
- 「テーマを超えて、コンポーネントのコード自体を書き換える」の実体はこれ。
- 組み合わせは 3 ベース × 8 スタイル = 24 通り。これに旧 new-york-v4 が加わる。

### 既定値とプリセット

- 既定値（`config.ts` の `DEFAULT_CONFIG`）: base = Base UI、style = nova、色 = neutral、アイコン = lucide、フォント = Inter、テンプレート = next。
- プリセットは、次の設定を 1 つの短いコードにまとめたもの:
  - style、baseColor、theme、chartColor
  - アイコン（lucide / tabler / hugeicons / phosphor / remixicon）
  - 本文フォント・見出しフォント
  - radius、menuAccent、menuColor

### コンポーネント数

- Base UI 版は 64 個（`ui/*.tsx`）。うち 40 個が `"use client"`。

## 4. レジストリ（配布）の進化

- **スキーマ**: `registry.json` と `registry-item.json`。型は ui / block / style / base / font / file / item など。
- **置き場所**: target alias で任意の場所に置ける。
- **名前空間と認証**: `@ns/item` 形式。中央の登録機関はない。認証は Bearer / Basic / API キー / 任意ヘッダー。
- **探索**: Index / Directory に 479 件。`search` はサーバー側で検索する。
- **GitHub リポジトリをそのままレジストリにできる**（非公開も可）。配布できるのは UI 部品に限らず、AGENTS.md、CI ワークフロー、codemod も公式が例示している。
- **利用規模**:
  - shadcn.com によると、公式レジストリだけで月 4,500 万回インストールされている。
  - CLI（npm `shadcn`）は週 745 万 DL（2026-10-12〜18）。

## 5. AI 対応

- **MCP サーバー**: 2025-04 に初版、2025-08 に刷新。`mcp init` で Claude Code / Cursor / VS Code / Codex / OpenCode 向けの設定を作れる。
- **shadcn/skills**（`npx skills add shadcn/ui`）:
  - `shadcn info --json` でプロジェクト構成をエージェントに渡す。
  - 「`FieldGroup` を使う」「色はセマンティック名で指定する」といった組み立てのルールを守らせる。
- **AI 向けドキュメント**: Composition のツリー図、各ページの `.md` 版、`shadcn docs <comp>`。
- **Radix → Base UI の移行は codemod ではなく Skill で行う**:
  - 理由:「利用者がコードを改変しているので、機械的には変換できない」。
  - やり方: 1 コンポーネントにつき 1 コミット。`.migration/*.md` にレポートを残す。
  - 公式の実測: 60 個以上のコンポーネントで約 25 分、1 コンポーネントあたり約 1 万トークン。
- **AI Elements**（21 パターン）:
  - 内容: Chat、Prompt Input、Reasoning、Tool、Plan、Subagent など。
  - 配布: パッケージではなくコピー型。
  - 作り直さなかったもの: React Flow 系、Persona、Web Preview など（理由は「利用が少ない」）。
  - AI SDK Elements の扱い: changelog では「置き換え・非推奨にする予定」としているが、docs 本体には非推奨の時期が書かれていない。

## 6. 設計原則と普及理由

### 公式の原則

- 5 原則: Open Code / Composition / Distribution / Beautiful Defaults / AI-Ready。
- 冒頭の宣言: 「This is not a component library. It is how you build your component library.」

### 普及した理由（事実）

- Radix のアクセシビリティ、Tailwind、「コードを自分で所有できる」ことの組み合わせ。
- 作者は Vercel の AI チームのデザインエンジニアで、v0 の共同作者。
- shadcn.com は「Built for AI」「ChatGPT / Claude / Gemini 等で利用可能」と打ち出している。
- Clerk、Auth0、Algolia などの企業も shadcn のレジストリ形式で配布しており、使う人が増えるほど価値が上がる（ネットワーク効果）。

### 推測

- AI が生成したコードが学習データに戻ることで、「LLM のデフォルト」という地位が自己強化されている。

## 7. 依存の健全性

| 依存 | 現状 |
|---|---|
| @base-ui/react 1.9.0 / radix-ui 1.8.1 / react-aria-components 1.22.1 | いずれも活発。Radix 版の Combobox も中身は Base UI |
| cva | 活発。17 ファイルで使われている |
| `cn`（clsx と tailwind-merge を置き換え） | 新しいパッケージ。週 681 万 DL。#11854 で回帰報告あり（`aliases.utils` が無視され、`extendTailwindMerge` の設定が黙って効かなくなる） |
| vaul（Radix 版 Drawer） | **README でメンテ停止を明言**。Base UI 版の Drawer は Base UI Drawer に移行済み |
| cmdk（両ベースの Command） | 最終リリースは v1.1.1（2025-03）。内部で Radix に依存（#9191） |
| recharts 3.8 | v3 対応は 2026-03 まで遅れた。性能の不満から @tanstack/charts を求める声（#11460） |
| react-day-picker / react-resizable-panels | v10 で型が壊れる（#10690）、v4 で動かない（#9136）。どちらも未解決 |
| sonner / next-themes / embla / input-otp / date-fns / lucide / tw-animate-css | 必要に応じて使用。next-themes は React 19 で script 警告が出る（#10104） |

## 8. 弱点・課題

1. **アップデート**
   - 公式の説明:「振る舞いの層は依存の更新で直る。見た目の層は利用者が所有するもの」。
   - CLI に `update` はなく、インストールしたバージョンやハッシュも記録していない。
   - 手段は `add --diff`、エージェントへの「check for updates and merge」という依頼、各種 `migrate`（radix / rtl / icons / base-color / cn）。
2. **画一化**
   - 本人の言葉:「all apps started looking the same… the defaults were a little too good. My bad.」
   - スタイルを 8 種にしたが、2026 年も批評記事が続いている。
3. **複雑なコンポーネントの不在**
   - Data Table は TanStack を使う「作り方ガイド」のまま。
   - Date Picker は Popover と Calendar の組み合わせで、キーボードで日付を入力できない（#5220）。
   - Multi-select（#66、👍220、最多）は open のまま。ただし Base UI 版 Combobox は `multiple` とチップ表示に対応した。
   - Tree、仮想スクロール、Stepper、Dropzone、Color Picker、リッチテキストは公式にない。File Tree は AI Elements の中にだけある。
4. **アクセシビリティ**
   - 第三者による監査（2026-04、Radix 版、ソースは 1 件のみ）で、48 個中 34 個が WCAG 2.2 AA にそのまま合格。
   - 不合格の例: Combobox の ARIA 属性、Data Table の告知、Chart の代替テキスト、フォーカスリングのコントラスト。
5. **RSC**
   - 64 個中 40 個がクライアントコンポーネント。
   - NavigationMenu は `"use client"` がないと、エラーを出さずに表示されない（#8378）。
6. **運営・セキュリティ**
   - open PR が 987 件。
   - 2026-09 に、PR へのマルウェア混入が報告された（#11971）。
   - レジストリは任意のファイルを任意の場所に書き込める。公式も「インストール前に中身を確認するように」と注意している。
7. **組み合わせ爆発**
   - 3 ベース × 8 スタイル × テンプレートを抱える負担が大きい。
   - docs のデモが動かない、レジストリが 404 になる、という報告が繰り返し出ている（#9405、#10065）。

## 9. 本人の発言・方向性

- 「the worst thing you can do for your production app is switch component libraries」と語っている。
  - そのため Radix から Base UI へ切り替えるのではなく、両方を作って利用者に選ばせた。
  - shadcn/create の利用者が Base UI を 2:1 で選んだことを、デフォルト変更の根拠にしている。
- Rhea を独立したスタイルにした理由:「`--spacing` を変えると `p-2` などのユーティリティの意味が変わってしまう。予測しやすさを守るため」。
- Vercel CEO の Guillermo Rauch は Chat 系の発表を受けて「The UI for AI is here. It's @shadcn」と投稿した（InfoQ）。
- 【推測】今後の方向:
  - 振る舞いの層を自分で持つ（@shadcn/react）
  - 配布エンジンを汎用化する（@shadcn/registry、GitHub レジストリ）
  - エージェント UI の標準部品を押さえる
  - 足回りのパッケージを内製する（cn）
- shadcn.com には「shadcn/ds（デザインツール向けコンポーネント）」の記述があるが、中身は未確認。

## 10. 新ライブラリへの示唆

1. **【突く】アップデートできる「所有」モデル**: インストール時のバージョンとハッシュを lockfile に残す → 3-way merge → 衝突は AI が解決する。この流れを最初から用意する。shadcn にはまだ `update` がない。
2. **【突く】複雑なコンポーネント**: 仮想化対応のデータグリッド、キーボードで入力できる日付・時刻フィールド、Tree、Multi-select、Dropzone、Stepper、ドラッグ＆ドロップ。振る舞いはテスト済みのパッケージにし、見た目だけをコードとして渡す。
3. **【突く】アクセシビリティを検証できる形で売りにする**: コンポーネントごとに WCAG 2.2 の自動・手動テスト結果を公開する。デフォルトのフォーカスリングでコントラスト基準を満たす。
4. **【突く】依存を最小限にし、健全なものだけ使う**: vaul や cmdk のような、個人が趣味で保守しているライブラリに頼らない。重要な振る舞いは自前で持つか、活発なヘッドレス層を使う。
5. **【真似る】registry スキーマとの互換**: `npx shadcn add @yours/x` で入るようにすれば、479 件のエコシステムと MCP / Skills にそのまま乗れる。正面から競合するより相乗りするほうが普及コストは低い。
6. **【真似る】意味名プレースホルダー＋インストール時のスタイル展開**: shadcn は公式 8 スタイルに限られている。利用者がスタイルを自分で作って配布できるようにすれば差別化になる。
7. **【真似る】AI 向けの道具一式**: Composition ツリー、各ページの `.md` 版、`info --json`、Skills、会話を決まった結果で再現するモック。さらに一歩進めて、誤った組み立てを lint や型が「エラー」として返すようにし、エージェントが docs を読まなくても気づけるようにする。
8. **【真似る】codemod ではなく Skill で移行する**: 「改変済みのコードは機械的に移行できない」という前提に立った設計は理にかなっている。
9. **【避ける】**
   - ベース × スタイル × テンプレートの組み合わせを無制限に増やすこと。
   - 作者 1 人への集中。
   - PR やレジストリ経由のサプライチェーン攻撃に無防備なこと。署名や出所証明（provenance）、検証済みバッジで防ぐ。
10. **【避ける】クライアントコンポーネントだらけ＋Tailwind に強く縛られる構成**: サーバーで描画できる部品を増やし、トークンは CSS 変数を正とする。

## 出典

- Changelog: https://ui.shadcn.com/docs/changelog （原稿 https://github.com/shadcn-ui/ui/tree/main/apps/v4/content/docs/changelog ）
  - https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
  - https://ui.shadcn.com/docs/changelog/2026-07-react-aria
- Introduction: https://ui.shadcn.com/docs
- CLI: https://ui.shadcn.com/docs/cli
- Skills: https://ui.shadcn.com/docs/skills
- MCP: https://ui.shadcn.com/docs/mcp
- Directory: https://ui.shadcn.com/docs/directory 、 https://ui.shadcn.com/r/registries.json
- AI Elements: https://ui.shadcn.com/docs/ai-elements
- Releases: https://github.com/shadcn-ui/ui/releases
- Registry README / config:
  - https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/README.md
  - https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/config.ts
- cn: https://github.com/shadcn-ui/cn
- vaul: https://github.com/emilkowalski/vaul
- cmdk: https://github.com/dip/cmdk
- Issues（https://github.com/shadcn-ui/ui/issues/<番号>）: #66, #5220, #8378, #8455, #9136, #9191, #9405, #10065, #10104, #10690, #11460, #11854, #11971
- 作者本人: https://shadcn.com/
- InfoQ:
  - https://www.infoq.com/news/2026/08/shadcn-conversational-primitives/
  - https://www.infoq.com/news/2026/02/shadcn-ui-builder/
- アクセシビリティ監査: https://thefrontkit.com/blogs/shadcn-ui-accessibility-audit-2026
- Radix → Base UI: https://blog.openreplay.com/shadcn-ui-radix-base-ui-switch/
- 画一化の批評:
  - https://vp0.com/blogs/why-does-my-ai-app-look-generic.md
  - https://www.designsystemscollective.com/ai-chose-your-ui-did-it-choose-wrong-b0d30611c724
- 更新の運用: https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components
- npm: registry.npmjs.org / api.npmjs.org（2026-10-12〜18 週次）

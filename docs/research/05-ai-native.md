# 05. AI と UI ライブラリの関係（2026-10-22 時点）

> **数値の注意（2026-10-22 追記）**: 本文の npm 週間 DL で「2026-10-12〜18」の週を使っている値は、npm API の欠損（10/13〜15 の 3 日間、全パッケージ 0）により **約 45% 少なく出ている**。正確な値は [08-metrics.md](08-metrics.md)（2026-09-28〜10-04 の週）を参照。例: shadcn CLI 745 万 → 実際は約 1,336 万、@base-ui/react 1,085 万 → 1,927 万、tailwindcss 8,470 万 → 1.63 億。同じ週どうしの比較（どちらが多いか）は有効だが、前年比は過小評価になっている（shadcn CLI は 17 倍ではなく約 40 倍）。

> 調査の途中で WebSearch の回数上限に達したため、後半は公式 URL の直接取得、npm API、GitHub API で確認した。AAIF の発足日、Claude チャット内の inline visualization、Bolt / Replit の既定スタックは、一次情報で確認できていない。
> 【事実】は一次情報か実測値、【推測】は解釈。npm の数値には CI や依存経由のダウンロードも含まれるので、相対比較の目安として見ること。

## 1. 要約

- **AI が UI ライブラリの最大の利用者になった。**
  - shadcn CLI の npm 週間ダウンロードは、2025-10 の 43 万から 2026-10 の 745 万へ、約 17 倍になった。
  - 月次では 2026-02 から 2026-03 にかけて倍増している。CLI v4（「coding agents のために作った」と明記されたバージョン）の公開と重なる。
  - Claude Code が UI コンポーネントを推薦するとき、shadcn/ui を選ぶ割合は 90.1%。Lovable も公式に shadcn/ui を採用している。
- **「AI に渡すコンテキスト」そのものが製品機能になった。**
  - llms.txt と各ページの .md 版、MCP、Agent Skills（SKILL.md）、プリセット、`shadcn info --json` がその例。
  - デザインシステムの渡し方は「Markdown のスキル＋トークン＋スターター」の形に収束しつつある（v0 Design Systems 2.0、Google DESIGN.md 28.5k★、Figma Make kits、Claude Design）。
- **AI が作る UI の画一化への反発が、スキルやプリセットという商品になった。**
  - shadcn 自身が「all apps started looking the same」と認め、スタイルとプリセットを出した。
  - Anthropic の frontend-design スキルは 100 万インストール。「taste」を掲げるスキルも上位に並んでいる。
  - ただし「避けるべき見た目」を指定すると、それが新しい定番の見た目になり、また禁止される、といういたちごっこが起きている。
- **AI チャット UI は shadcn に集まりつつある。**
  - AI Elements は 2026-10 に shadcn 本体へ移り、Vercel 版は 2026-11 末で非推奨になる。
  - 差別化の場所は、ランタイムやプロトコル対応に移った（assistant-ui は週 120 万 DL、CopilotKit）。
- **Generative UI は 3 つの層に分かれた。**
  - 伝送: AG-UI
  - 宣言的なカタログ: A2UI / json-render
  - サンドボックス内の HTML: MCP Apps
  - MCP Apps は事実上の標準になった（ext-apps は週 340 万 DL）。宣言的カタログはまだ標準が決まっていない。
  - どの陣営も「AI 専用の新しいコンポーネントではなく、既存のデザインシステムをカタログとして使う」と言っている。
- **【推測】これからの UI ライブラリが最初から持つべき 4 点**
  - 機械が読める契約（スキーマ）
  - エージェント向けのコンテキスト
  - 強制の仕組み（lint・型）
  - ホストに合わせられるトークン層

## A. AI が UI ライブラリを「使う」側

### A-1. 既定が shadcn + Tailwind になっていること

**AI ツールがどれを選んでいるか【事実】**

- Claude Code の UI Components カテゴリでは、最初に推薦されるのが shadcn/ui 90.1%（64/71）、Radix 4.2%、その他（MUI・Chakra・Mantine など）5.6%。
  - モデル別では Opus 4.5 が 100%、Opus 4.6 が 86.7%（amplifying.ai）。
  - ただし 2026-07 の claude-fable-5 の更新分では 52% まで下がっており、モデルによる揺れがある。
- Lovable 公式の FAQ によると、既定の構成は React + Vite + TS + Tailwind + shadcn/ui + Radix。
- Anthropic の web-artifacts-builder スキルは React 18 + Tailwind + shadcn/ui で、最初から 40 以上のコンポーネントを入れる。
- v0 の旧デザインシステムガイドは、shadcn の CSS 変数の命名に従うことを前提にしている。

**数字の動き【事実】**

| 指標 | 推移 |
|---|---|
| shadcn CLI 週間 DL | 428,191（2025-10）→ 4,099,222（2026-04）→ 7,450,390（2026-10） |
| 月次 DL | 1.86M（2025-10）→ 3.35M（2026-01）→ 10.99M（2026-03）→ 40.43M（2026-09） |

**裏側で起きたこと【事実】**

- Tailwind Labs は 2026-01 にエンジニアの 75% を解雇した。
  - ドキュメントへの流入は 2023 年はじめから約 40% 減り、売上は約 80% 減った。
  - この発表は、llms.txt を追加する PR を断る流れの中で出た。断った理由は「LLM が docs を読みやすくなるほど、人が docs を見に来なくなる」というもの。
- tailwindcss.com/llms.txt は 2026-10-22 時点でも 404 のまま。

**【推測】**

- shadcn の急伸の大部分は、エージェントが `npx shadcn add` を実行していることによる。
- 「AI が既定にする → 学習データが増える → さらに既定になる」という自己強化のループがある。ただし定量的な研究は見つからなかった。
- ドキュメントで集客して有料キットを売るモデルは、AI 経由の利用では成り立たない。

### A-2. デザインシステムを AI のコンテキストとして渡す仕組み

| 仕組み | 形式・中身 | 時期・規模 |
|---|---|---|
| shadcn MCP | 設定した registry の検索・閲覧・インストール。Claude Code / Cursor / VS Code / Codex に対応 | 2025-08（CLI 3.0） |
| shadcn skills | `npx skills add shadcn/ui`。`shadcn info --json` でプロジェクト構成を読み、組み立てのルール（フォームは FieldGroup、選択肢は ToggleGroup、色はセマンティックカラー）を教える | 2026-03（CLI v4）、271K インストール |
| shadcn CLI v4 | `--preset`（デザイン上の決定を短いコードにまとめる）、`--dry-run` / `--diff`、`shadcn docs`、registry:base / registry:font | 2026-03 |
| llms.txt | shadcn・Base UI・React Aria・Mantine・HeroUI・Ark・Chakra・MUI・AI SDK Elements・assistant-ui はすべて 200（あり）。**Tailwind だけ 404** | 2026-10-22 に実測 |
| ライブラリ公式の MCP | Chakra（`get_component_props`、`get_theme`、`v2_to_v3_code_review` など）、MUI（`@mui/mcp`） | 週 DL は 1.4K / 8.8K と小さい |
| Context7 | バージョンごとのドキュメントを配信 | 63k★、npm 週 168K → 1.0M → 483K |
| AGENTS.md | エージェント向けの README。Linux Foundation 傘下の Agentic AI Foundation が管理 | 6 万以上のプロジェクト |
| Agent Skills | SKILL.md を必要なときだけ読み込む仕組み。Anthropic 発の公開標準 | — |
| v0 Design Systems 2.0 | デザインシステムを **スキル**（SKILL.md + v0.json + スターターアプリ）として保存。取り込み元は GitHub / npm / Figma / Storybook。ルールは「確認できないコンポーネント・props・トークンは使わない」 | 2026-10-21 更新 |
| Figma | MCP + Code Connect（コンポーネントの場所と使い方のガイドラインを渡す）、Make kits（React の npm パッケージ + Guidelines.md） | `@figma/code-connect` 週 664K |
| Google DESIGN.md | YAML のトークンと Markdown の説明を 1 ファイルに書く。`lint`（WCAG AA 4.5:1 のコントラスト）、`diff`、`export`（Tailwind v3/v4、DTCG） | 2026-04、28.5k★、CLI 週 192K、alpha |
| Claude Design | オンボーディング時にコードベースとデザインファイルを読み、デザインシステムを作る。結果をまとめて Claude Code に渡す | 2026-04-17 |

【推測】2026 年の到達点は「デザインシステム = スキル」。中身は、守るべき値（トークン）＋使い方の説明＋Do's/Don'ts＋動くスターター。MCP は API として最新の情報を返せるが、実際の利用量は skills と llms.txt のほうが多い。

### A-3. 「AI が使いやすいライブラリ」の条件

| 条件 | 根拠・実装例 |
|---|---|
| ソースがプロジェクト内にあり、読めて直せる | shadcn のコピー配布。AI Elements の「There is no package to install」 |
| モデルが学習済みの語彙を使う | Tailwind / React / Radix は学習量が多い |
| API が機械可読 | 型、Zod / JSON Schema、MCP の `get_component_props` |
| プロジェクトが自分の状態を説明できる | `shadcn info --json`（フレームワーク、ベース、エイリアス、導入済みコンポーネント） |
| 選べる値を絞り、意図で名前を付ける | Polar Orbit は `p-4` ではなく `padding="l"` という「決定」を書かせる。assistant-ui はトークンを enum で固定（`BUTTON_STYLES: primary/secondary/outline/ghost/danger`） |
| 決められた結果になるよう強制する | Orbit:「Docs are a suggestion. CI is a contract.」生の `<div>` を lint で禁止。DESIGN.md も lint を持つ |
| 例が豊富で、組み立てのルールが文章になっている | shadcn skills の組み立てルール |
| 変更を安全に当てられる | `--dry-run` / `--diff`、パターンごとのページにある移行用プロンプト |

よくある失敗: 存在しない variant を使う、spacing を勝手に決める、定義されていないトークンを使う（MUI のブログ）。

### A-4. 画一化（"AI slop"）への反発と対策

**Anthropic【事実】**（2025-11-12）

- 原因を「distributional convergence」と説明している。指示がないと、学習データの中で最も多い無難なデザインに寄っていく。
- 避けるべきものとして、Inter / Roboto / Arial、白背景に紫のグラデーションを挙げている。
- web-artifacts-builder スキルにも「中央寄せの多用、紫グラデーション、どこも同じ角丸、Inter」を避けるよう書かれている。

**frontend-design スキルの現行版【事実】**

- 新しい定番の見た目として、次の 5 つを名指しで避けさせている。
  - クリーム色（#F4F1EA）＋セリフ体＋テラコッタ色（#D97757、Anthropic 自身のアクセント色）
  - ほぼ黒＋酸性グリーン
  - 新聞紙面風のレイアウト
  - 同じカードが並ぶ SaaS 風の構成
  - 全部大文字の eyebrow（見出しの上の小さなラベル）と「→」付きのリンク
- つまり、2025 年の「slop 対策」として広まった見た目が、次の slop になった。

**shadcn【事実】**

- shadcn create（2025-12）の発表で「all apps started looking the same」「the defaults were a little too good」と認めた。
- 5 つのスタイル（Vega / Nova / Maia / Lyra / Mira）を出した。これは色の差し替えではなく、コンポーネントのコード自体を書き換える。
- その後 Luma（2026-03）、Sera（2026-04）、Rhea（2026-05）を追加。2026-04 からはプリセットを短いコードで共有できる。

**市場の反応【事実】**（skills.sh の通算インストール数）

| スキル | インストール数 |
|---|---|
| frontend-design | 1.0M |
| ui-taste | 708K |
| design-taste-frontend | 654K |
| emil-design-eng | 375K |
| impeccable | 351K |

「taste（センス）」が 1 つの商品カテゴリになっている。

【推測】勝つのは、見た目の多様さを「形容詞を並べたプロンプト」ではなく、**構造化された設定**（preset / DESIGN.md）として持ち運べるライブラリ。

## B. AI 製品を作るための UI コンポーネント

| 名称 | 形態 | 指標（2026-10） | 1 年前 | 動向 |
|---|---|---|---|---|
| shadcn のチャット / AI 部品 | registry（コピー）＋ヘッドレスの `@shadcn/react` | — | — | 2026-06: MessageScroller / Message / Bubble / Attachment / Marker。2026-08: HITL（人間の承認）のモック。2026-10: Trace / Code Block / AI Elements の 21 パターン。Vercel の Rauch は「The UI for AI is here. It's @shadcn」 |
| AI Elements（Vercel 版） | shadcn registry | 2.5k★、CLI 週 59.8K | 6.2K | **2026-11 末で非推奨になり、shadcn へ移管** |
| assistant-ui（YC） | ライブラリ＋shadcn テーマ | 12.7k★、週 **1.20M** | 120K | ランタイム（AI SDK / LangGraph / AG-UI / A2A）、生成 UI の仕様、Slack Block Kit / Teams Adaptive Cards への変換、MCP Apps と A2UI のレンダラー |
| CopilotKit | フルスタック＋AG-UI | 38.2k★、週 258K | 53K | 2026-05 に $27M の Series A。「Fortune 500 の過半数が使っている」（自社発表） |
| Vercel AI SDK（`ai`） | ランタイム | 週 18.35M | 3.72M | — |
| streamdown | ストリーミング対応の Markdown 描画 | 5.7k★、週 **4.35M** | 189K | — |
| Vercel Chat SDK（`chat`） | Slack / Teams / Discord / WhatsApp などへ同時配信 | 2.4k★、週 2.13M | ほぼ 0 | 2026-02 ベータ、2026-03 正式版。承認ボタンのフローあり |
| OpenAI Apps SDK UI | Radix + Tailwind 4 のトークン | 964★、週 315K | 0 | ChatGPT のコンテナに合わせた見た目 |
| OpenAI ChatKit | JSON で書くウィジェット（Card / ListView / Form / DatePicker など） | 2.0k★、週 49K | — | Widget Builder で作り、サーバーから JSON を返す |
| prompt-kit / Kibo UI | shadcn registry | 3.1k★ / 4.0k★ | — | Kibo は 2025-10 に shadcnblocks が買収 |
| tambo / OpenUI（Thesys） | 生成 UI の SDK | 11.2k★ / 12.9k★ | — | 週 DL は 6.9K / 185K。★の数と実際の利用量が合っていない |

【事実＋推測】

- 汎用のチャット UI は shadcn に吸収され、どこでも手に入るものになった。
- 新しい定番は「チャット」ではなく**エージェントの作業ログ UI**。AI Elements の 21 パターンには、Trace / Tool / Reasoning / Plan / Queue / Subagent / Checkpoint / Confirmation（HITL）/ Context（トークン使用量）/ Terminal / Test Results / Inline Citation などがある。
- 出力先は Web の外にも広がっている（Slack、Teams、モバイル）。
- GitHub の★と実際の利用量は大きくずれる。

## C. Generative UI / エージェントが UI を返すプロトコル

CopilotKit は、エージェントが UI を返す方式を 3 つに分けている。

| 種類 | 中身 | 例 |
|---|---|---|
| Controlled（静的） | アプリ側のコンポーネントを型付きで呼び出す | AG-UI で伝送 |
| Declarative | エージェントがカタログ内の部品で UI ツリーを組み立てる | A2UI、Open-JSON-UI |
| Open-ended | エージェントが HTML まで書く | MCP Apps |

Google Gemini の dynamic view（プロンプトごとに UI のコード全体を書く）は、Open-ended のいちばん端にあたる。

| 方式 | 主導 | UI の実体 | 見た目を決めるのは | 状況・指標 |
|---|---|---|---|---|
| **MCP Apps（SEP-1865）** | Anthropic + OpenAI + MCP-UI | `ui://` の HTML を、サンドボックス化した iframe で表示。通信は JSON-RPC | サーバー側。ホストからテーマと**標準の CSS 変数**を受け取る | 2026-01-26 に、MCP 初の公式拡張として Stable。Claude / ChatGPT / VS Code / Goose などが対応。ext-apps は週 **3.40M**（月次は 2025-12 の 0.24M → 2026-09 の 16.65M） |
| OpenAI Apps SDK | OpenAI | MCP Apps と互換。`window.openai`（checkout、ファイル、modal）は独自の追加機能 | ガイドラインで制約される | OpenAI 自身が、新しいアプリは MCP Apps の標準キーで作るよう勧めている |
| **A2UI** | Google → a2ui-project | JSON。クライアントが持つ**カタログ**（JSON Schema、`catalogId` で合意） | クライアント側 | v0.9（2026-04-17）が安定版、v1.0 は RC。レンダラーは Lit / Angular / React / Flutter。伝送は MCP / WS / AG-UI / A2A。16.8k★。週 DL は lit 181K / react 91K |
| **json-render** | Vercel Labs | Zod で書くカタログ＋registry＋フラットな仕様。ストリーミングで差分を当てる | クライアント側 | 2026-01 公開、18.7k★。core は週 **1.23M**（1 月末は 19K）。React / Vue / Svelte / RN / PDF / Email に対応。shadcn の 36 部品パッケージあり。MCP Apps 連携あり。A2UI にも PoC で対応 |
| OpenUI（Thesys） | Thesys | 独自 DSL「OpenUI Lang」 | クライアント側 | 自社ベンチマークで、JSON より最大 67% 少ないトークンで書けるとしている |
| **AG-UI** | CopilotKit | イベント型の伝送プロトコル（UI の仕様ではない） | — | MS Agent Framework / Google ADK / AWS Strands・AgentCore / Mastra / Pydantic AI などが標準で対応。`@ag-ui/core` は週 1.69M（1 年前は 130K） |
| ChatKit widgets / Open-JSON-UI | OpenAI | JSON のウィジェット | クライアント（ChatKit） | Open-JSON-UI は CopilotKit 側の説明しかなく、OpenAI の一次情報は見つからない |

### 事実上の標準になりつつあるもの

- サンドボックス HTML は **MCP Apps で決まった**。伝送は **AG-UI** が優勢。
- 宣言的なカタログは、まだ決まっていない。
  - 仕様の中立性と多言語のレンダラーでは A2UI が強い。
  - 開発者の採用量では json-render が強い。
- 両者に共通する要素:
  - カタログはクライアント側が持つ
  - スキーマで検証する
  - ストリーミングで描画する
  - アクションと状態を結び付ける（バインディング）
- A2UI v0.9 は「Frontend developers don't want new components. They already have a design system」と明言している。
- 【推測】カタログの形式は JSON Schema（Zod から生成）に寄っていく。

### 実証データ【事実】（assistant-ui の自社評価）

- 宣言的な仕様は、どのモデルでも「present ツリー」方式と同等以上だった。
- 計算が中心の課題では、サンドボックスのウィジェットのほうが良かった。
- 総合では Markdown が最も良いモデルもあった（Opus 5.5、Gemini 3.1 Pro）。
- このため assistant-ui は「どの形式で答えるかをモデルに選ばせる」設計にしている。

### UI ライブラリ設計への要求

1. **スキーマ化**: props を Zod / JSON Schema として書き出し、カタログとプロンプトを自動で作れるようにする（`catalog.prompt()`）。
2. **シリアライズ可能な props**: 関数や ReactNode を props に渡さない。アクションは「名前＋payload」で、状態は参照パス（`$state` / `$bindState`）で表す。
3. **ストリーミングに強いこと**: props が途中までしか届いていなくても壊れない。
4. **サンドボックスで動くこと**
   - CSP の既定が `default-src 'none'` なので、外部フォントや CDN に頼らない。
   - サイズが変わったら `size-changed` で通知する。
   - 表示モード（inline / fullscreen / pip）、safe area、タッチかホバーかの違いに対応する。
5. **テーマを受け取れること**: MCP Apps の標準 CSS 変数（`--color-background-primary`、`--color-text-secondary`、`--font-sans`、`--font-heading-lg-size`、`--border-radius-md`、`--shadow-sm` など）を、そのまま受けられるトークン層を持つ。
6. **ホストになじむこと**: ChatGPT のガイドラインは次のように定めている。ブランドを出せるのはアクセント色とアイコンだけになる。
   - システムフォントを使い、カスタムフォントは使わない
   - システムの色を上書きしない
   - 1 枚のカードに置くアクションは 2 つまで
   - スクロールの入れ子は禁止
   - カルーセルは 3〜8 件

## 3. 示唆: AI ネイティブな UI ライブラリの機能（【推測】）

1. **3 層に分けて配る**
   - テスト済みの振る舞いを持つヘッドレスのパッケージ
   - registry からコピーするスタイル層
   - 全ページの `.md` 版と llms.txt
   - あわせて CLI に `info --json` と `docs <component>` を用意する。shadcn はこの形を完成させつつある。
2. **公式の Agent Skill と MCP を最初から同梱する**
   - SKILL.md には、組み立てのルール、禁止事項、トークンの一覧、良い例と悪い例を書く。
   - MCP は search / props / examples / add / diff を提供する。
   - どちらもライブラリのリリースに合わせてバージョンを上げる。
3. **コンポーネントごとに機械可読のマニフェストを持つ**
   - 中身: props のスキーマ、イベント、使う場面と使わない場面、a11y の要件、使用例。
   - ここから A2UI のカタログ、json-render のカタログ、MCP の props、Figma Code Connect を**自動で書き出す**。
4. **生成 UI 用のカタログとレンダラーを公式で出す**
   - props はシリアライズ可能にし、アクションと状態は参照パスで表す。
   - ストリーミング中の部分的な描画に対応する。
   - 書き出しは `catalog export --format a2ui|json-render` のようにする。
5. **トークンを閉じて、意図で名前を付け、強制する**
   - 使えるのはセマンティックトークンだけにし、生の値は型と lint で禁止する。CI 用のルールも付ける。
   - DESIGN.md / DTCG 形式で読み込み・書き出しできるようにする。
   - 「Docs are a suggestion, CI is a contract」。
6. **host mode を持つ**
   - MCP Apps の `hostContext.styles` や ChatGPT のガイドラインに、自動で合わせるアダプタを用意する。
   - iframe と CSP の制約の中で動き、自動リサイズと表示モードに対応する。
7. **プリセット・スタイルを最初から主要機能として扱う（AI slop 対策）**
   - 形・密度・タイポグラフィ・モーションを、コードの書き換えとして当てられるようにする。
   - プリセットは短いコードで共有でき、エージェントが切り替えられるようにする。
   - 既定を 1 つに固定しない。
   - スキルに「生成する前に、ブリーフからトークンの計画を立てる」手順を入れる。
8. **エージェントの作業 UI の部品をそろえる**
   - Trace / Tool / Reasoning / Plan / Queue / 承認（HITL）/ Context メーター / Diff / Terminal / Citation。
   - 特定のプロバイダや伝送方式には依存しない。AI SDK / AG-UI / A2A にはアダプタで対応する。
9. **1 つの仕様から複数の出力先へ変換する**: Web / React Native / Slack Block Kit / Teams Adaptive Cards / Email。
10. **評価の仕組みを付ける**
    - 生成されたコードと仕様をチェックする lint
    - 見た目の回帰テスト
    - モデルごとの正答率ベンチマーク（assistant-ui の答え方の形式ごとの評価のようなもの）

## 出典

- **shadcn**:
  - https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
  - https://ui.shadcn.com/docs/skills.md
  - https://ui.shadcn.com/docs/mcp
  - https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create
  - https://ui.shadcn.com/docs/changelog/2026-06-chat-components
  - https://ui.shadcn.com/docs/changelog/2026-10-ai-elements
  - https://infoq.com/news/2026/08/shadcn-conversational-primitives
- **AI ツールの既定**:
  - https://amplifying.ai/tech/shadcn-ui
  - https://lovable.dev/faq/capabilities/tech-stack
  - https://github.com/anthropics/skills/blob/main/skills/web-artifacts-builder/SKILL.md
  - https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
  - https://claude.com/resources/articles/improving-frontend-design-through-skills
- **Tailwind Labs の解雇**:
  - https://www.eweek.com/news/tailwind-labs-lays-off-engineers-due-to-ai/
  - https://ppc.land/tailwind-css-lays-off-75-of-engineering-team-as-ai-impacts-revenue/
- **デザインシステムをコンテキストとして渡す仕組み**:
  - https://v0.app/docs/design-systems-2
  - https://help.figma.com/hc/articles/43602872461079
  - https://www.figma.com/blog/design-context-everywhere-you-build/
  - https://github.com/google-labs-code/design.md
  - https://www.anthropic.com/news/claude-design-anthropic-labs
  - https://agents.md/
  - https://agentskills.io/
  - https://skills.sh/
  - https://www.chakra-ui.com/docs/get-started/ai/mcp-server
  - https://mui.com/material-ui/getting-started/mcp/
  - https://polar.sh/blog/orbit-llm-safe-design-system
  - https://recipes.mui.com/blog/ai-design-system-trends
- **AI 製品向けコンポーネント**:
  - https://github.com/vercel/ai-elements
  - https://github.com/assistant-ui/assistant-ui
  - https://www.assistant-ui.com/docs/tools/generative-ui-formats.md
  - https://www.assistant-ui.com/docs/api-reference/generative-ui/tokens.md
  - https://github.com/CopilotKit/CopilotKit
  - https://copilotkit.ai/blog/series-a
  - https://github.com/ibelick/prompt-kit
  - https://github.com/openai/apps-sdk-ui
  - https://developers.openai.com/api/docs/guides/chatkit-widgets
  - https://github.com/thesysdev/openui
- **プロトコル**:
  - https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp
  - https://github.com/modelcontextprotocol/ext-apps
  - https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
  - https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt
  - https://developers.openai.com/apps-sdk/concepts/ui-guidelines
  - https://github.com/a2ui-project/a2ui
  - https://developers.googleblog.com/a2ui-v0-9-generative-ui/
  - https://a2ui.org/concepts/catalogs/
  - https://github.com/vercel-labs/json-render
  - https://www.infoq.com/news/2026/03/vercel-json-render
  - https://docs.ag-ui.com/introduction
  - https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/
- **数値の取り方**:
  - npm: api.npmjs.org（2026-10-12〜18 の週を、2025-10 と 2026-04 の同じ週と比較。月次は range API）
  - GitHub: api.github.com（2026-10-22）

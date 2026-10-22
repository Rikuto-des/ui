# 03. スタイル付きコンポーネント集・レジストリ系・テーマツール（2026-10-22 時点）

★ は 2026-10-22 に gh api で取得。レジストリ数は `ui.shadcn.com/r/registries.json` を取得して集計（分類はキーワード判定による概算）。

## 1. 要約

- **見栄え特化型の勢いは続いている。**
  - React Bits は 2025 年に +32.8k★ で、JS Rising Stars の総合 2 位（shadcn/ui の +26.3k を上回る）。直近 30 日の伸びも +69.9★/日で、shadcn 本体の +59.5/日を超えている。
  - 一方、Magic UI の年間増加は 13.2k → 6.6k → 今年 約 3.0k と半減が続いている。
  - エフェクト集は目新しさが切れると止まる。いま伸びている最前線は WebGL / WebGPU 系（Canvas UI、shaders.com）に移りつつある。
- **shadcn レジストリが、コンポーネント集を配るときの事実上の標準になった。**
  - 公式ディレクトリには 479 件。
  - 有料品は「ライセンスキー付きのプライベートレジストリ」で配るのが定番になった。
- **2026 年に伸びたのは 2 系統。**
  - ドメイン特化の「xxxcn」: mapcn（12.3k★、2025-12 作成）、Shadcn Labs の pdfcn / termcn など。
  - 大企業が社内デザインシステムを公開したもの: Meta の Astryx（13.7k★）、Cloudflare の Kumo（4.1k★）。
- **「shadcn っぽさ」から抜け出す手段が広がった。**
  - 色を差し替えるだけでなく、余白・角丸・構造まで変える「スタイル」（shadcn 公式で 8 種）。
  - テーマエディタ（tweakcn は 2025 年 Component Libraries 部門 2 位）。
  - 特定の美学に振り切ったレジストリ。
  - エージェント向けの見た目の指示書（DESIGN.md）。
- **収益化で実績があるのは「無料 OSS ＋ 買い切り Pro（$129〜$399）」。**
  - 自己申告で Aceternity が 月 $80K（2024 年）、shadcnblocks が 月 A$87.5K（2025-09）。
  - ただし Tailwind Labs が示したとおり、AI がドキュメントを経由しなくなると集客の導線が壊れるリスクがある。

## 2. shadcn エコシステム系

| 名前 | ★ | 差別化 | 配布 / 土台 | 収益モデル | 伸び・近況 |
|---|---|---|---|---|---|
| React Bits | 49.9k | 背景・テキスト・カーソルなどの派手なエフェクト。JS/TS × CSS/Tailwind の 4 変種 | shadcn CLI / jsrepo / コピペ | 無料。2026 年に Pro（買い切り $129 / $249 / $349、年額 $79〜）。キーで認証するレジストリ | 2025 年 +32.8k。作者は本業の傍ら、時間の 20% ほどを充てている |
| Magic UI | 22.8k | LP 向けアニメ 150 個以上 | shadcn CLI / Motion | Pro $199 買い切り | 2025-05 に PH 日間 1 位（606 票）。伸びは減速 |
| Aceternity UI | 非公開 | 派手なヒーロー・ブロック・ページ | `@aceternity-pro`（API キー、2025-08） | 無料 100 個以上 ＋ $169/年・$199 生涯・Team $1,590 | 2026 年に Pages / Labs を追加 |
| tweakcn | 10.5k | テーマエディタ ＋ AI でテーマ生成 | Web で編集 → CSS 変数を出力 | Pro $8/月（AI 生成無制限・画像から生成） | 2025 年 +8.7k → 2026 年 +1.7k |
| coss ui（旧 Origin UI） | 10.7k | primitives → particles → atoms の 3 層構成 | registry / Base UI | Cal.com が買収し、同社の公式デザインシステムに | 2025-10-15 開始。ライセンス表示は AGPL-3.0 |
| Animate UI | 4.6k | 既存の shadcn 部品にモーションを付け足す | v2 でパッケージ化 ＋ CLI ＋ skill / Radix・Base UI・React Aria | 無料 | v2.1（2026-10-19） |
| Motion Primitives / Cult UI | 6.8k / 6.7k | モーション / AI 向けパターン | registry / Motion | Cult UI Pro $199 生涯 | 直近 +14.6 / +16.2★/日 |
| shadcnblocks | – | ブロック 2,000 個以上、テーマ、Figma | registry ＋ MCP | Pro $149 / $299 / $399 買い切り。Pro 顧客 5,420 と自称 | 2025-10-28 に Kibo UI を買収 |
| Kibo UI | 4.0k | Gantt・Kanban など高機能な部品 | registry | shadcnblocks 傘下 | 最終 push 2026-05 |
| ReUI | 3.8k | 部品 1,000 個以上、Radix 版と Base UI 版 | registry | 母体の Keenthemes がテンプレート販売 | 直近 +8.0★/日 |
| Kokonut / Skiper / Tailark | 2.2k / 非公開 / 2.3k | LP 向けアニメ / LP 用ブロック | プライベート registry（X-API-Key） | $159 / $129 / $249〜$499 | – |
| shadcn/studio | 2.0k | ブロック ＋ AI テーマ ＋ Figma | registry | $99〜$849 | – |
| 21st.dev | Magic MCP 6.2k | 部品マーケット ＋ AI 生成 | 会員制 registry ＋ MCP | $6〜8/月、AI クレジット $15〜80/月 | 本体リポジトリは 2025-05 から止まっている |
| JollyUI | 1.1k | React Aria 版の shadcn | – | – | 2025-01 から止まっている |

## 3. パッケージ型・大企業系

- **HeroUI**（31.0k★）
  - v3 が 2026-03-21 に安定版。React Aria Components ＋ Tailwind v4 で作り直した。
  - アニメーションは CSS だけ（Framer Motion を外した）。部品は compound 形式、テーマは `data-theme` で切り替え。
  - MCP、エージェント用 skills、Native 版の部品 37 個。Pro は先行販売中で、認証付き MCP を含む。
- **MUI**
  - v8 を飛ばして v9（2026-04-08）。
  - Base UI は 2025-12 に v1.0、現在 v1.9。
  - Pigment CSS と Joy UI は凍結。次のメジャー版で Emotion への依存を減らし、Tailwind との連携を強める予定。
  - MUI X は同じ日にライセンス体系を変えた。
- **Ant Design 6**: CSS 変数が標準になり、実行時コストのない `zeroRuntime` モードを追加。
- **Chakra**: v3.37（Ark UI ＋ Panda CSS）。Park UI は 2026-04 から止まっている。
- **Mantine**: 9.7 で、MCP サーバーが読めるドキュメントを 406 ページに拡大。
- **daisyUI**: 5.7 系。Blueprint MCP v1.5（2026-07）で、部品単位ではなく画面全体を生成できるようになった。
- **Preline**: v5 で MCP、AI プロンプト、アニメーションするアイコンを追加。
- **Untitled UI React**（2025-07-17 公開）
  - React Aria ＋ Tailwind v4。土台は MIT。
  - PRO は $349〜$8,999（上位プランは SSO / SCIM 付き）。独自 CLI、MCP、Figma 同期あり。
- **Tremor**: 2025-01 に Vercel が買収し、全部品を無料化。2025-10 以降は push がない。
- **Radix Themes**: 2026-04 から止まっている。shadcn も 2026-07 に Base UI を標準にした。
- **Tailwind Plus / Tailwind Labs**
  - 2026-01 にエンジニアの 75% を解雇。報道では売上が約 80% 減、ドキュメントへの流入が約 40% 減。
  - その後 Vercel や Google AI Studio などがスポンサーに付いた。
- **新しく出てきた大手系**
  - **Meta Astryx**（2026-06 に公開ベータ）: MIT、React 19 ＋ StyleX、部品 150 個以上、テーマ 7 種。swizzle（部品のソースを手元に取り出して改変する機能）、CLI、MCP あり。
  - **Cloudflare Kumo**: Base UI 製。npm ＋ CLI に加え、エージェントが読み取れる形式の部品一覧を用意。

## 4. 2026 年の新しい伸び（★は作成以来の累計）

- **ドメイン特化の xxxcn**
  - mapcn（12.3k、MapLibre ベース、収入はスポンサーのみ）
  - Shadcn Labs（2026-04 設立の第三者組織）の pdfcn 3.0k / termcn 1.2k / emailcn / snapcn（Remotion で動画） / agentcn など
- **DOM の外側を使う表現**
  - Canvas UI（React Bits の作者、5.0k）: HTML-in-canvas 方式。React / Vue / Svelte / Solid / Preact / vanilla に対応。ライセンスは MIT ＋ Commons Clause。
  - shaders.com: WebGPU。作成から 3 週間で 5.3k。Pro はサブスク。
- **特定の美学に振り切ったもの**: animal-island-ui（かわいい系、5.0k）、itshover（アニメーションするアイコン、2.7k）
- **デザインをエージェントに伝えるもの**
  - Google Labs の DESIGN.md 仕様（28.5k）
  - awesome-design-md（122.8k）
  - design-extract（4.3k）
  - shadcn/lint（3.2k）: 「エージェントが検証できるデザインシステムのルール」を書くためのリンター

## 5. 問いへの回答

### Q1. なぜ「見栄え特化」が爆発的に伸びたか

**事実**

- React Bits の作者インタビューによると、最初に注目されたのは SplashCursor。発想の元は CodePen・Awwwards・Dribbble。
- 「Bits」という名前は、1 つのスタイルに縛られないように付けた。
- 部品ごとに 4 つの書き方（変種）を用意している。

**推測**

1. 部品 1 つがそのまま SNS の投稿になる。数秒の動画で価値が伝わるので、X や YouTube で拡散しやすい。
2. AI や shadcn で作った画面が似通った結果、LLM がゼロから書きにくいシェーダーや物理演出が「差」として残った。
3. デザインシステムを入れ替えなくても 1 個だけ足せる。導入の覚悟がいらず、shadcn と競合せず補い合う関係になる。
4. JS 版や CSS 版もあり、初心者でも使いやすい。
5. フレームワークを横に広げている（Vue Bits は 2025 年 +3.5k、Svelte Bits もある）。

**逆方向のデータ**

- Magic UI は減速している。
- レジストリ 479 件のうちモーション系が 142 件（概算）で、飽和している。
- つまり勝因は「新しさ」であり、その最前線は WebGL / WebGPU に移っている。

### Q2. shadcn 互換レジストリで配る利点と限界

**利点**

- `npx shadcn add @ns/item` の一行で入る。公式ディレクトリ（2025-10 開始）が CLI に組み込まれている。
- MCP 経由で AI エージェントが自分でインストールできる（CLI 3.0、2025-08）。
- 認証付きのレジストリで、そのまま有料配布できる。GitHub リポジトリをそのままレジストリにできる（2026-06）、プライベートも可（2026-08）。
- `registry:base` で、Base UI / Radix / React Aria のどれ向けかを指定できる。
- 共通の CSS 変数の約束事に従えば、他のテーマとそのまま互換になる。

**限界**

1. 埋もれやすい。ディレクトリにはヘルス監視スコアがあり、479 件中 86 件が degraded / unavailable。
2. 土台が分かれた（2026-07 に Base UI が標準になり、React Aria も追加）ので、2〜3 系統の版を保守する手間がかかる。
3. 配った後に修正を届ける経路がない。このため、どこも「部分的にパッケージ化する」方向に寄っている。
   - Animate UI はパッケージ化した。
   - Astryx は逆に「npm パッケージ ＋ swizzle で取り出し」の組み合わせを取った。
4. ソースを配るので、転売を防ぎにくい。対策として Commons Clause や AGPL を付ける例がある。
5. shadcn 側の仕様変更に引きずられる（例: 2026-09 の `cn` パッケージ化）。

### Q3. 「shadcn っぽさ」から抜け出す試み

- **公式のスタイル切り替え**
  - `shadcn create`（2025-12）で Vega / Nova / Maia / Lyra / Mira。その後 Luma / Sera / Rhea が増えて計 8 種。
  - `shadcn preset` / `shadcn apply` もある。
  - 色だけでなく、余白・角丸・構造までコード自体を書き換える。
- **テーマエディタ・生成器**
  - tweakcn: README で「shadcn のサイトはどれも同じに見える」ことを動機に挙げている。
  - shadcn/studio の AI テーマ、paletteui。
  - shadcnblocks のテーマ集（2026-07）: 「Vercel 風」「Stripe 風」など。tweakcn などの形式と互換。
- **既存のデザインシステムをレジストリとして配る**
  - materialcn（M3 Expressive）、fluent2-react-kit、herocn（HeroUI 風、作者は未確認）
  - mozaika（実在するプロダクトの UI を計測して作ったテーマ）
  - washiveil（CJK 組版）
- **特定の美学に振り切る**
  - 8bitcn、warcraftcn、retroui / neobrutalism
  - nostalgia-ui（Mac OS 9 風）、thegridcn（Tron 風）、afterglow（ターミナル風）、Liquid Glass 系
- **1 つのライブラリで複数スタイル**: viberdy（14 スタイル ＋ AI 用プロンプト）、karaui（10 スタイル）、Astryx（7 テーマ。gothic、y2k を含む）
- **ブランドの見た目をエージェントに渡す**: DESIGN.md、design-extract、shadcn/lint

### Q4. 有料化に成功しているモデル

1. **無料 OSS ＋ 買い切りの Pro ブロック・テンプレート**: 主流で、実績もある。
   - Aceternity は Pro 開始から約 2 か月で 月 $80K（2024-10）。
   - shadcnblocks は 月 A$87.5K（2025-09）。
   - 価格帯は $129〜$399 に収束。チーム向けは $449〜$1,590。
2. **配布はキー付きのプライベートレジストリ ＋ MCP**（Aceternity、React Bits Pro、Kokonut）。Kokonut は、CLI コマンドの代わりにエージェント向けのプロンプトをコピーさせる「Agent タブ」まで用意している。
3. **サブスクは計算コストがかかるものだけ**: tweakcn $8/月、21st.dev の AI クレジット、shaders.com Pro。
4. **B2B のシート課金**: Untitled UI（〜$8,999）、MUI X。
5. **買収・戦略投資で出口を取る**: Tremor → Vercel、Origin UI → Cal.com、Kibo → shadcnblocks。大企業が社内デザインシステムを公開する例（Meta、Cloudflare）もこの延長にある。
6. **スポンサーのみ**: mapcn、Shadcn Labs。React Bits も Pro を始める前は収入がほぼゼロだった。

**リスク**: 生涯ライセンスは新規客が入り続けることが前提。AI がサイトを経由しなくなると止まる（Tailwind の例）。

## 6. 新ライブラリへの示唆

1. **部品 1 つ ＝ デモ動画 1 本になる「見せ場」と、作った結果を共有できるプレイグラウンド**を用意する（React Bits の Background Studio、tweakcn のエディタのように）。
2. **最初から 2 通りで配る**: 更新できる npm パッケージと、ソースを取り出せる shadcn レジストリ。土台は Base UI を標準にし、Radix / React Aria は `registry:base` で対応する。
3. **エージェント対応を最初から入れる**: MCP、skills、llms.txt、DESIGN.md の書き出し、リンターで検査できるデザインルール。導入がエージェント経由になるので、Pro 品も MCP の中で見せる導線を作る。
4. **差別化は色ではなく「スタイル一式」**で出す。余白・角丸・構造・モーション・組版をセットにした複数スタイルを用意しつつ、shadcn の CSS 変数の約束事は守る（他のテーマとの互換が効く）。
5. **空白地帯 1: ドメイン特化と製品 UI**。地図・PDF・メール・動画・チャート・データグリッド・日程管理・リッチテキスト。mapcn が示すように、1 本出すだけで伸びる余地がある。逆に LP 向けモーション集は飽和している。
6. **空白地帯 2: アプリ全体で一貫したモーション**。既存部品にアニメーションを足す方向（Animate UI）や、loading / empty / error などの状態を最初から全部備えた製品 UI（siteplane、hextaui）は、まだ層が薄い。
7. **空白地帯 3: CJK 組版・高密度 UI・RTL・Vue / Svelte 対応**。日本語の組版を本格的にやっているのは washiveil くらい。フレームワークをまたいで成功した例はある（Vue Bits、Basecoat は 2025 年 +3.3k、Canvas UI）。
8. **収益化**: 無料の中核 ＋ $129〜$399 の買い切り Pro（キー付きレジストリ）＋ チーム・エンタープライズ向け。サブスクは AI 生成などコストのかかる機能に限る。
9. **保守を続けること自体が差別化になる**。ディレクトリにヘルス監視スコアがあり、止まったもの（JollyUI、Park UI、Tremor、買収後の Kibo）は失速している。月 1 回のリリース（shadcnblocks）が信頼につながる。
10. **ライセンスを最初に決める**: MIT / MIT ＋ Commons Clause（Canvas UI）/ AGPL（coss）。転売の防止と、採用されやすさのバランスで選ぶ。

## 出典

注: 調査中に WebSearch の上限（200 回）に達したため、Origin UI 買収の正確な日付、Intent UI / Flowbite の 2026 年の動き、Motion Primitives Pro の有無は確認できていない。

- **集計データ**
  - JS Rising Stars 2025: https://risingstars.js.org/2025/en / https://github.com/bestofjs/javascript-risingstars
  - Best of JS（直近 30 日の伸び）: https://bestofjs.org/projects?tags=component&sort=monthly / https://bestofjs.org/projects?tags=animation&sort=monthly
- **React Bits**: https://motion.dev/magazine/interview-david-haz-creator-of-react-bits / https://pro.reactbits.dev/llms.txt
- **shadcn**: https://ui.shadcn.com/r/registries.json / https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create / https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- **21st.dev**: https://21st.dev/blog/shadcn-registry-directory / https://21st.dev/pricing
- **shadcnblocks**: https://www.shadcnblocks.com/blog/announcing-kibo-ui-acquisition / https://www.shadcnblocks.com/pricing / https://www.shadcnblocks.com/blog/shadcn-themes / https://tinystartups.beehiiv.com/p/twits-81
- **coss**: https://coss.com/ui/docs/roadmap / https://github.com/cosscom/ui
- **Aceternity**: https://ui.aceternity.com/pricing / https://www.starterstory.com/stories/aceternity-ui
- **Magic UI**: https://pro.magicui.design/
- **価格ページ**: https://kokonutui.pro / https://skiper-ui.com/pricing / https://tailark.com/pricing / https://www.pro.cult-ui.com/pricing / https://shadcnstudio.com/pricing
- **tweakcn**: https://github.com/jnsahaj/tweakcn
- **HeroUI**: https://heroui.com/docs/react/releases/v3-0-0 / https://infoq.com/news/2026/07/heroui-v3-rewrite
- **MUI**: https://mui.com/blog/2026-and-beyond/ / https://mui.com/blog/introducing-mui-v9/ / https://infoq.com/news/2026/02/baseui-v1-accessible/
- **Ant Design**: https://ant.design/docs/react/migration-v6.md
- **daisyUI**: https://daisyui.com/blueprint/changelog/
- **Preline**: https://www.preline.co/mcp/
- **Untitled UI**: https://www.untitledui.com/react
- **Tailwind Labs**: https://www.devclass.com/ai-ml/2026/01/08/tailwind-labs-lays-off-75-percent-of-engineers-thanks-to-brutal-impact-of-ai/4079571 / https://ppc.land/tech-giants-rush-to-sponsor-tailwind-css-after-devastating-layoffs/
- **Astryx**: https://github.com/facebook/astryx / https://infoq.com/news/2026/09/meta-astryx-design-system
- **Kumo**: https://github.com/cloudflare/kumo
- **mapcn / Shadcn Labs**: https://mapcn.dev / https://shadcn-labs.com
- **Canvas UI / shaders.com**: https://canvasui.dev/ / https://shaders.com
- **DESIGN.md 関連**: https://github.com/google-labs-code/design.md / https://github.com/VoltAgent/awesome-design-md / https://github.com/shadcn-ui/lint
- **「同じに見える」問題**: https://redmonk.com/videos/wes-bos-design-2026/

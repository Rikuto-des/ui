# 07. 開発者コミュニティの本音と公式調査（2026-10-22 時点）

**調査の制約**

- Reddit はクローラを拒否しているため、直接は確認できていない（他の記事が引用したものだけ見ている）。X の個別の投稿も、直接は確認できていない。
- WebSearch の回数上限に達したので、後半は HN Algolia API・GitHub API・Zenn API と、ページの直接取得で補った。
- 著作権の配慮から、引用は最小限にして要約で書いている。

## 1. 要約

### 普及の度合い

shadcn/ui は事実上の標準になった。

- State of React 2025 の使用率は **56.1%**。MUI の 57.2% とほぼ並んだ。2 年で 20% から 56% へ伸び、調査の中で最も急な伸びだった。
- State of CSS 2026 では Tailwind が 50.2%、shadcn/ui が 21.7%。
- JS Rising Stars 2025 では、総合 2 位が React Bits（+32.8k）、3 位が shadcn/ui（+26.3k）。

### 不満の中身

「使いにくい」ではなく、「普及したことの副作用」が中心になった。

1. どのサイトも同じに見え、AI が作ったものと区別がつかない
2. コピペして自分のものにしたコードを、更新し続けるのが負担になる
3. 土台のプリミティブが Radix → Base UI → React Aria と揺れている
4. 抽象化が行き過ぎているという批判と、ネイティブの HTML / CSS へ戻る動き
5. AI エージェントがデザインシステムのルールを破る

### 2026 年の主な出来事

- Tailwind Labs が 1 月にエンジニアの 75% を解雇し、9 月に **Shopify に買収**された（Tailwind 本体は MIT のまま。Tailwind Plus と ui.sh は新規受付を停止）。
- shadcn は 7 月に Base UI を既定にし、同じ 7 月に React Aria も追加した。
- 9 月に shadcn/lint を公開した。エージェントが守れるようにする向けの lint。

### 勝ち筋

次の 5 つは、まだ誰も解決していない。

- 自分のものにしたコードを、本家の更新に追従させること
- AI に守らせることができるデザインのルール
- ブランドに合わせて見た目を変えられる幅
- 複雑なコンポーネントの品質
- registry の信頼性

## 2-A. 公式調査・ランキング

### State of React 2025

- 調査期間: 2025/11/19〜2026/1/9。回答者 3,760 人。結果公開: 2026-02。
- UI ライブラリの使用率: MUI 57.2%、shadcn/ui 56.1%。MUI はまだ首位だが、shadcn に抜かれる寸前と評されている。
- UI ライブラリを使っていない人は 1,246 人（約 33%）。使っている人は平均 2.3 個使っている。
- 自由記述の「その他」欄: **1 位 Base UI（49 件）**、2 位 daisyUI（19 件）。Ark UI は前年より +9 順位を上げた。
- 結論ページでは、shadcn/ui が AI ツールで作るアプリの定番ライブラリになったと述べている。背景として、v0・Lovable・Bolt などで AI に書かせて作るスタイル（バイブコーディング）が広がったことを挙げている。

### State of CSS 2025 → 2026（CSS フレームワークの利用率）

| | 2025 | 2026 |
|---|---|---|
| Tailwind | 51.3% | 50.2% |
| 使っていない | 26.7% | 28.2% |
| Bootstrap | 30.0% | 26.6% |
| shadcn/ui | 19.3% | 21.7% |
| 自社製 | 24.0% | 19.1% |
| MUI | 圏外 | 18.7% |

- **2026 年版の見立て**: Tailwind にとって最大の脅威は、別のフレームワークではなく「フレームワークを使わないこと」かもしれない。LLM がその場でデザインシステムを作るようになったことと、ネイティブ CSS が強くなったことが理由。
- **AI が生成する CSS の割合**: 中央値は 13%。まったく使わない人が 26%。
- **CSS 全体の不満**: ブラウザごとの差（557 件）と、覚えることの多さ（403 件）。
- **色まわりの不満**: アクセシビリティ（152 件）とテーマ設定（138 件）。
- **欲しい機能**: mixins、masonry、条件分岐。
- **2025 年版の結論**: ネイティブの機能が、フレームワークによる抽象化の代わりになりつつある。

### Stack Overflow Developer Survey

- **2025 年**: Tailwind CSS 4 が 21.8%、shadcn/ui が 8.7%（AI を使って学んでいる人に限ると 12.1%）。React は 44.7%。
- **2026 年**: React は使用率 41.5%、Admired（使い続けたい人の割合）46.7%（前年は 52.1%）。Admired の最高は Svelte の 59.4%。

### JS Rising Stars 2025

- **総合**: 1 位 n8n（+112.4k）、2 位 React Bits（+32.8k）、3 位 shadcn/ui（+26.3k）、6 位 Onlook（+19.4k）。
- **Component Libraries 部門**: shadcn/ui、tweakcn、Magic UI、Base UI、HeroUI の順。
- **Styling 部門**: Tailwind、DaisyUI、Bootstrap、Pico.css、NativeWind の順。
- **Vue**: Vue Bits +3.5k、shadcn-vue +3.4k。
- **React Native**: React Native Reusables +3.3k。

【推測】ランキングを見ると、伸びているのは 3 種類。配布の仕組み（registry）、見た目を変える道具（tweakcn）、見栄えのする部品（React Bits、Magic UI）。「shadcn っぽさから抜けたい」という需要が、そのまま数字に出ている。

## 2-B. コミュニティの声（テーマ別）

### ① 画一化（shadcn っぽい見た目、AI が作った UI）

- **HN「Performative-UI」（1,181 点、2026-06）**
  - スタートアップや AI 系 LP の決まり文句を、そのまま部品にした風刺ライブラリ。
  - どのページも予測どおりの見た目だ、という指摘が多かった。
  - 一方で「業務アプリなら定番の見た目で十分」という擁護もあった。
- **Brian Douglas「Tailwind and slop apps」（HN 111 点、2026-06）**
  - Show HN に出たバイブコーディング製のアプリ 4 つが、すべて同じ系統の Tailwind テンプレートだった。
  - その見た目が「手抜きのサイン」として見られるようになった、という主張。
  - コメント欄では「原因は Tailwind ではなく、既定値と LLM の学習データだ」という見方が多かった。
- **Anthropic（2025-11）**
  - 原因を distributional convergence（多数派の無難なデザインに寄っていく現象）と説明した。
  - 典型例は Inter、白背景に紫のグラデーション、予測どおりのレイアウト。
  - 対策として、具体的な代替案をまとめた Skill を渡す方法を勧めている。
- **日本（Zenn「kasumi/ui」）**
  - shadcn は英語を前提に作られていて、日本語では line-height 1.5 が窮屈になる。
  - そこで line-height を 2.0 / 2.5 の 2 段階にし、ボタンの余白も広げた。
  - 画一化の問題は、ブランドだけでなく**言語の組版**にも及んでいる。

### ② 複雑すぎる、ネイティブに戻ろう

- **「The Overcomplexity of the Shadcn Radio Button」（HN 528 点・333 コメント、2026-01）**
  - ラジオボタン 1 つに約 45 行・約 30 クラスを使い、その下の Radix は約 215 行・7 ファイルに依存している。
  - `<button>` に ARIA を足してラジオボタンを作り直しており、「ネイティブ要素を優先する」という ARIA の第一原則に反している、という指摘。
  - 反応は、目に見える範囲で約 7 割が批判的。
  - 擁護側の意見: Safari などでネイティブ要素の見た目がそろわない。デザイン主導のチームには自由度が必要。
- **Julia Evans「Tailwind をやめて CSS を構造化する」（HN 698 点、2026-05）**: 反応は割れた。「LLM には、語彙が限られている Tailwind のほうが有利」という意見もあった。
- **「I don't recommend Tailwind CSS」（HN 165 点、2026-08）**: 任意の値を書けるせいで、デザインの尺度（決められた値の段階）が崩れる、という批判。
- **Basecoat（「React を使わない shadcn」）**: Show HN で 146 点。2026 年には Go / templ / Blazor / Ember / HTMX 向けの移植まで出ている。

### ③ コピペ方式の更新・保守

- **HN「Shadcn/UI now defaults to Base UI」（282 点・165 コメント、2026-07）**: 約 6 割が懐疑的だった。
  - ボタン程度の部品に「アップグレード」が要ること自体がおかしい。
  - ライブラリにパッチを当てていると、更新のたびに大仕事になる。
  - 逆に「部品ごとに少しずつ更新できる」という擁護もあった。
  - 「移行は不要」と言いながら移行用プロンプトを載せている矛盾も突かれた。
- **Zenn「それでも私は Shadcn コンポーネントを直接改変する」**
  - 本家が更新されたとき、自分の改変を移し替える手間がかかる。
  - クラスの自動並べ替えで差分が読めなくなるので、フォーマッタの対象から外して運用している。
- **GitHub**
  - 反応数の最多は Tailwind v4 / React 19 対応（252）。
  - `--overwrite` が効かない問題がある。
  - open PR は 987 件、open issue は 792 件。
  - 2025-01 には「メンテナを増やしてほしい」という issue が立った。

### ④ Radix への不安

- **Radix のコミット数（GitHub、集計）**: 2025 年上期 262 → 下期 **39** → 2026 年上期 112 → 7〜10 月 174。
  - 2025 年後半に本当に止まっていたのは事実。今は回復している。
  - 2026 年に close された issue は 579 件、いま open なのは 124 件。
- **shadcn が Base UI を既定にした理由**
  - 安定している（v1.6.0、週 600 万 DL）
  - shadcn チーム自身が使っている
  - shadcn/create で Base UI を選ぶ人が増えた
  - Radix は非推奨にしていない。
- **コミュニティの受け止め**
  - 「なぜ急にみんな Base UI に移るのか」という、乗り換えへの疲れ。
  - Base UI はフォームの扱いが違うので、プロジェクトをまたいでコードを流用できない、という声。
- **Vaul（Drawer）**: 作者がメンテ停止を明記している。shadcn の Drawer にも影響した（#8455、#9623）。

### ⑤ Tailwind のクラス地獄と、Tailwind の事業危機

- **dev.to「Tailwind CSS Won the War… But We're the Losers」**: 1 つの div にクラスが 19 個並ぶ。CSS の力が落ちる。
- **反対意見**: 「I Love Tailwind. Sorry Not Sorry」。賛否は二分している。
- **Tailwind Labs の解雇**: Adam Wathan は GitHub の PR で、売上が約 80% 減ったこと、ドキュメントへの流入が約 40% 減ったことを明かした。
  - HN（1,457 点）では「本当の原因は AI ではなく、無料の shadcn に有料キットの需要を奪われたことだ」という反論が目立った。
- **2026-09 に Shopify が買収**: Tailwind 本体は MIT のまま続く。Tailwind Plus と ui.sh は新規受付を停止した。

### ⑥ 複雑な UI が足りない、状態の扱いが抜けている

- **GitHub の要望（反応数の多い順）**: タグ入力（106）、Stepper、ドラッグ&ドロップ付きの Tree、Date Picker のキーボード入力、Sankey、ピボットテーブル、下部ナビ、Shadow DOM 対応。
- **Data Table** は TanStack Table の組み立て例にとどまり、毎回書く定型コードが重い。ガントやカンバンは Kibo UI などの外部 registry に頼っている。
- **フォーム**: Form から Field への移行で、方針が分かりにくくなった（#9505）。Combobox は Radix 版の例が足りない（#9393、#9400 は 68 コメント）。
- **dev.to「The states shadcn/ui leaves to you」（2026-10）**: loading / error / empty / reduced-motion / RTL / タップ領域などの振る舞いが、利用者任せになっている。

### ⑦ a11y / パフォーマンス / Shadow DOM

- **a11y**: 第三者の監査では、48 部品中 34 部品が AA に適合（未検証）。壊しているのは Radix ではなく、shadcn の**既定スタイル**（フォーカス表示やコントラスト）。
- **パフォーマンス・不具合**
  - Radix のバグで、閉じたあと body に `pointer-events:none` が残り、画面が操作できなくなる。
  - サイドバーがリロード時にちらつく（SSR と localStorage の値が食い違う）。
- **Shadow DOM**: ポータル経由で表示した要素にスタイルが届かない、CSS が重複する、動的に組み立てたクラスが抜け落ちる。

### ⑧ デザイナーとの連携（Figma）

- **Zenn の検証（Figma MCP + Claude Code）**: 同じ Card でも角丸が大きくずれ、グリッドは 1 カラムに崩れた。自由度の高さが裏目に出たと分析し、Figma とコードが 1 対 1 で対応する Fluent 2 を検討している。
- **dev.to「the code is yours. So why can't anything edit it?」**: バリアントが CVA のコードの中にあるので、ビジュアル編集ツールから読み取れない。
- この分野は公開された議論が少なく、根拠は限られている。

### ⑨ AI エージェントがデザインシステムを壊す（2026 年に急浮上）

- **shadcn/lint（2026-09、v0.1）**
  - 検出するもの: className での上書き、パレットの色を直接書くこと、任意の値、インラインの style。
  - エラーメッセージは**エージェントが読むこと**を前提にしていて、代わりに使うべきバリアントやトークンを示す。
- **Emil Kowalski「Agents with Taste」**: 何が「良い見た目」かの判断基準を言葉にして、Skill の厳密なルールに落とし込む。

### ⑩ registry の信頼性とサプライチェーン

- shadcn 本体の PR 2 件で、北朝鮮系とされるマルウェアが見つかった（#11971、2026-09）。
- npm 上の「shadcn」を名乗るパッケージが乗っ取られた（tanstack-shadcn-table、2025-11）。
- ソースコードを直接配る仕組みに対して、中身を検証する仕組みが追いついていない。

### 日本（Zenn）の反応

- 好意的な導入記事が中心。最も読まれた分析は「なぜ shadcn/ui は支持されたのか」（72 いいね）。
  - App Router の時代に Provider が要らないことを評価している。
  - 一方で、部品単体の品質は MUI や Chakra より上ではないと認めている。
- デジタル庁デザインシステムを shadcn の registry として配る試み（46 部品）がある。日本語向けに調整した版（kasumi/ui）も出ている。
- HN ほど強い批判は少ない。ただし、Tailwind のクラスが長すぎる問題や、Base UI への移行解説は増えている。

### 影響力のある人の最近の発言

- **shadcn**: Base UI を推奨と明言。移行は codemod ではなく Skill で行う。shadcn/lint や GitHub Registries など「エージェントが先に読む」設計に舵を切った。
- **Adam Wathan**: AI による事業への打撃を公に説明した。ui.sh（エージェント向けの Skill と MCP）を招待制で始めた。
- **Emil Kowalski**
  - 「Agents with Taste」で、判断基準を Skill に落とし込むことを提唱している。
  - 自作の Vaul は、趣味のプロジェクトとしてメンテ停止を宣言した。個人が作ったプリミティブは長く続かないことの象徴になっている。
- **Kent C. Dodds**: エージェントは「監督が必要な若手」だが、それでも Web で優れた UX を届けるべきだと語っている。
- **Josh Comeau**: 最近の記事はネイティブ CSS が中心（anchor positioning、@starting-style、Interop 2027 の予想）。

## 2-C. 不満・要望ランキング（頻度 × 深刻度、主観で評価）

| # | 不満・要望 | 頻度 | 深刻度 | 既存の解決状況 |
|---|---|---|---|---|
| 1 | 見た目の画一化（shadcn っぽさ、AI が作った UI と見分けがつかない） | 高 | 高 | 一部。tweakcn や create の 8 スタイルはあるが、変えられるのは主に色と角丸。レイアウト・密度・動きは同じまま |
| 2 | コピペしたコードを更新する負担 | 高 | 中〜高 | 一部。diff・apply・移行用 Skill はある。3-way merge（自分の改変と本家の更新を自動で合わせる仕組み）はない |
| 3 | プリミティブの揺れと乗り換え疲れ | 中〜高 | 高 | 一部。複数のプリミティブに対応したが、そのぶん実装が分かれた |
| 4 | 複雑な部品の不足（データグリッド、タグ入力、Stepper、Tree、日付入力、ガント） | 高 | 中 | 外部 registry が埋めているが、品質がばらばら |
| 5 | Tailwind のクラス地獄と読みにくさ | 高 | 中 | 一部。cn、cva、lint |
| 6 | AI エージェントによるデザインシステム違反 | 中（急増） | 高 | 初期段階。shadcn/lint v0.1 |
| 7 | 抽象化のしすぎ、ネイティブの軽視 | 中 | 中 | 一部。Basecoat、ネイティブ CSS |
| 8 | a11y の穴（スタイル層で壊している） | 中 | 高 | 一部。プリミティブ自体は良好 |
| 9 | 状態・振る舞いの抜け（loading / empty / error / reduced-motion / RTL） | 中 | 中 | 一部。RTL は 2026-01 に対応 |
| 10 | registry の品質のばらつきとサプライチェーン | 中 | 高 | ほぼ未解決。署名や検証がない |
| 11 | Figma とコードが一致しない | 中 | 中 | 一部。Figma キットや MCP はあるが、再現性が低い |
| 12 | パフォーマンス（JS の量、SSR のちらつき、Radix のバグ） | 中 | 中 | 一部 |
| 13 | 環境の縛り（React 前提、Tailwind 必須、Shadow DOM 非対応） | 中 | 中 | 移植版が乱立している |
| 14 | メンテナ不足と依存先の放置（PR 987 件、Vaul） | 中 | 中 | 未解決 |
| 15 | ドキュメントと移行の混乱（Form→Field、asChild→render、Combobox） | 中 | 低〜中 | 一部 |

## 3. 示唆（優先度順）

1. **【P1】更新できる「所有」**
   - コードは手元に置いたまま、本家の更新と 3-way merge できるようにする。
   - 部品ごとにバージョンを管理する。
   - 自分の改変はパッチの層として分けておく。
2. **【P1】AI が守れるデザインのルール**
   - トークン、許可するバリアント、上書きしてよい範囲を、機械が読める形で定義する。
   - lint・MCP・Skill を最初から同梱する。
   - エラーメッセージはエージェントが読んで直せる文面にする。
3. **【P1】色以外で個性を出せる幅**
   - 密度、組版（CJK の line-height も含む）、動きの性格、レイアウトの型まで変えられるようにする。
   - プリセットは、どれも同じ見た目に寄っていかないよう、デザイナーが作ったものを用意する。
4. **【P2】ネイティブを優先し、プリミティブに縛られない作り**
   - 優先して使うネイティブ機能: dialog / popover / customizable select / anchor positioning / ネイティブの radio。
   - JS は最小限にする。
   - プリミティブを差し替えられる層を設けて、乗り換え疲れを生まない。
5. **【P2】複雑な部品を最初から主役として扱う**: データグリッド、スキーマから組み立てるフォーム、マルチセレクト / タグ入力、キーボードで入力できる日付、Tree、Stepper、ファイルアップロード。
6. **【P2】状態と振る舞いを同梱する**: loading / empty / error / optimistic（結果を待たずに先に画面へ反映する更新）/ reduced-motion / RTL / タップ領域。
7. **【P3】品質を見えるようにする**: 部品ごとに、axe とスクリーンリーダーでの確認結果、バンドルサイズ、対応ブラウザ、メンテナンス状況をバッジで示す。
8. **【P3】信頼できる registry**: 署名、来歴（provenance）、審査の仕組み。
9. **【P3】デザイナーとの往復**
   - トークンは DTCG 形式で持ち、Figma の変数と同期する。
   - バリアントの定義は、ビジュアル編集ツールから読める形で公開する。
10. **【P3】続けられる体制**
    - ドキュメントで集客して有料キットを売るモデルは、AI に弱い（Tailwind の教訓）。
    - 企業の支援など、別の収入源を最初から考えておく。

## 出典

- **調査**
  - https://2025.stateofreact.com/en-US/libraries/component-libraries/
  - https://2025.stateofreact.com/en-US/conclusion/
  - https://2025.stateofcss.com/en-US/other-tools/
  - https://2026.stateofcss.com/en-US/other-tools/
  - https://2026.stateofcss.com/en-US/pain-points/
  - https://survey.stackoverflow.co/2025/technology
  - https://survey.stackoverflow.co/2026/technology/data
  - https://risingstars.js.org/2025/en
- **HN**
  - https://news.ycombinator.com/item?id=46688971
  - https://news.ycombinator.com/item?id=48791328
  - https://news.ycombinator.com/item?id=48445554
  - https://news.ycombinator.com/item?id=48496483
  - https://news.ycombinator.com/item?id=48158400
  - https://news.ycombinator.com/item?id=46527950
- **記事**
  - https://paulmakeswebsites.com/writing/shadcn-radio-button/
  - https://jvns.ca/blog/2026/05/15/moving-away-from-tailwind--and-learning-to-structure-my-css-/
  - https://briandouglas.ie/llm-tailwind-template/
  - https://en.andros.dev/blog/af3ee191/why-i-dont-recommend-tailwind-css/
  - https://github.com/tailwindlabs/tailwindcss.com/pull/2388
  - https://tailwindcss.com/blog/tailwind-is-joining-shopify
  - https://claude.com/resources/articles/improving-frontend-design-through-skills
  - https://emilkowal.ski/ui/agents-with-taste
- **dev.to**
  - https://dev.to/elvissautet/tailwind-css-won-the-war-but-were-the-losers-4877
  - https://dev.to/adioof/tailwind-laid-off-75-of-engineering-ai-didnt-do-that-shadcn-did-1njm
  - https://dev.to/preetsuthar17/the-states-shadcnui-leaves-to-you-loading-success-error-empty-and-reduced-motion-26ce
  - https://dev.to/linb/shadcnui-says-the-code-is-yours-so-why-cant-anything-edit-it-2dc7
  - https://dev.to/ujja/i-know-this-will-upset-some-devs-but-tailwind-shadcnui-shadow-dom-pain-44l7
- **GitHub**
  - shadcn-ui/ui の issues #6585、#8455、#6417、#11971、#9393
  - discussion #9505
  - https://github.com/emilkowalski/vaul
- **Zenn**
  - https://zenn.dev/sasau/articles/e036281804679c
  - https://zenn.dev/kiva/articles/45546213237974
  - https://zenn.dev/my_vision/articles/c602a080fc4a91
  - https://zenn.dev/ashunar0/articles/4b22ffdc29103f
  - https://zenn.dev/rescuenow/articles/0d6b0cf22b58bb
  - https://zenn.dev/fjimiz/articles/shadcn-sidebar-reload-fouc
- **二次情報（未検証）**
  - https://thefrontkit.com/blogs/shadcn-ui-accessibility-audit-2026
  - https://advisories.gitlab.com/npm/tanstack-shadcn-table/GMS-2025-631/

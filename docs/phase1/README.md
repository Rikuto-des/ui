# Phase 1 の結果（2026-10-22）

部品を 3 個から 21 個に増やし、`yourlib update` で更新を取り込めるようにした。部品はすべて Server Components のまま描画でき、多くはブラウザ標準の要素だけで動く。JavaScript が要るところは、任意で入れるランタイム（gzip で 1.94 KB）が受け持つ。

`pnpm verify` 1 つで全部を検証できる（生成 → 型チェック → 単体テスト → lint → 静的ページ → E2E → Next.js の E2E）。

## できたもの

| 領域 | 中身 |
|---|---|
| 部品 | 21 個（下の表）。契約 `contracts/*.contract.ts` から型・ドキュメント・lint 用データ・SKILL.md・配布データを生成する |
| ランタイム | `@yourlib/core` の `installRuntime()`（React からは `<YourlibRuntime />`）。メニューとタブのキーボード操作、Chromium 以外でのツールチップ、`<dialog closedby>` の代わり、トースト |
| パック | Graphite・Lucent に 7 個のトークンを追加（リンク色、入力欄の枠、スイッチのトラックとつまみ、Skeleton、ツールチップの地と文字、バッジの角） |
| CLI | `yourlib update [name...] [--dry-run] [--json]`。3-way merge で、手を入れた部品にも更新を取り込む。`yourlib diff` は未解決の衝突も報告する |
| lint | ルールを 9 個に（`tabs-match`、計測のあとで `valid-token`・`valid-import` を追加）。新しい部品にも契約から自動で効く |
| playground | 部品ギャラリー `/components.html` と、スクリプトが 0 個の版 `/static/components.html` |
| デザインシステム | https://claude.ai/artifact/81F4wiBJYhaYfJKNKvqqZg を第 4 版に更新。21 部品のガイドとプレビュー、`index.d.ts` を契約から生成 |
| Next.js の例 | `yourlib add` で 11 部品を追加し、Server Components のまま動くことを確認 |

### 部品と、JavaScript が要るかどうか

| 部品 | 土台にしたブラウザ標準 | JavaScript |
|---|---|---|
| Button | `<button>` | 不要 |
| Link | `<a>` | 不要 |
| Menu | `popover="auto"` と `role="menu"` | 開閉は不要。矢印キーとタイプアヘッドはランタイム |
| Field | `<label for>` と `aria-describedby` | 不要 |
| Input | `<input>` | 不要 |
| Textarea | `field-sizing: content`（入力に合わせて伸びる） | 不要 |
| Select | `<select>` と `appearance: base-select` | 不要 |
| Checkbox | `<input type="checkbox">` | 不要 |
| Switch | `<input type="checkbox" role="switch">` | 不要 |
| RadioGroup | `<fieldset>` とラジオボタン | 不要 |
| Card | 見出しレベルを選べる入れ物 | 不要 |
| Badge | `<span>` | 不要 |
| Tabs | ARIA tabs をサーバーで描画 | 切り替えにランタイムが必要 |
| Accordion | `<details name>` | 不要 |
| Separator | `<hr>` | 不要 |
| Skeleton | CSS のみ | 不要 |
| Spinner | `role="status"` | 不要 |
| Dialog | `<dialog>` と invoker commands | 不要 |
| Popover | `popover` と CSS anchor positioning | 不要 |
| Tooltip | `popover="hint"` と `interestfor` | Chromium は不要。ほかはランタイム |
| Toast | `popover="manual"` と `aria-live` | 表示に必要（`toast()` を呼ぶ） |

JavaScript なしで機能が欠けるのは、Tabs の切り替え（`defaultValue` のパネルだけが見える）と、Chromium 以外のツールチップ、トーストの 3 つ。

## 検証結果

| 対象 | 件数 | 結果 |
|---|---|---|
| 単体テスト（トークン、CLI の add と update、lint ルール、違反見本） | 69 | すべて成功 |
| playground の E2E（部品の振る舞い、キーボード、JS なし、機能検出、axe、アクセシビリティツリー） | 264（うち 7 件スキップ） | すべて成功 |
| Next.js 16.4 の本番ビルドの E2E（JS あり・なし、ランタイム、送られる JS の中身） | 36 | すべて成功 |
| 型チェック（TypeScript 6.0.3）・lint（リポジトリ全体） | — | 通過・違反 0 件 |

スキップの 7 件は、そのエンジンでは測れない項目。Phase 0 からの 5 件に、「スクリプトなしのツールチップ」（`interestfor` は Chromium だけ）の Firefox と WebKit の 2 件が加わった。

### アクセシビリティ

- **axe（WCAG 2.2 の A・AA）**: ギャラリー全体と、メニュー・ツールチップ・トースト・モーダルの上のトーストを開いた状態を、2 パック × ライト／ダーク × 3 エンジンで検査し、違反 0 件。
- **名前と説明**: Field・Checkbox・Switch・RadioGroup の説明文は、名前ではなく説明として読み上げられることをテストで確認した。
- **スクリーンリーダー**: 実機での確認はまだ（Phase 0 からの持ち越し）。

### Server Components とクライアントに送られる JS

- Next.js の本番ビルドで、ブラウザが読み込む JS を取得し、部品のコードにしかない文字列が 1 つも含まれないことをテストにした。Phase 0 では手で確かめただけだったものを、自動の検査にした。
- 送られるのは任意のランタイムだけ。`toast()` をクライアントから呼ばないページでは、トーストを作るコードも tree-shaking で消える。

### `yourlib update`

- 元のファイル（`.yourlib/base`）を基準に、手元のファイルと新しい版を `git merge-file` で 3-way merge する。
- 手を入れていないファイルはそのまま置き換え、重ならない変更は自動で合わせ、重なる変更は diff3 形式の衝突マーカーを残す（終了コード 2）。衝突時は、エージェントにも分かる直し方を表示する。
- 配布データのハッシュが合わないときは、更新を拒否する。

## サイズ（minify + gzip、React は含まない）

| | yourlib | Radix | Ark UI | React Aria | Base UI |
|---|---|---|---|---|---|
| Dialog・Popover・Menu・Select・Tabs・Tooltip | **3.78 KB**（ランタイム込み） | 43.31 KB | 58.46 KB | 66.11 KB | 85.52 KB |
| Dialog と Popover | **1.00 KB** | 25.72 KB | — | — | 42.71 KB |

- yourlib の全 21 部品で 4.92 KB、ランタイムだけなら 1.94 KB。Server Components で使えば、部品の分は 0 KB。
- CSS は部品のスタイルが 5.51 KB、パック 2 つで 1.80 KB。
- 計測は `node scripts/size.ts <benchDir>`。

## 途中で分かったこと・決めたこと

- **モーダルの外のトーストは操作できない**: ネイティブのモーダルダイアログが開くと、ダイアログの外は inert になる。トーストは見えていても、押せず、読み上げもされない。そこで、モーダルが開いているあいだは、そのダイアログの中に出口の領域を作ってトーストを出し、閉じたら残りをページの領域に戻すようにした。React が描画した Toaster 自体は動かさない。
- **説明文が名前に混ざる**: Checkbox などは `<label>` が説明文まで包むため、説明文が名前の一部として読み上げられていた。説明文は `aria-describedby` で結び、名前の計算からは外した。id は `useId` で作る。`useId` は状態を持たず、Server Components でも使える（React のサーバー用ビルドにも含まれる）。
- **入力欄の枠に専用のトークン**: Lucent の `border-control` はガラスの縁の光なので白い。入力欄に使うと明るい背景で見えなくなるため、`color.border-field` を分けた。
- **危険の色の文字**: エラー文やメニューの「削除する」は、danger の色を文字色の方向へ混ぜて、少し暗い面の上でも 4.5:1 を保つようにした（Graphite のライトで 4.33:1 になっていた）。
- **ブラウザの対応状況**（`docs/phase0/features/*.json`）: `interestfor` は Chromium だけ。`interpolate-size` は Firefox と WebKit が未対応なので、アコーディオンは動きなしで開閉する。`base-select` は Chromium と Safari が対応し、Firefox は一覧が OS 標準になる。
- **メニューボタンの作法**: トリガーで ↓ を押すと最初の項目、↑ を押すと最後の項目で開くようにした（WAI-ARIA のメニューボタンの作法）。
- **Safari のフォーカス**: Phase 0 と同じく、Safari はクリックでボタンにフォーカスしない。メニューもマウスで閉じたときはトリガーにフォーカスが戻らない。キーボードなら戻る。
- **lint の新しいルール `tabs-match`**: Tabs.Tab と Tabs.Panel の value の食い違い、存在しないタブを指す `defaultValue` を検出する。型では防げず、画面に何も表示されなくなる誤りなので、エラーにした。
- **SKILL.md の誤り**: 基本ルールが存在しないコマンド（`yourlib add-variant`）を案内していたので直した。新しい部品とランタイムの決まりも加えた。

## 設計ドラフトの Phase 1 との差

設計ドラフト（`docs/design/00-design-draft.md` の 13 節）では、Phase 1 は「MVP の公開」で、完了の条件に次を挙げている。このうち、今回の範囲（Phase 0 の報告書で決めた「部品の拡張」と「`yourlib update`」）に入っていないものが残っている。

| 条件 | 状態 |
|---|---|
| 約 20 部品 | 済み（21 個） |
| lint・Skill・lockfile・ドキュメント | 済み |
| 全部品が axe とキーボードのテストを通る | 済み |
| 3 パック | 2 パックに決めた（Graphite・Lucent） |
| 見た目の回帰テスト | 済み。`pnpm test:visual`（Chromium のみ）。ギャラリーの 20 の節（21 部品）× 2 パック × 2 テーマと、開いた状態 5 種（メニュー・ツールチップ・ポップオーバー・ダイアログ・トースト）で 100 枚。基準画像は `tests/visual/__screenshots__/darwin/`、更新は `pnpm test:visual:update`。OS のフォントで描くため環境で結果が変わるので、`pnpm verify` には入れていない |
| AI に画面を作らせたときの lint 通過率の計測と公開 | 済み（[ai-lint-rate.md](ai-lint-rate.md)）。`claude -p` の `claude-opus-5-5` に、課題 10 個（`evals/ui-tasks/`）を 3 回ずつ書かせた。最初の計測（7 ルール）で見つかった穴を直し（`no-raw-color` のエラー文に直した形を書く、`join(" ")` の className を見る、`valid-token`・`valid-import` を追加、SKILL.md にトークンの一覧）、測り直した。資料（llms.txt と SKILL.md）を渡すと、1 回目から 30/30 が lint 0 件・型エラー 0 件。渡さないと、1 回目 0/30、lint の指摘で 1 回直させて 16/30、型エラー 0 件は 7/30（前の計測の出力を同じ 9 ルールで数えると、どちらも 1/30）。lint を通っても、部品にない props（`onOpenChange` など）の型エラーが 11 件残る。再計測は `node scripts/ai-lint-rate.ts --trials 3` |
| 公開（npm、配布データのホスティング、署名と来歴） | まだ |

`yourlib update`（3-way merge）は、設計ドラフトでは Phase 2 の予定だったものを前倒しした。

## 次

- スクリーンリーダーの実機確認（VoiceOver・NVDA・TalkBack）。
- lint 通過率の計測で残った穴を埋める（[ai-lint-rate.md](ai-lint-rate.md) の「9 ルールでの計測で見つかった穴」）。部品にない props と契約にない値（`onOpenChange`、Toaster の `position="bottom-right"` など）を検出する、`valid-import` の候補に必須の props を添える（`<Menu.Trigger menu="…">`）、`no-visual-override` のエラー文にその部品の props（Card の `padding`、Badge の `tone`）を示す。直したら `--trials 3` で測り直す。
- 見た目の回帰テストを CI で回すなら、Linux の基準画像を Playwright の公式 Docker イメージで作り、macOS の基準画像とは分けて持つ。
- 名前を決める（パッケージのスコープ、CLI の名前）。決まれば公開の準備に入れる。
- ~~playground のトップページ（Showcase）にある手作りのチェックボックスや入力欄を、新しい部品に置き換える。~~ 2026-10-22 に済み。比較（`/proposals/showcase-components.html`）を見て決めた案で置き換えた。チェックボックス・フィルタ・タスク追加のダイアログ・説明会のタイルを部品にし、タスクの状態の表示とヒーローのリンクは今のまま残した。あわせて、チェックしたときの色を action から accent（選択の色）に変えた。Graphite の「色が出るのはフォーカス・選択・危険だけ」という決まりに合わせるため。
- 状態が変わるときの動き（チェックの印、ラジオの点、スイッチのつまみ、タブの下地、トースト、スピナー、Accordion のフェード）を、比較（`/proposals/motion.html`）を見て全部入れた（2026-10-22）。
- Phase 2 の部品: Combobox、DateField、サブメニュー。

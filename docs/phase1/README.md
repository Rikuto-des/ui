# Phase 1 の結果（2026-10-22）

## 2026-10-28：shadcnとの実画面比較と詳細プレビューの仕上げ

- shadcnのDialog・Accordion・Tabs・Checkboxを実操作し、Buttonも目視比較。Urushiのフォーム、見出し、余白、選択時の動き、Tooltipを調整した。
- 入力と選択の枠を背景に対して3:1以上にし、実線のフォーカス、コントラストテーマ、動きを減らす設定を改善。デモの保存・入力修正とガイドの文言も整理した。
- Chromium・Firefox・WebKitの153項目が全合格。48種類の詳細を2パック×明暗の576条件でaxe・320px表示検査。単体14件、型・lint・strict診断・本番ビルドも通過。文言・説明アイコンの最終修正後は関連9件を確認。
- 保存済みAI出力8件の再計測は共通32テストが通過。CSS・React込み86.22–86.23 KiB。新たなAI呼び出しは行っていない。[実画面・操作・修正内容・未検証範囲](../../evals/design-review/2026-10-28/README.md)。

## 2026-10-28：操作できる48種類の一覧プレビュー

- 一覧の全48種類に公開Reactコンポーネントの実プレビューを追加。検索・分類後も入力と選択を保持し、各カードから詳細ページを開ける。
- コンポーネント本体の文字サイズ、角丸、境界線、影、CardとAccordionの余白、BadgeとPopoverの見出しを調整。サイトのTable用CSSとの干渉も取り除いた。
- Chromium・Firefox・WebKitのサイト126項目が全合格。48種類を両パック・明暗・320px／1440pxで検査し、axe違反0件。型・lint・strict診断・単体13件・本番ビルドも通過。
- 保存済みAI出力8件の再計測は共通32テストが通過し、CSSとReactを含む合計はUrushi約86.1 KiB。[画面・操作・検証記録](../../evals/catalog/review/README.md)。

## 2026-10-28：パネルの連続変形とコンポーネントサイト

- 共有の背景が240msで位置・幅・高さを変え、途中の切替もその瞬間の形からつながる。文字の拡大縮小は行わない。キーボード切替、動きを減らす設定、後片付けを含む。
- サイトをコンポーネントの検索・Preview / Code・ページ内目次を中心に再構成。Components／コンポーネントに用語を統一した。デスクトップと320pxで実際に操作・目視確認した。
- サイト111項目を検証。初回110合格、Firefoxの非表示アニメーションを待つ検査を修正後、対象3項目は全合格。型・サイトlint・strict診断・本番ビルド・単体9件も通過。
- 保存済みAI出力8件を再ビルドし、4ライブラリ共通32テストが通過。UrushiはJS＋CSS・React込み86.1 KiB、この条件で約5–25%小さい。新しいAI呼び出しはしていない。[動画・画面・測定条件](../../evals/navigation/review-morph/README.md)。


## 2026-10-28：Navigation Menuのホバー・横開き

- ホバーの遅延切替、斜め移動の猶予、横開き、画面端での反転、スクロール追従を追加。ネイティブのトップレイヤーを使い、DOMの順序とJavaScriptなしの開閉を保つ。RTL、タッチ、狭幅、キーボード、機能の無効化にも対応した。
- 見出し・矢印・現在地・余白・影を調整。実画面で親子の移動、Escape、スクロール、2列表示、明暗・パック切替を操作した。3ブラウザーのサイト回帰96件と、比較表更新後の関連15件が通過。型・サイトlint・Urushi診断・生成物とCSSの単体9件・本番ビルドも通過した。
- 保存済みのAI生成コード8件を変更せず、4ライブラリで再ビルド。共通CSSを前回と同一に固定し、全8画面・32テストが通過した。Urushiは機能追加で合計約2.2 KiB増え、85.4 KiB。この条件のJSは約57〜85%、CSS・React込みは約6〜26%小さい。新しいAI呼び出しはしていない。
- [確認した画面・サイズ・残る範囲](../../evals/navigation/review-hover/README.md)。実機スクリーンリーダー、多モデル比較、共有パネルの連続移動・変形は未検証または未実装。

## 2026-10-27：Navigation Menuの実モデル比較とデザイン刷新

- Urushi・Base UI・Radix・shadcnで同じNavigation Menuを生成し、仕様変更と不具合修正まで実行。最終2実験で実モデル応答27件、同じ不具合を入れた8件を保存した。Urushi・Base UI・Radixは各2件で同点。少数の試行を一般的な成功率の順位として扱わない。
- この条件でUrushiのJSはReact外部化で約71〜90%、CSS・React込みで約8〜28%小さかった。入力トークンはRadixより多い。[結果](../../evals/navigation/REPORT.md)・[条件と再実行](../../evals/navigation/README.md)。
- 高速なグループ切替の競合を修正。2列のパネルと狭幅での1列表示を追加した。型生成では数値リテラルのunionを保持する。`context --compact`は契約を保持して関連するトークンに絞る。Urushiの生成・仕様変更・修正の6画面は独自診断も0件。
- GraphiteとLucentの文字・色・余白・角丸・影・動きを調整。Lucentを青系に統一し、カードの強い透過を抑えた。トップと一覧に、検索・タブ・チェック・タスク追加と削除が動く見本を追加した。見本のアバターとバッジのコントラストも修正。
- サイトはChromium・Firefox・WebKitの69項目が通過。トップの比較値を今回の実測データへ更新した後、関連18項目も通過。47部品×2パック×明暗×2幅の376条件でaxeと横はみ出しを検査した。型・サイトlint・Urushi診断が通過し、CLIの関連単体10件も通過。AI応答27件と注入8件のハッシュ照合も通過。[最終レビュー](../../evals/navigation/review/README.md)。
- デスクトップの見本を実際に操作し、タスク追加・進捗・Dialogのフォーカス復帰とNavigation Menuの2列表示を確認した。ホバー追従・横へ飛び出すサブメニュー、実機スクリーンリーダー、多モデル比較は未実装または未検証。

以下はそれぞれの時点の記録。

## 2026-10-27：CSS・依存更新・Navigation Menu（AI比較前）

- 部品ごとのCSS出力と `urushi css` を追加。今回の6画面では部品＋パックCSSが11.2→2.8–3.0 KiB、React・共通CSS込みが85.7–86.1 KiBになった。
- React 19.3.0→19.3.1、Base UI 1.8.0→1.9.0、Radix UIとshadcnのRadix依存1.7.0→1.8.1を実インストールして比較。4ライブラリとも更新で増えた失敗は0。ここでUrushiだけの優位性は出ていない。
- Navigation Menuを追加。ネイティブの入れ子開閉、キーボード、RTL、320px、JavaScript無効時を確認。デスクトップのアクセシビリティツリーとSafariのDialogフォーカス復帰も修正。
- 単体263件、関連E2E139件（2件スキップ）、サイト60件、現在の6画面の3ブラウザー検査72件が通過。47部品のCSS照合376件と、最後に変更したNavigation Menuの8条件も通過。
- [実験記録・限界・再実行方法](../../evals/lifecycle/README.md)。この時点ではNavigation Menuの競合AI生成、主要バージョン移行、多モデル比較は未実施。


## 2026-10-27 の競合比較と追加改善

AIによる生成・修正・仕様更新を4ライブラリで実測した。最終比較は検査方法を固定してから実施している。[結果とサイズ比較](../../evals/competition/REPORT.md)、[条件と再実行方法](../../evals/competition/README.md)、[生データ](../../evals/competition/runs/measured-v4/results.json)を参照。

`urushi context`で契約・デザイン規約・トークンをまとめて取得できるようにした。外部ボタンからタブを選ぶ`Tabs.Activate`と参照先のlint検査を追加した。CSSリセット後のDialogの中央配置を修正し、成功時に閉じてから状態を変更する手順を契約へ追加した。

本体の検証は単体260件、部品E2E394件成功・11件スキップ、Next.js E2E36件成功。比較の共通検査とは別に、外部タブ操作とCSSリセットの回帰をChromium・Firefox・WebKitで確認した。更新課題はアプリの仕様追加であり、依存ライブラリの実バージョン移行の比較は未実施。

## 2026-10-27 のレビューと改善（競合比較前の記録）

現在は47部品、10種類のlintルールを持つ。以下のPhase 1本文は10月22日の記録であり、現在の部品数やサイズを示すものではない。

AIでアプリを作る開発者・チームに向け、契約の取得から検査、修正、更新まで同じ仕様を使えるようにした。

- `urushi describe <name>`：型・lintと同じ契約から、部品とサブ部品の仕様をJSONで返す。
- `urushi check --project tsconfig.json --strict --json`：型と契約を検査し、ファイル・行・列、診断、関連する契約、未検証の範囲を返す。プロジェクトのESLint設定は実行せず、無効化コメントも受け付けない。検査対象が空・対象外なら失敗する。指定された生成UIも検査する。
- `pnpm proof:agent`：意図的に誤った例と修正版を検査し、7件のエラーから0件になる結果を`generated/agent-proof.json`へ保存する。AIの生成成功率を測る比較実験ではない。
- CLIの追加・更新：全対象のハッシュと保存先を事前検証する。パストラバーサル・シンボリックリンク経由の書き込みを拒否し、編集済みファイルの追跡と未解決の衝突を保持する。
- 通知・ツールチップ：表示直前の取消、キーボードフォーカス中の表示維持、後片付け後のタイマー発火を修正した。
- サイト：スマートフォンでも目次とテーマ選択を使えるようにした。パックとテーマを連続変更すると選択が戻る問題も修正した。

実行した検証：全体の`pnpm verify`成功後、最後の変更に関係する単体テスト・型・lint・サイト・視覚テストを再実行した。最終結果は単体253件成功、部品E2E385件成功・11件スキップ、Next.js E2E36件成功、サイトE2E45件成功。視覚回帰217件成功後、ランタイム修正に関係する8件も再確認した。サイトは390pxとデスクトップで実際に操作し、320pxは自動テストで確認した。

Next.jsは16.4.3へ更新した。npm監査は依存情報の送信を自動承認レビューで拒否されたため未実施。実機スクリーンリーダー、実デバイス、競合と同じ条件でのAI生成・修正・更新の比較も未検証。静的検査の合格だけで画面や操作の品質を保証するものではない。

現在のサイズ（`pnpm size`、minify + gzip、Reactを除外）：6部品とランタイム4.05 KB、全47部品9.12 KB、ランタイム2.10 KB、部品CSS10.16 KB。競合のサイズを今回再計測したものではない。

---

部品を 3 個から 21 個に増やし、`urushi update` で更新を取り込めるようにした。部品はすべて Server Components のまま描画でき、多くはブラウザ標準の要素だけで動く。JavaScript が要るところは、任意で入れるランタイム（gzip で 1.94 KB）が受け持つ。

`pnpm verify` 1 つで全部を検証できる（生成 → 型チェック → 単体テスト → lint → 静的ページ → E2E → Next.js の E2E）。

## できたもの

| 領域 | 中身 |
|---|---|
| 部品 | 21 個（下の表）。契約 `contracts/*.contract.ts` から型・ドキュメント・lint 用データ・SKILL.md・配布データを生成する |
| ランタイム | `@urushi/core` の `installRuntime()`（React からは `<UrushiRuntime />`）。メニューとタブのキーボード操作、Chromium 以外でのツールチップ、`<dialog closedby>` の代わり、トースト |
| パック | Graphite・Lucent に 7 個のトークンを追加（リンク色、入力欄の枠、スイッチのトラックとつまみ、Skeleton、ツールチップの地と文字、バッジの角） |
| CLI | `urushi update [name...] [--dry-run] [--json]`。3-way merge で、手を入れた部品にも更新を取り込む。`urushi diff` は未解決の衝突も報告する |
| lint | ルールを 9 個に（`tabs-match`、計測のあとで `valid-token`・`valid-import` を追加）。新しい部品にも契約から自動で効く |
| playground | 部品ギャラリー `/components.html` と、スクリプトが 0 個の版 `/static/components.html` |
| デザインシステム | https://claude.ai/artifact/81F4wiBJYhaYfJKNKvqqZg を第 4 版に更新。21 部品のガイドとプレビュー、`index.d.ts` を契約から生成 |
| Next.js の例 | `urushi add` で 11 部品を追加し、Server Components のまま動くことを確認 |

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

### `urushi update`

- 元のファイル（`.urushi/base`）を基準に、手元のファイルと新しい版を `git merge-file` で 3-way merge する。
- 手を入れていないファイルはそのまま置き換え、重ならない変更は自動で合わせ、重なる変更は diff3 形式の衝突マーカーを残す（終了コード 2）。衝突時は、エージェントにも分かる直し方を表示する。
- 配布データのハッシュが合わないときは、更新を拒否する。

## サイズ（minify + gzip、React は含まない）

| | Urushi | Radix | Ark UI | React Aria | Base UI |
|---|---|---|---|---|---|
| Dialog・Popover・Menu・Select・Tabs・Tooltip | **3.78 KB**（ランタイム込み） | 43.31 KB | 58.46 KB | 66.11 KB | 85.52 KB |
| Dialog と Popover | **1.00 KB** | 25.72 KB | — | — | 42.71 KB |

- Urushi の全 21 部品で 4.92 KB、ランタイムだけなら 1.94 KB。Server Components で使えば、部品の分は 0 KB。
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
- **SKILL.md の誤り**: 基本ルールが存在しないコマンド（`urushi add-variant`）を案内していたので直した。新しい部品とランタイムの決まりも加えた。

## 設計ドラフトの Phase 1 との差

設計ドラフト（`docs/design/00-design-draft.md` の 13 節）では、Phase 1 は「MVP の公開」で、完了の条件に次を挙げている。このうち、今回の範囲（Phase 0 の報告書で決めた「部品の拡張」と「`urushi update`」）に入っていないものが残っている。

| 条件 | 状態 |
|---|---|
| 約 20 部品 | 済み（21 個） |
| lint・Skill・lockfile・ドキュメント | 済み |
| 全部品が axe とキーボードのテストを通る | 済み |
| 3 パック | 2 パックに決めた（Graphite・Lucent） |
| 見た目の回帰テスト | 済み。`pnpm test:visual`（Chromium のみ）。ギャラリーの 20 の節（21 部品）× 2 パック × 2 テーマと、開いた状態 5 種（メニュー・ツールチップ・ポップオーバー・ダイアログ・トースト）で 100 枚。基準画像は `tests/visual/__screenshots__/darwin/`、更新は `pnpm test:visual:update`。OS のフォントで描くため環境で結果が変わるので、`pnpm verify` には入れていない |
| AI に画面を作らせたときの lint 通過率の計測と公開 | 済み（[ai-lint-rate.md](ai-lint-rate.md)）。`claude -p` の `claude-opus-5-5` に、課題 10 個（`evals/ui-tasks/`）を 3 回ずつ書かせた。最初の計測（7 ルール）で見つかった穴を直し（`no-raw-color` のエラー文に直した形を書く、`join(" ")` の className を見る、`valid-token`・`valid-import` を追加、SKILL.md にトークンの一覧）、測り直した。資料（llms.txt と SKILL.md）を渡すと、1 回目から 30/30 が lint 0 件・型エラー 0 件。渡さないと、1 回目 0/30、lint の指摘で 1 回直させて 16/30、型エラー 0 件は 7/30（前の計測の出力を同じ 9 ルールで数えると、どちらも 1/30）。lint を通っても、部品にない props（`onOpenChange` など）の型エラーが 11 件残る。再計測は `node scripts/ai-lint-rate.ts --trials 3` |
| 公開（npm、配布データのホスティング、署名と来歴） | まだ |

`urushi update`（3-way merge）は、設計ドラフトでは Phase 2 の予定だったものを前倒しした。

## 次

- スクリーンリーダーの実機確認（VoiceOver・NVDA・TalkBack）。
- lint 通過率の計測で残った穴を埋める（[ai-lint-rate.md](ai-lint-rate.md) の「9 ルールでの計測で見つかった穴」）。部品にない props と契約にない値（`onOpenChange`、Toaster の `position="bottom-right"` など）を検出する、`valid-import` の候補に必須の props を添える（`<Menu.Trigger menu="…">`）、`no-visual-override` のエラー文にその部品の props（Card の `padding`、Badge の `tone`）を示す。直したら `--trials 3` で測り直す。
- 見た目の回帰テストを CI で回すなら、Linux の基準画像を Playwright の公式 Docker イメージで作り、macOS の基準画像とは分けて持つ。
- ~~名前を決める（パッケージのスコープ、CLI の名前）。~~ 2026-10-22 に Urushi に決めた（`@urushi/*`、CLI は `urushi`）。npm の org `urushi` はまだ作っていない。
- ~~playground のトップページ（Showcase）にある手作りのチェックボックスや入力欄を、新しい部品に置き換える。~~ 2026-10-22 に済み。比較（`/proposals/showcase-components.html`）を見て決めた案で置き換えた。チェックボックス・フィルタ・タスク追加のダイアログ・説明会のタイルを部品にし、タスクの状態の表示とヒーローのリンクは今のまま残した。あわせて、チェックしたときの色を action から accent（選択の色）に変えた。Graphite の「色が出るのはフォーカス・選択・危険だけ」という決まりに合わせるため。
- ドキュメントサイト `apps/site` を、Urushi の部品だけで作った（2026-10-22）。Next.js 16.4 の静的書き出しで 32 ページ（26 部品を足して 58 ページ）。部品のページは契約（`generated/schema`）とデザインシステムのガイドから作るので、説明がコードとずれない。`pnpm test:site`（`pnpm verify` に含む）で、全ページの表示、JS なしの動作、送られる JS に部品のコードがないこと、2 パック × 2 テーマの axe を 3 エンジンで確かめている。公開先（GitHub Pages など）はまだ決めていない。
- 状態が変わるときの動き（チェックの印、ラジオの点、スイッチのつまみ、タブの下地、トースト、スピナー、Accordion のフェード）を、比較（`/proposals/motion.html`）を見て全部入れた（2026-10-22）。
- ブラウザ標準だけで作れる 26 部品を足して、47 部品にした（2026-10-22）。
  - 操作：ButtonGroup、Toggle、ToggleGroup。入力：InputGroup、Slider、DateInput、FileInput、OTPInput。表示：Avatar、Kbd、Table、Collapsible、AspectRatio、ScrollArea、Carousel。状態：Alert、Progress、Meter、Empty。ナビゲーション：Breadcrumb、Pagination、Steps、Sidebar。重なり：AlertDialog、Sheet、HoverCard。
  - どれも Server Components のまま描画でき、JavaScript が要るのは Chromium 以外での HoverCard の表示だけ（Tooltip と同じランタイムが補う）。
  - それぞれに契約・部品・2 パックの CSS・ギャラリー・サイトのページ・デザインシステムのガイドとプレビューを用意した。テストは `tests/e2e/native-set.spec.ts`（3 エンジン）、JS なしの静的ページ、開いた AlertDialog・Sheet・HoverCard を含む axe、見た目の回帰テスト（217 枚）。
  - 途中で直したこと：読み込めない Avatar の写真は、ブラウザの壊れた画像のアイコンの上に頭文字を描く（壊れた `<img>` だけが疑似要素を描くことを使う。JS なし）。Lucent のスクワークルの角丸が Sheet の画面の端の角まで丸めていたので、端は四角のままにした。Sidebar のグループ見出しを text-subtle から text-muted にした（Graphite ライトで 4.5:1 に届かなかった）。Firefox は閉じた `<details>` の中のトランジションを進めないので、テストの「動きが止まるのを待つ」から描画されていない要素を外した。
  - lint：アイコンだけの Toggle と ToggleGroup.Item にも `aria-label` を求める（accessible-name）。
  - デザインシステムの Dialog・AlertDialog の「開いた状態の見本」で、ボタンが枠の下にはみ出していた（2026-10-24 に指摘を受けて修正）。見本はトップレイヤーではなくページの中に置くので、ダイアログの高さの上限（`100%`）が grid の行の高さになり、中身より短くなっていた。本物のモーダルは 3 エンジン・2 つの幅で問題ないことを確かめた。`pnpm ds:check` に、開いたダイアログやポップオーバーが中身より短くないかの検査を足した。
  - Next.js（Turbopack）のビルドは、Carousel の `::scroll-button()` と `::scroll-marker` を知らないという警告を出すが、規則は消さずに書き出す（サイトの書き出しで、計算済みのスタイルに効いていることを確かめた）。
- Phase 2 の部品（JavaScript が要るもの）：Combobox、Command、DatePicker、ContextMenu、Menubar / NavigationMenu、サブメニュー、DataTable。

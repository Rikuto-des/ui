# AI に画面を作らせたときの lint 通過率

設計ドラフト（`docs/design/00-design-draft.md` の 13 節）で Phase 1 の完了条件にした「AI に画面を作らせたときに lint が通った割合を測って公開する」の計測。Urushi の価値の 1 つである「AI で崩れない」が、資料（llms.txt と SKILL.md）と lint のエラー文でどこまで成り立つかを見る。

## 測り方

| 項目 | 内容 |
|---|---|
| 課題 | 10 個（[`evals/ui-tasks/`](../../evals/ui-tasks/)）。設定画面、ログインフォーム、タスク一覧の行メニュー、削除確認ダイアログ、タブの詳細ページ、会員登録とプラン選択、一覧のフィルター、エディタのツールバー、ヘルプページ、ダッシュボードのカード |
| 条件 A | システムプロンプトに `generated/llms.txt` と `generated/SKILL.md` をそのまま入れる |
| 条件 B | 何も渡さない。「`@urushi/react` の部品を使う」とだけ伝える |
| 呼び出し方 | `ANTHROPIC_API_KEY` があれば Claude API を直接呼ぶ。なければ `claude -p`（Claude Code の print モード）を使い、Claude Code のログインで動かす。`--via api` / `--via claude` で明示もできる。結果の節に、どちらで測ったかを書く |
| モデル | `claude-opus-5-5`（effort: high、思考は adaptive）。温度は指定できないので、同じ課題でも回ごとに出力が変わる |
| lint | `packages/eslint-plugin/test/fixture.test.ts` と同じ設定（recommended のルールすべて、TSX を typescript-eslint で読む）。1 回目の計測（各 1 回）は 7 ルール、2 回目（各 3 回）は `valid-token` と `valid-import` を足した 9 ルール、3 回目（各 3 回）は `valid-props` を足した 10 ルール |
| 直させる | 1 回目に lint の指摘が 1 件でもあれば、eslint の出力と同じ形で指摘を渡し、ファイル全体を書き直させる（1 回だけ） |

依頼文はどの部品を使うかを書かず、利用者がふつうに頼む書き方にした。いくつかの課題には「赤で目立たせて」「影を強めに」「幅は 400px くらい」のような見た目の指定を入れてある。正しくはバリアントやトークンで表すもので、ここで崩れるかどうかを見る。

システムプロンプトの共通部分は、React 19 + TypeScript（Next.js の App Router、Tailwind CSS あり）のアプリで、`react` と `@urushi/react` だけを import し、1 つの TSX ファイルを 1 つのコードブロックで返す、というもの。全文は `node scripts/ai-lint-rate.ts --dry-run` で表示できる。

### `claude -p` で測るときの条件と限界

条件をそろえるため、課題ごとに次のようにして `claude -p` を 1 つ起動する。

- 空の一時フォルダを作業フォルダにする。リポジトリの CLAUDE.md、プロジェクトのメモリ、ファイルには届かない。
- `--system-prompt` で、Claude Code の既定のシステムプロンプトを上の共通部分（条件 A は資料つき）に置き換える。
- `--tools ""` で道具をすべて外す（ファイルを読めない）。`--safe-mode` でユーザーの CLAUDE.md・フック・プラグイン・出力スタイルを外し、`--strict-mcp-config` と `--disable-slash-commands` で MCP サーバーとスキルも外す。
- 直させる段は、`--input-format stream-json` で同じプロセスに 2 つ目のメッセージとして送る。1 つの会話として続くので、API で測るとき（1 回目の返答をそのまま履歴に入れて続ける）と同じ形になる。

限界:

- リクエストを組み立てるのは Claude Code なので、API を直接呼んだ場合とまったく同じにはならない。`--system-prompt` は既定のシステムプロンプトを置き換えるが（`claude --help` の説明による）、Claude Code が会話に足すもの（日付などの補足）や、思考・キャッシュの設定は Claude Code が決める。送られた中身をこちらで見て確かめることはできない。
- そのため条件 B では、資料が漏れていないかを出力から確かめる（下の「数え方」）。
- `--system-prompt` を付けても、Claude Code は会話に短い補足を足す。試したところ、短いシステムプロンプトと 1 文の依頼で約 800 トークンが送られていた。モデルに尋ねると、補足はアカウント情報の扱いについての指示だけで、CLAUDE.md や言語の指示はないと答えた（`--safe-mode` で外れている）。
- 呼び出しに使うのは、シェルの `claude` と同じ Claude Code のローカルインストール（`~/.claude/local/claude`）。PATH に古い版が残っていることがあるので、それより先に探す。古い版は `claude-opus-5-5` を扱えず、400 で止まる。
- トークン数と費用は Claude Code が報告した値。費用は API の定価で換算した目安で、claude.ai のログインでの実際の請求とは別。

### 数え方

- **lint 0 件**: error と warning を合わせて 0 件。`valid-idref` と `prefer-native` は warning なので、「error 0 件」も並べた。
- **1 回直したあと**: 1 回目で 0 件だったものはそのまま数え、残りは直させたあとの結果で数える。
- **型エラー**: リポジトリの `tsconfig.json` の設定で型チェックした結果も並べた。lint は、`@urushi/react` にない名前の import と部品（`TabsTrigger`・`Tabs.Trigger` など）を `valid-import` で、部品の型が受け付けない props（`onOpenChange` など）と契約にない値を `valid-props`（10 ルールから）で見る。props の値の型（`onChange` に渡す関数の引数など）は見ない。直させるときに渡すのは lint の指摘だけ。
- **Urushi の部品の数**: 1 回目の出力にある、Urushi の部品の JSX 要素の数の平均。部品を使わずに書けば lint は通ってしまうので、その確認に使う。
- **資料の漏れ**: 条件 B の出力に、SKILL.md（か部品のソース）を読まないと書けない書き方が出ていないかを数える。対象は、Trigger の `dialog=`・`menu=` などで id を指す書き方、`var(--ur-…)`、`data-pack`、`UrushiRuntime`、Card の `headingLevel`、Badge の `tone`。

## 実行方法

```bash
node scripts/ai-lint-rate.ts
```

- `ANTHROPIC_API_KEY` がなければ `claude -p` で測る。先に `claude auth status` で `"loggedIn": true` になっていることを確かめる（なっていなければ `claude auth login`）。`claude` が PATH にないときは `CLAUDE_BIN` で場所を指定する。
- `ANTHROPIC_API_KEY` があれば API で測る。キーが通らない（401）、モデルを使えない（403・404）、ログインしていない、といった、続けても失敗するだけのときは、原因と直し方を 1 行で出して止まる。1 件も測れなかったときは、下の「結果」の節を書き換えない。

- 出力は `evals/runs/<日時>/`（課題ごとの TSX と `summary.json`）。下の「結果」の節はスクリプトが書き換える。
- `--trials 3` で各課題を 3 回ずつ実行する。課題が 10 個・1 回ずつだと、1 件で 10 ポイント動く。
- `--tasks 02,04`・`--conditions A`・`--effort xhigh`・`--model …` で絞り込みや条件の変更ができる。
- `--rescore evals/runs/<日時>` は、保存した出力を API を呼ばずに lint と型チェックだけやり直す（ルールを直したあとに使う。直させる段の出力は作り直さない）。
- 呼び出しは最大で「課題 × 条件 × 回数 × 2」回。既定（10 × 2 × 1）なら最大 40 回。
- フォールバック（拒否されたときに別のモデルで続ける機能）は使わない。別のモデルの出力が混ざるため。

<!-- results:start -->
## 結果

2026-10-22 に claude -p（2.1.296 (Claude Code)） で計測。モデルは `claude-opus-5-5`（effort: high）、課題 10 個 × 各 3 回。渡した資料は llms.txt `03f8e0de8ac6`・SKILL.md `4d53060458fa`（sha256 の先頭）。出力したファイルは [`evals/runs/2026-10-22T07-31-25Z/`](../../evals/runs/2026-10-22T07-31-25Z/)。

| 条件 | 件数 | 1 回目で lint 0 件 | 1 回目で error 0 件 | 1 回直したあと lint 0 件 | 型エラー 0 件（1 回目 → 直したあと） | Urushi の部品の数（1 回目の平均） |
|---|---|---|---|---|---|---|
| A: llms.txt と SKILL.md を渡す | 30 | **30/30（100%）** | 30/30（100%） | **30/30（100%）** | 30/30（100%） → 30/30（100%） | 9.0 |
| B: 何も渡さない | 30 | **0/30（0%）** | 0/30（0%） | **19/30（63%）** | 2/30（7%） → 30/30（100%） | 4.7 |

条件 B の 1 回目で、SKILL.md にしか書いていない書き方（Trigger の `dialog=` などで id を指す、`var(--ur-…)`、`data-pack`、`UrushiRuntime`、Card の `headingLevel`、Badge の `tone`）が出たのは 0/30（0%）。

### ルールごとの件数

| ルール | A 1 回目 | A 直したあと | B 1 回目 | B 直したあと |
|---|---|---|---|---|
| `no-visual-override` | 0 | 0 | 41 | 0 |
| `no-raw-color` | 0 | 0 | 87 | 5 |
| `valid-idref` | 0 | 0 | 0 | 0 |
| `required-props` | 0 | 0 | 33 | 0 |
| `accessible-name` | 0 | 0 | 3 | 2 |
| `prefer-native` | 0 | 0 | 0 | 0 |
| `tabs-match` | 0 | 0 | 0 | 0 |
| `valid-token` | 0 | 0 | 0 | 8 |
| `valid-import` | 0 | 0 | 109 | 0 |
| `valid-props` | 0 | 0 | 75 | 9 |
| 構文エラー（parse） | 0 | 0 | 0 | 0 |
| コードが返ってこない | 0 | 0 | 0 | 0 |

### 課題ごと

| 課題 | A 1 回目 | A 直したあと | B 1 回目 | B 直したあと |
|---|---|---|---|---|
| 01 設定画面 | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 27 件） | 1/3 回 0 件（計 2 件） |
| 02 ログインフォーム | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 17 件） | 3/3 回 0 件（計 0 件） |
| 03 タスク一覧の行メニュー | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 33 件） | 0/3 回 0 件（計 11 件） |
| 04 削除確認ダイアログ | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 64 件） | 3/3 回 0 件（計 0 件） |
| 05 タブで切り替える詳細ページ | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 45 件） | 2/3 回 0 件（計 3 件） |
| 06 会員登録とプラン選択 | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 53 件） | 0/3 回 0 件（計 6 件） |
| 07 一覧のフィルター | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 43 件） | 3/3 回 0 件（計 0 件） |
| 08 エディタのツールバー | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 10 件） | 3/3 回 0 件（計 0 件） |
| 09 ヘルプページ | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 39 件） | 3/3 回 0 件（計 0 件） |
| 10 ダッシュボードのカード | 3/3 回 0 件（計 0 件） | 3/3 回 0 件（計 0 件） | 0/3 回 0 件（計 17 件） | 1/3 回 0 件（計 2 件） |

呼び出しは 90 回。入力 180 トークン（ほかにキャッシュの書き込み 139,620、読み込み 330,455）、出力 169,652 トークン（思考を含む）。Claude Code が示した費用の目安は合計 $4.58。
<!-- results:end -->

## 読み取れること（2026-10-22、10 ルールでの各 3 回の計測）

上の結果（課題 10 個 × 各 3 回、[`evals/runs/2026-10-22T07-31-25Z/`](../../evals/runs/2026-10-22T07-31-25Z/)）から読み取れること。資料は 9 ルールの計測と同じ（llms.txt `03f8e0de8ac6`・SKILL.md `4d53060458fa`）で、変えたのは lint のルールとエラー文だけ（下の「lint の直し（2026-10-22、10 ルール）」）。比べる相手は、9 ルールでの各 3 回の計測（下の「前の計測（9 ルール）」）。`claude -p` で 90 回呼び出し、ユーザーの Claude のプランの使用量を使った（上の費用は API の定価で換算した目安）。

- **資料なしで 1 回直したあと、型エラー 0 件は 7/30 → 30/30、lint 0 件は 16/30 → 19/30**: lint 0 件の数え方は 10 ルールのほうが厳しい。9 ルールの計測の直したあとを 10 ルールで数えると 5/30 なので、同じ物差しでは 5/30 → 19/30。lint と型チェックの両方が 0 件のものは 5 件 → 19 件。lint 0 件なのに型エラーが残るものは 11 件 → 0 件になった。
- **1 回目の指摘は、エラー文だけですべて直った**: B の 1 回目の指摘 348 件のうち、直したあとに残ったものは 0 件（9 ルールの計測も 0 件）。`valid-props` の 75 件も、エラー文のとおりに書き換えた。`<Switch label="メール通知" checked={…} onCheckedChange={…} />` は `<Switch checked={…} onChange={(event) => …(event.currentTarget.checked)}>メール通知</Switch>` に、04 の `<Dialog open onOpenChange>` は `<Dialog.Trigger dialog={…}>` で開く形になった。
- **直す段で入る `required-props` がなくなった**: 9 ルールの計測では、直したあとに `required-props` が 12 件残った（`<Menu.Trigger>` に `menu`、`<Field>` に `id` がないなど）。今回は 0 件で、`MenuTrigger` は `<Menu.Trigger menu={…}>` に置き換わった。`valid-import` の候補に必須の props を添えたため。`no-visual-override` も、直したあとは 2 件 → 0 件。Card に存在しない `variant` を足した出力はなかった。
- **直したあとに残った 24 件は、すべて直す段で入ったもの**: 内訳は `valid-props` 9 件（03 の 3 回とも、`<DropdownMenuItem onSelect={…}>` を `<Menu.Item>` に置き換え、`onSelect` を残した）、`valid-token` 8 件（06 で新しく書いた `--ur-color-primary` 6 件、10 の `--ur-color-success` 2 件）、`no-raw-color` 5 件（01 で足したエラー文の `text-red-600`、05 の `text-gray-500`）、`accessible-name` 2 件（03 のアイコンだけの `<Menu.Trigger>`）。直させるのは 1 回だけなので、モデルには戻らない。
- **残りは、lint が型チェックより厳しいところ**: 直したあとは 30 件すべてが型エラー 0 件で、そのうち 11 件に lint の指摘が残った。パレットの色、存在しないトークン、押しても呼ばれない `onSelect` で、どれも型チェックでは分からない。
- **資料があれば、1 回目から崩れない（変わらず）**: 条件 A は 30 件すべてが lint 0 件・型エラー 0 件で、`valid-props` の誤検出もなかった。
- **条件 B に資料は漏れていない**: 1 回目の出力で、SKILL.md にしかない書き方が出たのは 0/30。
- 10 件・30 回の計測なので、1 回で 3 ポイント動く。回ごとに出力が変わる（B の 1 回目の `valid-import` は 102 件 → 109 件）ことも合わせて読む。

### 10 ルールでの計測で見つかった穴

- **`valid-import` が部品の置き換えを勧めるとき、その要素の props を見ていない**: `<DropdownMenuItem onSelect={…}>` には「`<Menu.Item>` を使ってください」とだけ返すので、置き換えたあとに `onSelect` が残る（03 の 3 回とも）。`DropdownMenuItem` は Urushi の部品ではないので、`valid-props` もその段では見ない。候補の部品が 1 つに決まるときは、その要素に書いた props を候補の部品で確かめ、「onSelect は onClick に書く」まで同じ指摘に入れれば、直す段で入らない見込み。
- **紫や青などの色に、合うトークンの候補がない**: `no-raw-color` が色合いからトークンを選ぶのは、赤（`--ur-color-danger`）と緑（`--ur-color-ok`）だけ。ほかの色にはプロパティごとの一般の候補（枠なら `--ur-color-border`）を出す。06 の「選択中のプランを、ブランドの紫色の枠で強調」では、候補に強調の色がないので、モデルは存在しない `--ur-color-primary` を作った（9 ルールの計測でも 6 件）。選択を表す `--ur-color-accent` か、主な操作の `--ur-color-action` を候補に入れる余地がある。
- **className の外にある、クラスを返す文字列を見ていない**: 10 は `return "bg-green-100 text-green-700"` のように関数でクラスを返していて、`no-raw-color` は 1 回目でこれを指摘していない。直す段でモデルが自分でトークンに書き換え、存在しない `--ur-color-success` を作った。`valid-token` と同じように JSX の外の文字列も見るかは、クラスの並びとふつうの文字列の見分けがつくかで決める必要がある。

3 つとも、下の「lint の直し（2026-10-22、10 ルールの計測で見つかった穴）」で直した。

## lint の直し（2026-10-22、10 ルールの計測で見つかった穴）

上の「10 ルールでの計測で見つかった穴」を、次のように直した。ルールの数は 10 個のまま。資料（llms.txt と SKILL.md）は変えていない。測り直し（`claude -p`）はしておらず、効果は保存した出力から見積もった（下の「保存した出力で見積もると」）。

| 見つかった穴 | 直したこと |
|---|---|
| `valid-import` が部品の置き換えを勧めるとき、その要素の props を見ていない | 候補の部品が 1 つに決まるときは、ファイルの中でその名前の要素に書いた props を、候補の部品で `valid-props` と同じように確かめ（型が受け付けない名前、`<Menu.Item onSelect>` のように型は通るが働かない名前、契約にない値、子要素を取らない部品の子要素）、直し方を同じ指摘に入れる。`<DropdownMenuItem onSelect={…}>` には「`<Menu.Item>` を使ってください。import するのは Menu です。`<DropdownMenuItem>` に書いた props も直してください。`<Menu.Item>` の onSelect は使えません。…押したときの処理は onClick に書きます。」と返す。同じ指摘が何度も出る書き方（項目が 3 つ）は 1 回にまとめる |
| `no-raw-color` の色合い → トークンが赤と緑だけ | 青と紫のあたり（sky・blue・indigo・violet・purple・fuchsia・cyan）に、`--ur-color-accent`、`--ur-color-action` の順で候補を出す。accent を出したときは、「選択中・フォーカス・進行中を示す色で、飾りには使いません。主な操作の色なら `--ur-color-action`（1 画面に 1 つ）」と添える。背景の淡い色（`bg-purple-50` のように 200 以下）は、色合いのトークンを面のトークン（`--ur-color-bg`・`surface`・`secondary`）のあとに回す |
| 関数が返すクラスの文字列を見ていない | className の外の文字列のうち、クラスの並びに見えるもの（下の「className の外で見る文字列」）も、className と同じように見る。その関数か変数を、同じファイルで Urushi の部品の className に渡していれば、部品の上と同じくバリアントを示す（「changeClassName は `<Badge>` の className に使われています。…色は tone（neutral \| accent \| ok \| danger）で選び…」） |

### 置き換えの候補が 1 つに決まるとき

`valid-import` が props まで確かめるのは、エラー文が 1 つの部品をその要素の代わりに置くよう勧めるときだけ。

- 名前の対応: `DropdownMenuItem`・`MenuItem` → `Menu.Item`、`DropdownMenuTrigger` → `Menu.Trigger`、`TabsTrigger` → `Tabs.Tab`、`DropdownMenu` → `Menu`、`Modal`・`AlertDialog`・`Sheet` → `Dialog`、`Toggle` → `Switch`、`Divider` → `Separator`、`Loader` → `Spinner`、`IconButton` → `Button`、`Radio` → `RadioGroup.Item`、`Tab` → `Tabs.Tab`、`TextArea` → `Textarea`。存在しない部品（`<Tabs.Trigger>`）も同じ。
- 中身の入れ物（`PopoverContent`・`DropdownMenuContent`・`DialogContent`）は、部品そのもの（`<Popover>`・`<Menu>`・`<Dialog>`）が入れ物になるので、その部品で確かめる。`<PopoverContent align="end" sideOffset={4}>` には「`<Popover>` に sideOffset という props はありません。トリガーとの間隔はパックが決めます。」が入る。
- 確かめないもの: props が 2 つの部品に分かれるもの（`TextField` は `<Field>` と `<Input>`）、props に変わるもの（`DialogTitle` → `<Dialog title="…">`）、中身を子要素に書くもの（`AccordionContent`）。これらは直したあとの `valid-props` に任せる。

### 青と紫で accent を先にした理由

SKILL.md のトークンの用途では、`--ur-color-accent` は "Focus, selection and in-progress state. Not for decoration."、`--ur-color-action` は "Fill of the primary action (one per screen)." になっている。

- `no-raw-color` が色合いから候補を選ぶのは、アプリが自分で書いた要素（div や span）の上だけ。Urushi の部品の上では、バリアントを示す。主な操作の塗りは `<Button variant="primary">` が持つので、部品でない要素の青や紫は、選択中や今の段階を表すことのほうがずっと多い。06 の「選択中のプランを紫の枠で強調」もそう。
- action を先にすると、1 画面に 1 つの主な操作と同じ色のものが、もう 1 つ画面に出る。
- accent は飾りに使わない。lint には飾りかどうかは分からないので、エラー文に用途を書き、目立たせたいだけなら `--ur-color-text` か `--ur-color-border-strong` を使うよう書いた。理由はルールのソース（`packages/eslint-plugin/src/index.ts` の `HUE_TOKENS` の上）にも書いた。

背景の淡い色を面のトークンのあとに回したのは、`bg-purple-50` は文字の後ろの面で、強調そのものではないため。accent や danger で塗ると、文字が濃い色の上に載る。06 の直したあとでも、モデルは `bg-purple-50` を `--ur-color-surface` にしていた。赤と緑も同じにした（`bg-red-50` の先頭は `--ur-color-bg`、`--ur-color-danger` はそのあと）。

### className の外で見る文字列

- すべての語が Tailwind のクラスの形をしている文字列だけを見る。形は、小文字で始まり `-` を含む（`bg-green-100`・`md:hover:p-4`）、`[color:red]` のような任意のプロパティ、`flex`・`border` のような `-` のないクラス。指摘するのは、その中のパレットの色と任意の値だけ。
- そのため、英語の文（`"Use bg-red-500 for errors"`）、日本語を含む文、CSS の値（`"1px solid red"`・`"var(--x)"`）、セレクタ（`"[data-state=open]"`）は見ない。id（`"row-menu"`）やトークンの名前（`"text-muted"`）はクラスの形をしているが、パレットの色ではないので指摘しない。
- 部品とのつながりは、同じファイルの中で、文字列を囲む関数か変数の名前が部品の className の中に出てくるか（`className={changeClassName(n)}`・`className={cn("gap-1", colorClass)}`）で見る。props を通して別の部品に渡すものや、別のファイルから import したものは追わず、トークンを示す。
- className の中の文字列は、これまでどおり className の側で見る（同じクラスを 2 回指摘しない）。

`pnpm lint`（apps・examples・scripts の .tsx）で、この変更による指摘は 0 件。対象のファイルには、className の外でクラスの形をした文字列が 222 個あるが、ほとんどは id（`"row-menu"`）、import のパス（`"react-dom"`）、トークンの名前（`"text-muted"`）で、パレットの色や任意の値を含むものはなかった。lint の対象外の `packages/*/src`・`registry`・`tests` の .tsx でも、指摘は前からある `tests/lint-fixtures/agent-written.tsx` の 10 件だけで変わらない。クラスの形をしていても、クラスとして使わない文字列（TypeScript の文字列の型 `"bg-red-500"` や、画面に出す `{"text-red-500"}`）は指摘される。リポジトリにはまだない。

### 保存した出力で見積もると

10 ルールでの計測（`2026-10-22T07-31-25Z`）の出力を、直したルールで採点し直した（`--rescore`、`claude -p` は呼ばない）。採点し直しは `summary.json` の写しで行い、`2026-10-22T07-31-25Z/summary.json` と上の「結果」の節は計測したときのまま。直させる段の出力は作り直さないので、「直したあと」の数字は変わらない。

| | 計測したとき | 直したルールで採点し直すと |
|---|---|---|
| A の 1 回目で lint 0 件 | 30/30 | 30/30（誤検出なし） |
| B の 1 回目の `no-raw-color` | 87 件 | 105 件（10 の関数が返すクラス 18 件が増えた） |
| B の 1 回目の `valid-import` | 109 件 | 109 件（件数は同じで、props の直し方が同じ指摘に入った） |
| B の 1 回直したあと lint 0 件 | 19/30 | 19/30（直す段の出力は計測したときのもの） |

1 回目のエラー文は、03・06・10 の 3 回ずつで次のように変わった。

- 03: `DropdownMenuItem`・`MenuItem` の指摘に「`<Menu.Item>` の onSelect は使えません。…onClick に書きます」が入った。`DropdownMenuTrigger`・`MenuTrigger` の指摘には、asChild の直し方（「子要素に `<Button>` を入れず、`<Menu.Trigger menu="…">` に直接文字を書きます」）が入った。
- 06: `border-purple-600` の候補の先頭が `--ur-color-border` から `--ur-color-accent` になった。`text-purple-700` も同じ。
- 10: 関数か変数が返す `bg-green-100 text-green-700` などを指摘し、`<Badge>` の className に使われているので tone で選ぶよう示す（1 回につき 6 件）。
- ほかに、09 の `AccordionItem` の指摘に `value` の直し方が入り、04 の 1 回目の `bg-red-50/40` の候補の順が変わった。どちらも直したあとは 0 件だった。

直したあとに残った 24 件のうち、今回のエラー文が 1 回目に届いていれば入らなかったと見込めるものは次のとおり。計測では、B の 1 回目の指摘 348 件のうち、直したあとに残ったものは 0 件だったので、今回のエラー文も同じように直ると仮定した。

| 課題・回 | 直したあとに残った指摘 | 見込み |
|---|---|---|
| 03 の 1 回目 | `valid-props` 3（onSelect） | 0 件 |
| 03 の 2・3 回目 | `valid-props` 3（onSelect）と `accessible-name` 1 | onSelect は入らない。`accessible-name` は残る |
| 06 の 3 回 | `valid-token` 1・2・3（`--ur-color-primary`） | 0 件 |
| 10 の 1・2 回目 | `valid-token` 1（`--ur-color-success`） | 0 件 |
| 01 の 1・3 回目、05 の 1 回目 | `no-raw-color`（直す段で書き足した `text-red-600`・`text-gray-500`） | 残る |

見込みどおりなら、B の 1 回直したあとの lint 0 件は 19/30 → 25/30。これは見積もりで、10 では 1 回目に直す指摘が 6 件増えるので、直す段で別の書き方が入るかは測り直さないと分からない。

### 残っている穴

- **直す段で書き足した色**: 01 はエラー文の `text-red-600`、05 は `text-gray-500` を、直す段で新しく書いた。直させるのは 1 回だけなので、モデルには戻らない。
- **アイコンのボタンを Trigger の中に入れ子にする**: 03 の 2・3 回目は `<MenuTrigger asChild><IconButton aria-label="…">` を `<Menu.Trigger menu="…"><Button aria-label="…">` に置き換え、ボタンの中にボタンを置いた。aria-label が内側にあるので、`<Menu.Trigger>` はアイコンだけとして `accessible-name` に指摘される。今回、asChild の直し方が `valid-import` の指摘に入ったが、aria-label を `<Menu.Trigger>` に移すことまでは書いていない。

## lint の直し（2026-10-22、10 ルール）

9 ルールでの計測（下の「前の計測（9 ルール）」）で見つかった穴を、次のように直した。ルールは `valid-props` を足して 10 個になった。資料（llms.txt と SKILL.md）は変えていない。

| 見つかった穴 | 直したこと |
|---|---|
| 部品にない props と、契約にない値を見ていない | 新しいルール `valid-props`（error）。部品に書いた props を、その部品の型が受け付ける名前（契約の props と、描画する要素の HTML 属性。作り方は下の「部品が受け付ける props の一覧」）と比べる。shadcn・Radix などの名前には Urushi での書き方を返す。`open`・`onOpenChange` は「`<Dialog.Trigger dialog="…">` と `<Dialog.Close dialog="…">` がブラウザの機能で開閉する。閉じたあとの処理は onClose」、`onCheckedChange` は「onChange で受け取り `event.currentTarget.checked` を読む」、Switch の `label` は「子要素に書く」、Textarea の `label` は「`<Field id="…" label="…">` で付ける」、Accordion の `type`・`collapsible` は「`<Accordion name="…">`、collapsible は要らない」、Tabs の `items` は「`<Tabs.List>` の中に `<Tabs.Tab value="…">`」、`asChild` は「それ自体が `<button>`」、`target`・`dialogId` は「`menu`・`dialog` で id を指す」。enum の値は契約の値と比べ、近い値を示す（`position="bottom-right"` → `bottom-end`、`variant="outline"` → `secondary`、`tone="success"` → `ok`、`headingLevel={2}` → `h2`） |
| `valid-import` の候補に、必須の props を添えていない | 候補の部品に、契約で必須の props を添える（`<Menu.Trigger menu="…">`、`<Field id="…" label="…">`、`<Tabs.Tab value="…">`、`DialogContent` には「`<Dialog id="…" title="…">` そのものが入れ物です」）。`TabList`・`TabPanel`・`Tab` にも候補を出すようにした |
| `no-visual-override` のエラー文が、その部品の props を示さない | 変えようとした見た目ごとに、その部品にある props を示す（Card の `p-8` → `padding（sm \| md \| lg）`、Badge の色 → `tone`、Button の `h-12` → `size`）。合う props がない見た目（Card の `shadow-lg`）は、その部品で選べる見た目を並べ、className から外してパックに任せるよう書く。variant のない部品に variant を勧めない。中身を並べるクラス（Card の `flex flex-col gap-6`）は、子要素に自分の要素を置いてそこに書くよう示す。`no-raw-color` の、部品の上の色についての文も同じにした（variant も tone もない部品で「パックとバリアントが決めます」と書かない） |

`valid-props` は、型は通るが Urushi では働かない書き方も指摘する。

- `<Menu.Item onSelect>`: Radix の書き方。ネイティブの `onSelect` は文字を選んだときのイベントで、項目を押しても呼ばれない。9 ルールの計測では、B の 03 は 3 回とも、直したあとの `<Menu.Item>` に `onSelect` が残っていた。lint も型チェックも通るので、どちらの数字にも出ていなかった。
- `<Accordion defaultValue>`: 開く項目を選ぶ働きはない（最初に開く項目は `<Accordion.Item defaultOpen>`）。
- 子要素を取らない部品（Spinner・Toaster・Menu.Separator）の子要素。Spinner には `label` を示す。

エラー文で勧めた書き方（Switch・Checkbox・Select の onChange、RadioGroup.Item の onChange、Popover と Menu の onToggle、Dialog の onClose、Tabs の `ur-tabs-change`）は、リポジトリの `tsconfig.json` の設定で型チェックが通ることを確かめた。RadioGroup は、`<fieldset>` の onChange で `event.target` を `HTMLInputElement` にする書き方が型エラーになるので、それぞれの `<RadioGroup.Item>` の onChange で受け取るよう書いた。

### 部品が受け付ける props の一覧

`urushi build` が TypeScript のコンパイラで `@urushi/react` の各部品の props の型（`React.ComponentProps<typeof Dialog.Trigger>` など）を読み、契約の props 以外に受け付ける名前を `contracts.generated.json` に書く。`attributes` はその部品だけが受け付ける HTML 属性、`omits` はどの要素も受け付ける属性のうち、その部品が受け付けないもの。どの要素も受け付ける属性（`className`・`onClick`・`key`・`ref` など 227 個）は `library.generated.json` の `attributes` に 1 回だけ書く。生成にかかる時間は 0.3 秒ほど。

- 契約の `element` の HTML 属性をそのまま使わず、型から読んだ。そのままでは型と食い違うため。Checkbox・Switch・RadioGroup.Item は `<label>` を描くが、props の残りは中の `<input>` に渡すので `checked` を受け付ける。Dialog と Accordion.Item は `open` を、Menu・Popover・Tooltip は `popover` と `role` を、Spinner と Toaster は子要素を受け付けない。部品の型を変えれば、`pnpm gen` で lint も追いつく。
- `aria-*`・`data-*` のように `-` を含む名前は見ない。TypeScript も、型にない `-` 入りの属性を通す。
- 値は、静的に分かるもの（`"x"`、`{a ? "x" : "y"}`、`{2}`、値のない属性の `true`）だけを契約の enum と比べる。
- 別のパッケージから import した同じ名前の部品（`@radix-ui/react-dialog` の Dialog）と、ファイルの中で定義した部品は見ない。パスから import したものは、ファイル名が契約の名前と同じとき（`urushi add` で入れた `@/components/ui/button`）だけ、Urushi の部品として見る。
- typescript は、リポジトリのルートの devDependencies のものを使う。`urushi build` はリポジトリの中でしか動かない。

### 9 ルールの計測を 10 ルールで採点し直すと

9 ルールでの計測（`2026-10-22T06-38-23Z`）の出力を、10 ルールで採点し直した（`--rescore`、API は呼ばない）。直させる段の出力は作り直さないので、「直したあと」は 9 ルールのエラー文で直した出力を 10 ルールで数えたもの。採点し直しは `summary.json` の写しで行い、`2026-10-22T06-38-23Z/summary.json` は計測したときのまま（9 ルールでの採点）にした。

| 条件 | 1 回目で lint 0 件（9 → 10 ルール） | 1 回直したあと lint 0 件（9 → 10 ルール） | 直したあと lint 0 件なのに型エラーが残る（9 → 10 ルール） |
|---|---|---|---|
| A | 30/30 → 30/30 | 30/30 → 30/30 | 0 件 → 0 件 |
| B | 0/30 → 0/30 | 16/30 → 5/30 | 11 件 → 0 件 |

- A の 30 件（1 回目ですべて 0 件だったので、直させていない）とリポジトリの `apps/`・`examples/`・`scripts/` で、`valid-props` の指摘は 0 件。資料どおりに書いたものを誤って指摘することはなかった。
- B の `valid-props` の指摘は、1 回目で 83 件、直したあとで 94 件。直したあとのほうが多いのは、直す段で shadcn の部品を Urushi の部品に置き換え、props を shadcn のまま残したため（`<Switch label="…" onCheckedChange={…}>`、`<Dialog open onOpenChange>`）。9 ルールのエラー文は props を見ないので、モデルに戻らなかった。
- 直したあとの「lint 0 件」と「型エラー 0 件」の食い違いは 13 件から 2 件になった。残った 2 件は、10 の存在しないトークン（`--ur-color-success`）で、lint だけが指摘する（型では分からない）。lint と型チェックの両方が 0 件のもの（02・08 の 3 回・10）は 5 件のまま。

## lint と資料の直し（2026-10-22、9 ルール）

7 ルールでの計測（下の「前の計測（7 ルール）」）で見つかった穴を、次のように直した。ルールは `valid-token` と `valid-import` を足して 9 個になった。

| 見つかった穴 | 直したこと |
|---|---|
| `no-raw-color` のエラー文に従うと、Tailwind の任意値（`text-[var(--ur-color-text-muted)]`）になり、同じルールに引っかかる | エラー文に、そのまま書ける形を入れた。任意値の中のトークンなら、同じトークンと CSS プロパティを埋めた `style={{ color: "var(--ur-color-text-muted)" }}` と、自分の CSS の `color: var(--ur-color-text-muted)`。パレットの色（`text-gray-500`）なら、プロパティに合うトークンの候補（文字なら `--ur-color-text`・`text-muted`・`text-subtle`、赤なら `--ur-color-danger` を先頭に）。Urushi の部品の上なら、style ではなく variant（Badge は tone）を示す |
| `[...].join(" ")` で組んだ className を見ていない | `.join()`・`.filter()`・`.concat()` を呼んでいる配列と、テンプレートリテラルの `${…}` の中も、`cn()` の引数と同じように見る。`no-visual-override` も同じ |
| トークンの名前を確かめていない。SKILL.md にトークンの一覧がない | 新しいルール `valid-token`（error）。画面が読んでいる `var(--ur-…)`（Tailwind v4 の `bg-(--ur-…)` も）が、どのパックにもない名前なら指摘する（見る範囲は下の「`valid-token` が見る範囲」）。近い名前（shadcn の `primary` → `--ur-color-action`、`spacing` → `space` などの読み替えを含む）と、同じ種類のトークンの一覧を出す。トークンの一覧は `urushi build` が `packages/packs/*/tokens.json` から `packages/eslint-plugin/src/library.generated.json` に書き出す。SKILL.md の末尾に、90 個のトークンの名前と用途を載せた |
| `@urushi/react` にない名前の import を見ていない | 新しいルール `valid-import`（error）。`@urushi/react`（と `@urushi/react/runtime` などの入口）が export していない名前の import と、`<Tabs.Trigger>` のような存在しない部品を指摘する。export の一覧は `urushi build` が `packages/react` の入口のファイルから読む。候補は契約の部品と props から作る（`TabsTrigger` → `<Tabs.Tab>`、`DialogFooter` → `<Dialog.Actions>`、`DialogTitle` → `<Dialog title="…">`、`CardContent` → `<Card>` の子要素、`AccordionTrigger` → `<Accordion.Item title="…">`、`TextArea` → `Textarea`、`Stack`・`Heading` → HTML の要素） |

あわせて直したもの:

- `[…]` の中に `:` がある class（`text-[color:var(--x)]`、`[color:red]`）を、`md:` のような変種の区切りと取り違えて、任意値として見ていなかった。A の 04 が書いた `text-[color:var(--ur-color-text-muted)]` は、これで素通りしていた。
- SKILL.md のルール 3 に、許される書き方（自分の CSS か style）と、余白や大きさは Tailwind の段階（`p-4`）か `--ur-space-*` で書くことを書いた。ルール 8 に、`UrushiRuntime` は `@urushi/react/runtime` から import することを書いた（`@urushi/react` にはない）。

### 任意値の中の `var(--ur-…)` を禁止のままにした理由

`text-[var(--ur-color-text-muted)]` はトークンを使っているので、パックを切り替えても見た目は崩れない。それでも任意値として指摘し、style か自分の CSS に書かせることにした。

- Tailwind は `var()` の中身の種類を知らない。`text-` や `border-` のように 1 つの接頭辞が複数のプロパティを持つものでは、型の指定（`text-[length:var(--ur-font-size-small)]`）がないと、どのプロパティにするかを決められない（Tailwind の文書「Adding custom styles」の Resolving ambiguities）。正しく見えて効かないクラスになりうる。
- 設計ドラフトの 3 節では、Tailwind との連携は `@urushi/tailwind` が `@theme` にトークンを対応させる形にする予定になっている。いま任意値を許すと、それができたときに同じことの書き方が 2 つ残る。
- style と自分の CSS は、Tailwind がなくても動く。Urushi は Tailwind を前提にしない（同じく 3 節）。

そのかわり、エラー文には直した形をそのまま入れる。理由はルールのソース（`packages/eslint-plugin/src/index.ts` の `no-raw-color` の上）にも書いた。

### `valid-token` が見る範囲

読んでいるトークン（`var(--ur-…)` と Tailwind v4 の `bg-(--ur-…)`）だけを見る。`--ur-x: …` という定義や、`anchor-name: --ur-x` のアンカー名は、トークンを読んでいないので見ない。

- JSX の中の文字列（属性の値と、`<style>{`…`}</style>` などの式）はすべて見る。
- JSX の外では、1 つの CSS の値になっている文字列（`return "var(--ur-color-ok)"`、`{ color: "var(--ur-color-text)" }`）を見る。`{` や `;` を含むスタイルシートの文字列は見ない。そのファイルが自分で定義した変数を使うことがあるため。たとえば `scripts/design-system.tsx` は、デザインシステムの台紙のために `--ur-brand-*` を自分で定義して使っている。
- 最初は JSX の中だけを見ていたが、計測で、関数が返す `"var(--ur-color-success)"` を見逃したので広げた。

## 前の計測（9 ルール）

### 9 ルールでの各 3 回の計測の結果

2026-10-22 に claude -p（2.1.296 (Claude Code)） で計測。モデルは `claude-opus-5-5`（effort: high）、課題 10 個 × 各 3 回。渡した資料は llms.txt `03f8e0de8ac6`・SKILL.md `4d53060458fa`（sha256 の先頭）。出力したファイルは [`evals/runs/2026-10-22T06-38-23Z/`](../../evals/runs/2026-10-22T06-38-23Z/)。

| 条件 | 件数 | 1 回目で lint 0 件 | 1 回目で error 0 件 | 1 回直したあと lint 0 件 | 型エラー 0 件（1 回目 → 直したあと） | Urushi の部品の数（1 回目の平均） |
|---|---|---|---|---|---|---|
| A: llms.txt と SKILL.md を渡す | 30 | **30/30（100%）** | 30/30（100%） | **30/30（100%）** | 30/30（100%） → 30/30（100%） | 8.6 |
| B: 何も渡さない | 30 | **0/30（0%）** | 0/30（0%） | **16/30（53%）** | 1/30（3%） → 7/30（23%） | 4.5 |

条件 B の 1 回目で、SKILL.md にしか書いていない書き方（Trigger の `dialog=` などで id を指す、`var(--ur-…)`、`data-pack`、`UrushiRuntime`、Card の `headingLevel`、Badge の `tone`）が出たのは 0/30（0%）。

#### ルールごとの件数（9 ルール）

| ルール | A 1 回目 | A 直したあと | B 1 回目 | B 直したあと |
|---|---|---|---|---|
| `no-visual-override` | 0 | 0 | 38 | 2 |
| `no-raw-color` | 0 | 0 | 92 | 1 |
| `valid-idref` | 0 | 0 | 0 | 0 |
| `required-props` | 0 | 0 | 37 | 12 |
| `accessible-name` | 0 | 0 | 3 | 5 |
| `prefer-native` | 0 | 0 | 0 | 0 |
| `tabs-match` | 0 | 0 | 0 | 0 |
| `valid-token` | 0 | 0 | 0 | 8 |
| `valid-import` | 0 | 0 | 102 | 0 |
| 構文エラー（parse） | 0 | 0 | 0 | 0 |
| コードが返ってこない | 0 | 0 | 0 | 0 |

呼び出しは 90 回。入力 180 トークン（ほかにキャッシュの書き込み 176,742、読み込み 288,323）、出力 172,911 トークン（思考を含む）。Claude Code が示した費用の目安は合計 $4.93。

### 9 ルールでの各 3 回の計測で読み取れたこと

上の表から読み取れたこと。資料の SKILL.md（`4d53060458fa`）は、トークンの一覧を足し、ルール 3 と 8 を直したもの。比べる相手は、同じ課題を 7 ルールで測った各 3 回の計測（下の「前の計測（7 ルール）」）。

計測のあとで `valid-token` を JSX の外の CSS の値にも広げ、保存した出力を採点し直した。B の 10 の直したあとの 2 件が、関数で返す `"var(--ur-color-success)"` を見逃していたため。上の表は採点し直したあとの数字で、計測したときとの違いは、B の直したあとが 18/30 → 16/30 になったことだけ。直させる段の出力は作り直していない。

- **資料があれば、1 回目から崩れない**: 条件 A は 30 件すべてが lint 0 件・型エラー 0 件。前の計測で 3 回とも存在しない `--ur-color-surface-muted` を使った 08 は、今回は 3 回とも `--ur-color-surface` と `--ur-color-border` を使った。SKILL.md のトークンの一覧が効いている。30 件すべてがトークンを `var(--ur-…)` で使い、Tailwind の任意値に入れたものはない。合うバリアントのない指定（04 の角丸など）は、前と同じく書かずに利用者に尋ねた。
- **エラー文に直し方を書くと、そのとおりに直る**: B の `no-raw-color` は、直したあと 92 件 → 1 件になった（前の計測は 62 件 → 50 件）。`valid-import` は 102 件 → 0 件。モデルは `TabsTrigger` を `<Tabs.Tab>` に、`DialogFooter` を `<Dialog.Actions>` に、`text-[var(--ur-color-text-muted)]` を `style={{ color: "var(--ur-color-text-muted)" }}` に、エラー文のとおりに書き換えた。
- **資料なしで 1 回直したあと、lint 0 件は 16/30、型エラー 0 件は 7/30**: 前の計測（7 ルールのエラー文で直した出力）を 9 ルールで数えると、どちらも 1/30 だった。lint と型チェックの両方が 0 件になったものは、1 件から 5 件（02・08 の 3 回・10）に増えた。
- **直したあとに残った指摘は、直す段で入ったもの**: 指摘が残った 14 件の内訳は、`required-props` 12 件・`valid-token` 8 件・`accessible-name` 5 件・`no-visual-override` 2 件・`no-raw-color` 1 件。多くは、`MenuTrigger` を `<Menu.Trigger>` に、`TextField` を `<Field>` に正しく置き換えたものの、その部品に必要な props（`menu`、`id`）や、アイコンだけのボタンの `aria-label` を付けていないもの。`valid-token` は、06 で直すときに新しく書いた `--ur-color-primary`（6 件）と、10 の `--ur-color-success`（2 件）。直させるのは 1 回だけなので、直す段で入った誤りはモデルに戻らない。
- **lint を通っても、props の誤りは残る**: lint 0 件の 16 件のうち 11 件に型エラーが残った。中身はすべて、部品にない props（`onCheckedChange`・`onValueChange`・`open` と `onOpenChange`、Switch や Textarea の `label`、Accordion の `type` と `collapsible`、Tabs の `items`、Button の `radius` と `loading`）か、契約にない値（Toaster の `position="bottom-right"`）。lint は部品の名前までは見るようになったが、props は必須かどうかしか見ていない。
- **条件 B に資料は漏れていない**: 1 回目の出力で、SKILL.md にしかない書き方が出たのは 0/30。

### 9 ルールでの計測で見つかった穴

上の「lint の直し（2026-10-22、10 ルール）」で、3 つとも直した。

- **部品にない props と、契約にない値を見ていない**: 上の 11 件。値（`position="bottom-right"`）は契約の enum と比べればすぐ検出できる。props は、契約の props と、描画する要素の HTML 属性を合わせた一覧が要る。shadcn や Radix の名前（`onOpenChange` など）には、Urushi での書き方（`<Dialog.Trigger dialog="…">` で開く、など）を示したい。
- **`valid-import` の候補に、必須の props を添えていない**: `<Menu.Trigger>` だけを示すので、`menu="…"` を付け忘れる。候補を `<Menu.Trigger menu="…">` のように書けば、直す段で入る `required-props` を減らせる見込み。
- **`no-visual-override` のエラー文が、その部品の props を示さない**: 7 ルールの計測で見つかったもの（Card の `padding`、Badge の `tone`）で、まだ直していない。今回の B の直したあとでは 2 件だった。

## 前の計測（7 ルール）

### 7 ルールでの各 3 回の計測で読み取れたこと

課題 10 個 × 各 3 回、[`evals/runs/2026-10-22T06-18-03Z/`](../../evals/runs/2026-10-22T06-18-03Z/)。資料は llms.txt `03f8e0de8ac6`・SKILL.md `435c80e1d2f5`（トークンの一覧を足す前）。同じ日に各 1 回でも測っていて（[`evals/runs/2026-10-22T06-11-30Z/`](../../evals/runs/2026-10-22T06-11-30Z/)）、A は 10/10、B は 1 回目 2/10・直したあと 7/10 と、傾向は同じだった。

- **資料があれば、1 回目から崩れない**: 条件 A は 30 件すべてが lint 0 件・型エラー 0 件だった。見た目の指定も上書きで書いていない。赤は `variant="danger"`、増減の色は Badge の `tone` で表した。合うバリアントのない指定（04 の角丸、06 の紫の枠、10 の強い影）は書かず、理由をコメントに残し、パックを変えるか新しいバリアントを足すかを利用者に尋ねた。SKILL.md の「合うバリアントがなければ止めて尋ねる」のとおりの動きで、そのぶん依頼の一部は利用者の判断待ちになる。
- **資料がないと、lint のエラー文で直るのは半分**: 条件 B は 1 回目の通過が 3/30、1 回直したあとが 15/30。`required-props`（39 件）・`no-visual-override`（34 件）・`accessible-name`（3 件）は、エラー文だけで 0 件になった。
- **残ったのは `no-raw-color`（62 件 → 50 件）**: エラー文の「色はパックのトークン（var(--ur-color-…)）で指定してください」に従うと、モデルは `text-[var(--ur-color-text-muted)]` のような Tailwind の任意値を書き、同じルールの「任意の値」に引っかかる。エラー文が許される書き方（`style={{ color: "var(--ur-color-text-muted)" }}` など）を示していないため。直しきれなかった 15 件は、すべてこのルールが原因だった。
- **資料なしの「lint 通過」は中身が伴わない**: 条件 B は、1 回目に型エラーがなかったのが 3/30、直したあとは 1/30。存在しない部品や props を、shadcn や Radix の書き方で作る。多かったのは `Text`（21 件）・`Heading`（20 件）・`TextField`・`IconButton`（各 12 件）・`Radio`（10 件）、`DialogContent`・`MenuItem`・`PopoverTrigger` など。props では `onOpenChange`・`onCheckedChange`。lint は知らない名前を見ないので、lint の通過率は型チェックと合わせて読む必要がある。
- **直させると型エラーが増えることがある**: B の 10（ダッシュボード）は、1 回目は型エラーなしが 2 件あったが、直したあとはどれも型エラーになった。Card の `shadow-lg` などに対するエラー文が「パックのトークンかバリアントで表してください」とだけ言い、その部品にある props（Card なら `padding`、Badge なら `tone`）を示さないので、モデルが存在しない `variant` を足した。
- **条件 B に資料は漏れていない**: 1 回目の出力で、SKILL.md にしかない書き方の検査に当たったのは 2/30。どちらも 03（行メニュー）の「Badge の `tone`」で、中身を見ると漏れではない。値が `"info"`・`"success"` で（Urushi は `neutral`・`accent`・`ok`・`danger`）、同じファイルで `MenuItem tone="danger"`・`MenuContent`・`MenuTrigger` と shadcn 風の名前も使っている。`tone` という props 名を一般的な名前として推測しただけ。各 1 回の計測の 1 件目（01 設定画面）も目で確かめた。使っているのは `Heading`・`Stack`・`Text`・`TextArea`・`TextField` という Urushi にはない名前で、`Switch` には `label` を props で渡していた（Urushi は子要素がラベル）。直したあとの出力には `var(--ur-color-…)` が出てくるが、これは lint のエラー文に書いてあるもの。

### 7 ルールでの計測で見つかった穴

上の「lint と資料の直し（2026-10-22、9 ルール）」で、`no-visual-override` のエラー文の件を除いて直した。その件は「lint の直し（2026-10-22、10 ルール）」で直した。

- **`[...].join(" ")` で組んだ className を見ていない**: B の 06 は 3 回とも、プランの枠の className を配列の `join(" ")` で組んだ。その中のパレットの色（1 回目の `border-purple-600 bg-purple-50`）や任意値（直したあとの `border-[var(--ur-color-brand)]`）は検出されなかった。`cn()`・`clsx()` と配列そのものは見ている。
- **トークンの名前を確かめていない**: A の 08 は 3 回とも、存在しない `--ur-color-surface-muted` をツールバーの背景に使った。B は `--ur-color-brand`・`--ur-color-text-secondary`・`--ur-color-surface-subtle` など 11 種類の存在しない名前を使った。どれも lint は通る。SKILL.md にトークンの一覧がないことも原因。
- **エラー文が、許される書き方やその部品の props を示していない**: 上の `no-raw-color` と Card・Badge の例。直し方が 1 つに決まるように、例を添えるとよい。
- **`@urushi/react` にない名前の import を見ていない**: B の誤りの大半は、存在しない部品の import（`TabsTrigger` など）。型チェックでは分かるが、lint で「`Tabs.Tab` のことですか」と返せれば、エラー文だけで直せる範囲が広がる。

### 9 ルールで採点し直すと

保存した出力を、直したあとのルール（9 ルール）で採点し直した（`--rescore`、API は呼ばない）。直させる段の出力は作り直さないので、「直したあと」は 7 ルールのエラー文で直した出力を、9 ルールで数えたもの。

| 計測 | 条件 | 1 回目で lint 0 件（7 ルール → 9 ルール） | 1 回直したあと lint 0 件（7 ルール → 9 ルール） | 型エラー 0 件（直したあと） |
|---|---|---|---|---|
| 各 1 回（`2026-10-22T06-11-30Z`） | A | 10/10 → 8/10 | 10/10 → 8/10 | 10/10 |
| | B | 2/10 → 0/10 | 7/10 → 0/10 | 0/10 |
| 各 3 回（`2026-10-22T06-18-03Z`） | A | 30/30 → 27/30 | 30/30 → 27/30 | 30/30 |
| | B | 3/30 → 0/30 | 15/30 → 1/30 | 1/30 |

- A で新しく指摘されたのは、08 の `--ur-color-surface-muted`（各 1 回で 1 件、各 3 回で 3 回とも。`valid-token`）と、各 1 回の 04 の `text-[color:var(--ur-color-text-muted)]`（`[…]` の中の `:` を取り違えていた分。`no-raw-color`）。
- B は、各 3 回の 30 件すべてで「直したあとに lint 0 件」と「直したあとに型エラー 0 件」が一致した。7 ルールでは、lint だけ通って型エラーが残るものが 14 件あった。`valid-import` が、型チェックで分かる誤り（存在しない部品の import）を、直し方つきで指摘するようになったため。
- 各 1 回の計測の `summary.json` は、この採点し直しで書き換わっている（指示どおり `--rescore` をその場で実行した）。各 3 回の計測は、写しを採点し直したので、`summary.json` は計測したときのまま。

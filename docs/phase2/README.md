# Phase 2（拡張）

設計ドラフト（`docs/design/00-design-draft.md` の 13 章）で Phase 2 のゴールにしたのは、Menu の完成版（サブメニュー）、Combobox、DateField、MCP の 4 つ。2026-11-04 に始めた。

## 状況

| 項目 | 状況 |
|---|---|
| Combobox | 済み。0.1.0-beta.1 の候補に入っている（非同期検索、古い応答の除外、エラーからの再試行）。 |
| DateField | DatePicker で代える。日付を直接入力でき、カレンダーからも選べる。ネイティブの入力欄だけでよい場面には DateInput がある。分かれた入力欄（年・月・日を別々に打つ形）は作らない。 |
| MCP | 済み（2026-11-04）。下に詳細。 |
| Menu のサブメニュー | 済み（2026-11-04）。`Menu.Sub`。下に詳細。 |

## MCP サーバー

`urushi mcp` で起動する。CLI のコマンドを MCP のツールとして、標準入出力（改行区切りの JSON-RPC 2.0）で渡す。依存は増やしていない（`packages/cli/src/mcp.ts`）。

| ツール | すること | 書き込み |
|---|---|---|
| `list_components` | 全コンポーネントの名前・概要・使う場面・パーツ | なし |
| `describe_component` | 1 つの契約 | なし |
| `get_authoring_context` | 契約とデザインの規約・トークン（`urushi context`） | なし |
| `check_project` | 型と契約の lint（`urushi check`） | なし |
| `project_info` | `urushi.json` と導入済みの版（`urushi info`） | なし |
| `add_components` | コピーして lock に記録（`urushi add`）。手で変えたファイルは上書きしない | あり |
| `update_components` | 3-way merge（`urushi update`）。既定はプレビューだけ | `dryRun: false` のときだけ |
| `list_local_changes` | 手で変えたファイルと衝突（`urushi diff`） | なし |

- 起動したフォルダーのプロジェクトだけを扱う。`check_project` の `project` には、親をさかのぼるパスや絶対パスを渡せない。
- プロトコルの版は 2025-11-25・2025-06-18・2025-03-26・2024-11-05 に対応し、クライアントが求めた版を返す（知らない版には最新を返す）。
- ツールの失敗（知らないコンポーネントなど）は `isError` の結果で返し、モデルが読んで直せるようにする。知らないメソッドや引数の誤りは JSON-RPC のエラーで返す。
- 標準出力にはプロトコルのメッセージだけを書く。ほかの出力は標準エラーへ回す。
- 検証：`packages/cli/test/mcp.test.ts`（実際にプロセスを起動して話す 3 件）、配布物の確認（`pnpm test:release`）で、npm に入れる形の CLI が MCP サーバーとして答えること。Claude Code に `--mcp-config` で登録し、8 つのツールが見え、`describe_component` を呼んで正しく答えることを確かめた。
- まだしていないこと：ブラウザでの操作の再検証（`urushi verify` と `workflow`）はツールにしていない。Playwright のブラウザが要り、時間もかかるため。要るなら次に足す。

## Menu のサブメニュー（`Menu.Sub`）

3 つの形（横に出す・その場で開く・入れ替える）を比較ページ `/proposals/submenu.html`（`tsx scripts/proposal-submenu.tsx`）で比べ、「広い画面では横に出し、狭い画面ではその場で開く」に決めた（ユーザーの選択、2026-11-04）。NavigationMenu の入れ子と同じ方針。

```tsx
<Menu id="task-actions" label="タスクの操作">
  <Menu.Item>編集する</Menu.Item>
  <Menu.Sub label="担当者を変える">
    <Menu.Item>佐藤 美咲</Menu.Item>
    <Menu.Item>鈴木 健太</Menu.Item>
  </Menu.Sub>
</Menu>
```

- 作り：`Menu.Sub` は `role="none"` の入れ物に、項目（`role="menuitem"`、`aria-haspopup="menu"`、`popovertarget`）と、子のメニュー（`popover="auto"`、`role="menu"`、`label` が名前）を並べる。子は親のポップオーバーの中にあるので、開いても親は閉じない。id は `useId` で作るので、利用者が付ける必要はない。
- 横に出す：項目を起点にアンカー配置で置き、最初の行を項目の高さにそろえる。下に場所がなければ上へ伸び、横に場所がなければ反対側へ回る（`position-try-fallbacks: flip-block, flip-inline`）。JavaScript なしでも、クリックで横に開く。
- その場で開く：641px より狭い画面では、ランタイムが `data-inline-open` を付けて、項目の下に字下げして開く（`aria-expanded` も付ける）。親のメニューが閉じると、次に開いたときは閉じた状態から始まる。
- キーボード：→（右から左の文字では ←）・Enter・Space で開いて最初の項目へ、← と Esc でサブメニューだけを閉じて項目に戻る。↓ ↑ はそのメニューの中だけを回る。Tab で全部閉じる。子の項目を選ぶと全部閉じ、フォーカスはトリガーに戻る。
- マウス（広い画面で細かいポインタのとき）：項目に 160ms 乗せると開く。斜めにサブメニューへ向かう間は、途中の行を横切っても閉じたり別のサブメニューを開いたりしない（NavigationMenu と同じ三角形の判定）。ほかの項目に止まると閉じる。
- 入れ子は 1 段まで（契約の a11y の決まりに書いた）。
- テスト：`tests/e2e/menu-sub.spec.ts`（3 エンジン、広い画面と狭い画面、キーボード・マウスの斜め移動・クリック。3 回繰り返して安定）、JavaScript なしの静的ページ、サブメニューを開いた状態の axe（2 パック × 2 テーマ）、見た目の回帰テスト（サブメニューを開いた状態 4 枚）。

## 途中で分かったこと

- デザインシステムの生成（`pnpm ds`）が、別の作業で足された Combobox・Command・DataTable・DatePicker・NavigationMenu のプレビューがないために失敗していた。5 つのプレビューを足し、52 部品すべてを出せるようにした。Combobox は読み込みが済むまで入力欄を無効にしているので、JavaScript を動かさないプレビューでは無効の印を外して見せている。
- 見た目の回帰テストの基準画像が 10/22 のままで、その後の見た目の変更（パックのトークンと CSS で約 2,800 行）が反映されていなかった（`pnpm test:visual` は `verify` にも CI にも入っていない）。今の見た目で撮り直した（221 枚）。

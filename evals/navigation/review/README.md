# 最終レビュー（2026-10-28 JST）

Navigation Menuの比較記録は1日前の実験を含む。ここではデザインとサイトの最終確認を記録する。

- サイトE2E：Chromium・Firefox・WebKit、69件成功、失敗・スキップ・flaky 0。`site-results.json`。
- トップページの旧比較値を今回の集計へ置き換えた後、関連18件も成功。`home-results.json`。型検査を含むサイトビルド、サイトESLint、Urushiのstrict診断（77ファイル、エラー・警告0）も成功。
- 47部品の見本：Graphite/Lucent、明暗、320/1000pxの376条件でaxeと横はみ出しの検査が成功。`../runs/design-v1/results.json`と同フォルダーの画像。
- CLIの関連単体10件成功。数値リテラルunionの型生成は、無効なcolumnsを拒否する型テストを含めて確認。
- 実モデル応答27件と不具合注入8件、596ファイルのハッシュ照合が成功。AI出力への手修正なし。

ブラウザーを実際に操作して、見本のチェックによる進捗変更、タスク追加、Dialogのフォーカス復帰、Navigation Menuの2列パネルを確認した。GraphiteのライトとLucentのダークを目視した。320pxは自動検査と保存画像で確認したもので、実スマートフォンで操作した結果ではない。全376画像を1枚ずつ人の目で確認したわけではない。

手動で見た画面：[見本](showcase-desktop.png)、[Navigation Menu](navigation-menu-desktop.png)。自動検査からの保存画像：[320px](showcase-graphite-light-320.png)、[Lucentダーク](showcase-lucent-dark-1280.png)。

実機スクリーンリーダー、全ての動きと全ての部品の操作は今回の確認範囲に含まない。ホバー追従や横へ飛び出すサブメニューは未実装。成功率は1モデル・各2試行であり、Base UIとRadixも同点だった。

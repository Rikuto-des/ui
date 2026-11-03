# 一覧プレビューとコンポーネントのデザイン

2026年10月28日。ローカルの実装・実画面・検証記録。

## 変更

- 全48種類を公開Reactコンポーネントで描画。検索と分類、カード下部からの詳細ページへの移動を残し、プレビュー内では入力・選択・開閉を試せる。BadgeやSkeletonなど、表示専用のコンポーネントも実物を表示する。
- 検索で隠したプレビューを破棄せず、入力や選択を保持する。アプリ側の状態が必要なボタン、Slider、Progress、Pagination、Emptyだけ小さなクライアント実装を追加した。
- Dialogは必須入力を検証してから閉じる。Popover、Sheet、Navigation Menuのパネルはカードの枠に切られない。プレビューの見出しIDとDialogなどの見出しIDの衝突を修正した。
- 両パックのコントロール文字を14pxに調整し、入力欄の境界線、角丸、控えめな影を統一。Cardの標準余白を24px、見出しを16pxにし、Accordionの縦余白、Badgeの高さ・輪郭、Popoverの見出しも整えた。ButtonとCardの背景ぼかしを除き、輪郭と内容が明確に見えるようにした。
- サイトの表用CSSが公開Tableのスタイルを上書きしないように限定した。プレビュー用に操作対象を縮小する処理は入れていない。
- 日本語のラベルと説明をyomiyasuの方針に沿って目視で推敲した。数値・ライセンス・比較条件は保持した。

参考：[shadcn/ui](https://ui.shadcn.com/)。既存の検索・左ナビに、見た目と操作を確認できるプレビューを組み合わせた。

## 検証

- In-app browserで保存ボタン、入力、Tabs、Select、Dialogを操作。Dialogの未入力エラー、入力後の送信、トリガーへのフォーカス復帰を確認した。
- Navigation Menuの親子をクリックで開閉。デスクトップでは横開きが枠外まで表示され、320pxでは縦に展開することを目視した。GraphiteのライトとLucentのダークで、一覧・フォーム・Table・Badgeの表示を確認した。
- Chromium・Firefox・WebKitのサイトテストは126件すべて合格。ラベルの最終調整後、影響する一覧・デザインの21件もすべて合格。48件の実プレビュー、ID重複なし、入力保持、フォーム検証、オーバーレイ、通知、値の変化を検証した。
- 全48プレビューについて両パック・明暗・320px／1440pxの横はみ出しを検査。カタログのaxe検査は両パック・明暗・3ブラウザで違反0件。色の遷移中を測らないよう、表示中の有限アニメーションの終了を待っている。
- TypeScript、サイトESLint、strict診断81ファイル（エラー0・警告0）、生成CSSとトークンなどの単体13件、本番ビルドが通過。
- 実機スクリーンリーダーと実端末での操作は未検証。自動検査は、全48種類のあらゆる操作状態や読み上げを保証するものではない。

[サイト126件](site-tests.json) / [最終21件](final-targeted-tests.json) / [strict診断](contract-check.json) / [単体13件](unit-checks.txt) / [ビルド](build.txt)

## CSS変更後の比較

保存済みAI出力8件と共通CSSを変えず、4ライブラリを再ビルド。共通32テストは全合格。新しいAI呼び出しは0件。計測対象は既存のNavigation Menu比較アプリであり、48種類を並べたドキュメントサイトのサイズではない。

| ライブラリ | JS＋CSS、React・共通CSS込みのgzip |
| --- | --- |
| Urushi | 86.1 KiB |
| Base UI | 115.2–115.4 KiB |
| Radix UI | 90.8–91.0 KiB |
| shadcn/ui | 104.2–104.3 KiB |

[固定した計測](../../navigation/runs/catalog-v1/summary.json) / [270ファイルのハッシュ](../../navigation/runs/catalog-v1/evidence-manifest.json) / [一致確認](size-evidence-check.json)。過去の測定は上書きしていない。各2件・1シナリオの結果であり、一般的なAI成功率や性能の優位性を示すものではない。

## 実画面

以下はIn-app browserで操作・確認した画面。デスクトップ画像は表示領域の切り出し。

![Graphiteの一覧](catalog-graphite-light.png)
![Lucentの一覧](catalog-lucent-dark.png)
![Dialog](dialog-light.png)
![Navigation Menuの横開き](navigation-desktop-dark.png)
![320pxのNavigation Menu](navigation-mobile-dark.png)

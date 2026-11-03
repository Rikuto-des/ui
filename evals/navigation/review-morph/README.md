# Navigation Menuの連続変形とサイトの再設計

2026年10月28日。ローカル実装と検証の記録。公開・配布は行っていない。

## 実装

- 同じ階層のパネルで背景を共有し、位置・幅・高さを240msで連続的に変える。途中で別の項目に移っても、その瞬間の形からつなぐ。文字を拡大縮小せず、内容をフェードとクリップで表示する。
- 装飾の背景は`inert`・`aria-hidden`。リンクを複製・移動せず、ネイティブのDOM順序とフォーカスを維持する。閉じる、アンマウント、画面幅の変更で背景とアニメーションを片付ける。
- 開いている上位メニューを左右キーで切り替えられる。動きを減らす設定への変更は実行中の動きにも反映する。ホバー中の斜め移動の猶予と、切り替えの再試行も調整した。
- サイトの用語をComponents／コンポーネントに統一。大きなセリフ書体や装飾的なセクション番号を取り除き、コンパクトなヘッダー、検索と分類、左ナビ、Preview / Code、右のページ内目次に整理した。トップには実際に操作できるアプリ例を置いた。
- 文言と数値・比較条件を目視で点検。過去の測定記録は当時の表現も含めて保持した。

サイトの参考：[shadcn公式サイト](https://ui.shadcn.com/)、[Navigation Menu](https://ui.shadcn.com/docs/components/base/navigation-menu)。動作仕様の参考：[Base UI](https://base-ui.com/react/components/navigation-menu)、[Radix](https://www.radix-ui.com/primitives/docs/components/navigation-menu)。

## 操作と検証

- In-app browserで検索からコンポーネントページへ移動、Preview / Codeのクリック・矢印キー、親子メニューのクリック・矢印キー、ライト／ダークを操作。幅1280pxと320pxを目視確認し、狭幅の入れ子が縦に展開することを確認した。
- サイトの111項目をChromium・Firefox・WebKitで検証。最初の実行は110合格・1失敗。失敗はFirefoxが非表示のdetails内のCSS transitionを進めないため動画用テストが待ち続けたもの。描画中の要素のみを待つよう検査を修正し、対象3項目を再実行して3合格。連続変形の中間形、途中の切り替え、キーボード、reduced motion、48コンポーネントのPreview / Code、明暗、320px、axeを確認した。
- TypeScript、サイトESLint、本番ビルドが通過。Urushiのstrict診断は79ファイル、エラー0・警告0。関連するCLI・CSSの単体9件が通過。最終HTML全体に旧称が残っていないことも検査した。
- ホバー軌跡・連続変形はPlaywrightの実ブラウザー操作で検証・録画した。動画は[Navigation Menuの動作](navigation-motion.mp4)。物理マウスの手操作の録画ではない。
- [初回111項目のログ](urushi-morph-site-final.json)、[修正後の対象3項目](urushi-morph-recording-final.json)、[strict診断](contract-check.json)、[単体検査](unit-checks.txt)、[ビルド](build.txt)。

## 同じ保存済みコードで再計測

[固定した結果](../runs/morph-v1/summary.json)・[証拠のハッシュ](../runs/morph-v1/evidence-manifest.json)。4ライブラリ各2件、8画面・共通32テストが通過した。AI生成済みのApp.tsxと共通CSSは変更していない。新しいAI呼び出しは0件。

| ライブラリ | JS＋CSS、Reactと共通CSS込みのgzip |
| --- | --- |
| Urushi | 86.1 KiB |
| Base UI | 115.2–115.4 KiB |
| Radix UI | 90.8–91.0 KiB |
| shadcn/ui | 104.2–104.3 KiB |

この条件ではUrushiの合計は約5–25%小さい。Reactを外部化したJS単独では約52–83%小さい。連続変形を追加する前より約0.7 KiB増えた。任意ランタイム全体、使用コンポーネントのCSS、Graphiteの全トークンを含む。HTML、フォント、画像、起動時間は含まない。

270の固定証拠のハッシュ、現行core・Reactソース・生成CSS・Graphiteとの一致を確認。過去のAI実験も応答27件・不具合8件・596ハッシュの監査が通過した。

比較アプリは入れ子のフライアウトを含まない。追加機能の操作確認は別のサイトテストによる。モデル1種類・各2試行という以前の条件から、一般的なAI成功率の優位性は判断できない。実機スクリーンリーダーと端末上のフレーム時間は未検証。

## 確認画像

![Components一覧](components-desktop.png)
![Navigation Menu](navigation-light.png)
![トップ](home-desktop.png)
![320px](navigation-mobile.png)

# Urushi 0.1.0-beta.1

Urushiの最初のβ候補です。Reactの52コンポーネント、Graphite・Lucentの2つのパック、実装を検査・更新するCLIを収録しています。β期間中はAPIや見た目を変更する場合があります。

Navigation Menuのホバー追従とパネル変形、非同期検索に対応したCombobox、Urushiのコンポーネントで作ったStudioのサンプルアプリを試せます。Lucentでは色だけでなく、角丸・余白・文字・動作時間も変わります。アイコンにはPhosphorを使っています。

公開前の検証で見つかった、デモの最初の入力が読み込み中に失われる問題を修正しました。Comboboxのプレビューでは、登場アニメーション中も文字の濃さを保つようにしました。

Studioでは、入力エラー後のフォーカス移動が遅れて担当者欄への入力を妨げる問題も修正しました。

## 導入する

Node.js 24以降とReact 19を使ってください。配布用の7つのtgzを同じフォルダに置き、パスを置き換えて導入します。

```sh
npm install /absolute/path/to/release/*.tgz react@19 react-dom@19
npx urushi init --pack graphite
npx urushi add button dialog combobox
```

CSSの読み込みと使い方は、配布物のREADMEを参照してください。CLIにはregistryを同梱しています。

## 対応範囲

検証の対象は現在のChromium・Firefox・WebKitです。WebKitの自動検証はiPhone Safari実機の検証ではありません。iPhone・Android実機とVoiceOver・NVDA・TalkBackは未検証で、最低対応ブラウザのバージョンもまだ保証していません。まず試作や検証用のプロジェクトで、バージョンを固定して試してください。

不具合を報告するときは、Urushiのバージョン、ブラウザ・OS、再現手順、期待した動作を添えてください。認証情報や実データは含めないでください。ソースのリポジトリが非公開の間は、GitHub Issuesへのアクセス権が必要です。

このファイルは公開前の原稿です。npm公開と本番サイトの公開はまだ行っていません。

## 配布候補と検証結果

ソースは`ab60022b174f45cce3723bbed04d055543af554a`です。[CI](https://github.com/Rikuto-des/ui/actions/runs/41032607879)の7ジョブが成功しました。単体テスト291件、サイトの操作検証は3ブラウザで各190件が通っています。配布物からの新規導入・更新は14項目を確認しました。コンポーネント検証ではChromiumが174件、Firefoxが173件、WebKitが172件通りました。ブラウザ固有の検証など計12件はスキップしており、合格には含めていません。

`urushi-0.1.0-beta.1-ab60022.zip`には7つのパッケージと導入資料を収録しています。各tgzのSHA-256は`manifest.json`で確認できます。`urushi-site-ab60022.zip`はサイトの静的ファイルです。本番URLでの公開確認はまだ行っていません。

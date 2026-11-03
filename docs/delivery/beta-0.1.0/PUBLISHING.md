# 0.1.0-beta.1を公開する手順

2026年10月30日時点では、npmへの公開を行っていません。npmの認証確認は401で失敗し、`@urushi`スコープへの公開権限も未確認です。GitHubの`Rikuto-des/ui`は非公開です。

## 公開前に必要な操作

利用者本人がターミナルで`npm login --registry=https://registry.npmjs.org/`を実行してください。パスワードやトークンをチャットに貼る必要はありません。ログイン後にアカウントと`@urushi`の権限を確認します。公開先のスコープを変える場合は、名前を変更して配布検証をやり直します。

GitHubを公開する場合は、既存の履歴と比較資料も公開対象になります。公開する範囲を決めてから変更します。非公開を続ける場合は、パッケージに記載した不具合報告先を、利用者がアクセスできる窓口に変更してから公開します。

## 検証した配布物を使う

最終コミットは`ab60022b174f45cce3723bbed04d055543af554a`です。CIは[Quality and distribution](https://github.com/Rikuto-des/ui/actions/runs/41032607879)で確認します。7ジョブが成功した実行から取得したtgzと`manifest.json`を使い、manifestの`sourceCommit`と各tgzのSHA-256を照合します。作業フォルダで作り直したファイルに置き換えないでください。

7パッケージを`contract`、`tokens`、`core`、`packs`、`react`、`eslint-plugin`、`cli`の順に公開します。各ファイルに対して、次の形式で実行します。

```sh
npm publish ./urushi-contract-0.1.0-beta.1.tgz --tag beta --access public --ignore-scripts --registry=https://registry.npmjs.org/
```

このコマンドは公開操作です。現在はまだ実行していません。途中で失敗した場合は、公開済みの名前・バージョン・integrityを照合してから未公開分を続けます。

## 公開後の確認

全7パッケージの`beta`タグ、バージョン、配布integrityを確認します。その後、空のプロジェクトでnpmから導入し、`init`、`add`、型検査、ビルド、ブラウザ操作を再確認します。tgzからの導入成功だけでは、npm公開の成功とは扱いません。

GitHub Releaseとサイトには、導入コマンド、変更履歴、対応範囲、不具合報告先を載せます。「npm公開前」という案内は、公開と新規導入の確認が終わってから更新します。実機とスクリーンリーダーは、実際の検証が終わるまで未検証と記載します。

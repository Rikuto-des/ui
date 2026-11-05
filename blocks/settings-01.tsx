// Installed by `urushi add settings-01`. An account settings screen: rows of Item, notification switches, and a guarded delete.
import { AlertDialog, Avatar, Button, Item, Switch } from "@urushi/react";
import "./settings-01.css";

export default function Settings01() {
  return (
    <main className="b-settings">
      <header className="b-settings-head">
        <h1>設定</h1>
        <p>アカウントと通知の設定です。変更はすぐに保存されます。</p>
      </header>
      <section aria-labelledby="settings-account">
        <h2 id="settings-account">アカウント</h2>
        <Item.Group>
          <Item icon={<Avatar name="山田 花子" size="sm" />} title="山田 花子" description="表示名と写真" action={<Button size="sm">編集</Button>} />
          <Item title="メールアドレス" description="hanako@example.jp" action={<Button size="sm">変更</Button>} />
          <Item title="パスワードと二段階認証" description="最後の変更は 3 か月前" href="/settings/security" />
        </Item.Group>
      </section>
      <section aria-labelledby="settings-notify">
        <h2 id="settings-notify">通知</h2>
        <Item.Group>
          <Item title="コメント" description="自分のタスクにコメントが付いたとき" action={<Switch aria-label="コメント" defaultChecked />} />
          <Item title="締め切りの前日" description="担当のタスクの締め切りが近いとき" action={<Switch aria-label="締め切りの前日" defaultChecked />} />
          <Item title="週のまとめ" description="月曜の朝に、先週の動きをまとめて送ります" action={<Switch aria-label="週のまとめ" />} />
        </Item.Group>
      </section>
      <section aria-labelledby="settings-danger">
        <h2 id="settings-danger">アカウントの削除</h2>
        <Item.Group>
          <Item
            title="アカウントを削除する"
            description="すべてのプロジェクトとファイルが消え、元に戻せません。"
            action={
              <AlertDialog.Trigger alertDialog="settings-delete" variant="danger" size="sm">
                削除
              </AlertDialog.Trigger>
            }
          />
        </Item.Group>
        <AlertDialog id="settings-delete" title="アカウントを削除しますか？" description="すべてのプロジェクトとファイルが消え、元に戻せません。">
          <AlertDialog.Cancel alertDialog="settings-delete">やめる</AlertDialog.Cancel>
          <AlertDialog.Action alertDialog="settings-delete" variant="danger">
            削除する
          </AlertDialog.Action>
        </AlertDialog>
      </section>
    </main>
  );
}

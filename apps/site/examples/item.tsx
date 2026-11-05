"use client";
import { useState } from "react";
import { Badge, Button, Item, Switch } from "@urushi/react";
import { BellIcon, GearSixIcon, UsersIcon } from "@urushi/react/icons";
export default function ItemExample() {
  const [email, setEmail] = useState("hanako@example.jp");
  const [digest, setDigest] = useState(true);
  return (
    <div className="interaction-study">
      <header>
        <h3>アカウントの設定</h3>
      </header>
      <Item.Group label="アカウントの設定">
        <Item
          icon={<UsersIcon />}
          title="メールアドレス"
          description={email}
          action={
            <Button size="sm" variant="secondary" onClick={() => setEmail(email === "hanako@example.jp" ? "h.yamada@example.jp" : "hanako@example.jp")}>
              変更
            </Button>
          }
        />
        <Item
          icon={<BellIcon />}
          title="週のまとめメール"
          description="月曜の朝に、先週の動きをまとめて送ります"
          action={<Switch aria-label="週のまとめメール" checked={digest} onChange={(e) => setDigest(e.currentTarget.checked)} />}
        />
        <Item icon={<GearSixIcon />} title="パスワードと二段階認証" description="最後の変更は 3 か月前" href="#security" />
      </Item.Group>
      <p className="study-caption" role="status">
        {email} に、週のまとめを{digest ? "送ります" : "送りません"}。
      </p>
      <Item.Group label="メンバー" variant="plain">
        <Item title="佐藤 美咲" description="管理者" action={<Badge>オーナー</Badge>} />
        <Item title="鈴木 健太" description="編集者" action={<Button size="sm" variant="ghost">外す</Button>} />
      </Item.Group>
    </div>
  );
}

// A React Server Component: no "use client", no state, no event handlers.
// Every dialog and popover below opens through the browser itself.
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { Popover } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";

export default function Page() {
  return (
    <main className="page">
      <h1>秋のキャンペーン</h1>
      <p className="muted">このページは Server Components だけで描画され、部品のための JavaScript を送っていません。</p>
      <div className="row">
        <Popover.Trigger popover="filters" data-testid="open-filters">
          フィルタ
        </Popover.Trigger>
        <Dialog.Trigger dialog="confirm-delete" variant="danger" data-testid="open-confirm">
          プロジェクトを削除
        </Dialog.Trigger>
        <Button variant="primary">保存</Button>
        <Menu.Trigger menu="more" variant="ghost" data-testid="open-menu">
          その他
        </Menu.Trigger>
        <Tooltip.Trigger tooltip="share-tip" variant="ghost" data-testid="share">
          共有
        </Tooltip.Trigger>
      </div>

      <Menu id="more" label="プロジェクトの操作" data-testid="menu">
        <Menu.Item>複製する</Menu.Item>
        <Menu.Item>書き出す</Menu.Item>
        <Menu.Separator />
        <Menu.Item variant="danger">アーカイブ</Menu.Item>
      </Menu>
      <Tooltip id="share-tip">リンクを知っている人が閲覧できます</Tooltip>

      <Card title="申し込みフォーム" description="Field・Input・Checkbox・Switch もサーバーで描画しています。" headingLevel="h2">
        <form className="form">
          <Field id="email" label="メールアドレス" description="受付完了のお知らせを送ります。" required>
            <Input type="email" name="email" data-testid="email" />
          </Field>
          <Checkbox id="agree" name="agree" data-testid="agree">
            利用規約に同意する
          </Checkbox>
          <Switch id="notify" name="notify" defaultChecked description="締め切りの前日にお知らせします。">
            リマインダー
          </Switch>
        </form>
      </Card>

      <Tabs id="views" label="表示" defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">リスト</Tabs.Tab>
          <Tabs.Tab value="board">ボード</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="list">
          <p className="muted">
            タスク 5 件 <Badge tone="danger" dot>1 件が期限切れ</Badge>
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="board">
          <p className="muted">未着手・対応中・完了の 3 列で表示します。</p>
        </Tabs.Panel>
      </Tabs>

      <Accordion name="faq" data-testid="faq">
        <Accordion.Item title="JavaScript を切っても動きますか？" defaultOpen>
          動きます。開閉はブラウザの details 要素がしています。
        </Accordion.Item>
        <Accordion.Item title="部品のコードはブラウザに送られますか？">
          送られません。このページの部品はすべて Server Components です。
        </Accordion.Item>
      </Accordion>

      <Popover id="filters" title="状態で絞り込む" data-testid="filters">
        <label className="check">
          <input type="checkbox" defaultChecked /> 未着手
        </label>
        <label className="check">
          <input type="checkbox" /> 完了
        </label>
      </Popover>

      <Dialog
        id="confirm-delete"
        title="「秋のキャンペーン」を削除しますか？"
        description="タスク 5 件とコメントがすべて消えます。この操作は取り消せません。"
        size="sm"
      >
        <Dialog.Actions>
          <Dialog.Close dialog="confirm-delete" variant="ghost" autoFocus data-testid="cancel-delete">
            キャンセル
          </Dialog.Close>
          <Dialog.Close dialog="confirm-delete" variant="danger">
            削除する
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </main>
  );
}

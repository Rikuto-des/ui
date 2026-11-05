// Installed by `urushi add dashboard-01`. An application dashboard: a sidebar, three figures, and the latest orders.
import { Badge, Button, Card, Meter, Progress, Sidebar, Table } from "@urushi/react";
import { GearSixIcon, HouseIcon, ListChecksIcon, PlusIcon, UsersIcon } from "@urushi/react/icons";
import "./dashboard-01.css";

const orders = [
  { id: "1042", customer: "株式会社みどり", total: "¥48,000", status: "支払い済み", tone: "ok" },
  { id: "1041", customer: "青木 誠", total: "¥12,800", status: "発送待ち", tone: "accent" },
  { id: "1040", customer: "合同会社ひかり", total: "¥96,500", status: "支払い済み", tone: "ok" },
  { id: "1039", customer: "佐々木 真央", total: "¥7,200", status: "返金", tone: "danger" },
] as const;

export default function Dashboard01() {
  return (
    <div className="b-dash">
      <Sidebar label="メイン">
        <Sidebar.Group title="ストア">
          <Sidebar.Item href="/" icon={<HouseIcon />} current>
            ホーム
          </Sidebar.Item>
          <Sidebar.Item href="/orders" icon={<ListChecksIcon />}>
            注文
          </Sidebar.Item>
          <Sidebar.Item href="/customers" icon={<UsersIcon />}>
            顧客
          </Sidebar.Item>
          <Sidebar.Item href="/settings" icon={<GearSixIcon />}>
            設定
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>
      <main className="b-dash-main">
        <header className="b-dash-head">
          <div>
            <h1>ホーム</h1>
            <p>11 月 5 日（水）時点の数字です。</p>
          </div>
          <Button variant="primary">
            <PlusIcon size={16} />
            商品を追加
          </Button>
        </header>
        <div className="b-dash-figures">
          <Card title="今月の売上" headingLevel="h2">
            <p className="b-dash-figure">¥1,284,000</p>
            <Progress label="月の目標" value={64} valueText="目標の 64%" showValue />
          </Card>
          <Card title="注文" headingLevel="h2">
            <p className="b-dash-figure">312 件</p>
            <p className="b-dash-note">先月の同じ日より 18 件多い</p>
          </Card>
          <Card title="在庫" headingLevel="h2">
            <p className="b-dash-figure">残り 42 点</p>
            <Meter label="倉庫の空き" value={18} max={100} low={20} high={60} optimum={100} valueText="残り 18%" />
          </Card>
        </div>
        <Card title="最近の注文" headingLevel="h2">
          <Table caption="最近の注文" hideCaption>
            <thead>
              <tr>
                <th scope="col">番号</th>
                <th scope="col">お客さま</th>
                <th scope="col">金額</th>
                <th scope="col">状態</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <th scope="row">{order.customer}</th>
                  <td>{order.total}</td>
                  <td>
                    <Badge tone={order.tone}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </main>
    </div>
  );
}

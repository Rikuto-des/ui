"use client";
// Installed by `urushi add mail-01`. A mail client: the list beside the message, split by a Resizable handle.
import { useState } from "react";
import { Badge, Button, ButtonGroup, Resizable } from "@urushi/react";
import { ArchiveIcon, ArrowBendDownLeftIcon, ShareNetworkIcon } from "@urushi/react/icons";
import "./mail-01.css";

const mails = [
  { id: 1, from: "佐藤 美咲", subject: "告知メールの文面", time: "10:42", unread: true, body: "最終版を共有します。件名だけもう一度確認させてください。差し替える場合は今日の 17 時までにお願いします。" },
  { id: 2, from: "鈴木 健太", subject: "画像の差し替え", time: "9:15", unread: true, body: "申し込みページの画像を 3 点差し替えました。スマホでの見え方を確かめてもらえますか。" },
  { id: 3, from: "高橋 陽子", subject: "来週の打ち合わせ", time: "昨日", unread: false, body: "火曜の 13:30 からでいかがでしょうか。会議室は 3 階を押さえています。" },
  { id: 4, from: "経理チーム", subject: "10 月分の請求書", time: "月曜", unread: false, body: "10 月分の請求書を添付します。支払い期限は 11 月 30 日です。" },
];

export default function Mail01() {
  const [current, setCurrent] = useState(mails[0].id);
  const mail = mails.find((m) => m.id === current) ?? mails[0];
  return (
    <main className="b-mail">
      <Resizable defaultSize={34} min={24} max={55}>
        <Resizable.Panel>
          <h1 className="b-mail-title">受信トレイ</h1>
          <ul className="b-mail-list" aria-label="受信したメール">
            {mails.map((m) => (
              <li key={m.id}>
                <button type="button" aria-current={m.id === current} onClick={() => setCurrent(m.id)}>
                  <span className="b-mail-from">
                    {m.from}
                    {m.unread ? <Badge tone="accent" dot>未読</Badge> : null}
                  </span>
                  <span className="b-mail-subject">{m.subject}</span>
                  <span className="b-mail-time">{m.time}</span>
                </button>
              </li>
            ))}
          </ul>
        </Resizable.Panel>
        <Resizable.Handle label="一覧の幅" />
        <Resizable.Panel>
          <article className="b-mail-body" aria-labelledby="mail-subject">
            <header>
              <ButtonGroup label="このメールの操作">
                <Button size="sm"><ArrowBendDownLeftIcon size={16} />返信</Button>
                <Button size="sm"><ShareNetworkIcon size={16} />転送</Button>
                <Button size="sm"><ArchiveIcon size={16} />アーカイブ</Button>
              </ButtonGroup>
              <h2 id="mail-subject">{mail.subject}</h2>
              <p>{mail.from}・{mail.time}</p>
            </header>
            <p>{mail.body}</p>
          </article>
        </Resizable.Panel>
      </Resizable>
    </main>
  );
}

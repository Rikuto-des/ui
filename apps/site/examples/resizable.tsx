"use client";
import { useState } from "react";
import { Resizable } from "@urushi/react";
const mails = [
  { from: "佐藤 美咲", subject: "告知メールの文面", body: "最終版を共有します。件名だけもう一度確認させてください。" },
  { from: "鈴木 健太", subject: "画像の差し替え", body: "申し込みページの画像を 3 点差し替えました。表示を確かめてもらえますか。" },
  { from: "高橋 陽子", subject: "来週の打ち合わせ", body: "火曜の 13:30 からでいかがでしょうか。会議室は 3 階を押さえています。" },
];
export default function ResizableExample() {
  const [current, setCurrent] = useState(0);
  const mail = mails[current];
  return (
    <div className="interaction-study">
      <header>
        <h3>一覧の幅を変えながら読む</h3>
      </header>
      <div className="study-split">
        <Resizable defaultSize={36} min={25} max={60}>
          <Resizable.Panel>
            <ul className="study-split-list" aria-label="受信したメール">
              {mails.map((m, i) => (
                <li key={m.subject}>
                  <button type="button" aria-current={i === current} onClick={() => setCurrent(i)}>
                    <b>{m.from}</b>
                    <span>{m.subject}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Resizable.Panel>
          <Resizable.Handle label="一覧の幅" />
          <Resizable.Panel>
            <article className="study-split-body">
              <h4>{mail.subject}</h4>
              <p>{mail.body}</p>
            </article>
          </Resizable.Panel>
        </Resizable>
      </div>
      <p className="study-caption" role="status">
        {mail.from}さんのメールを表示しています。
      </p>
    </div>
  );
}

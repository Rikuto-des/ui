"use client";
import { useRef, useState } from "react";
import { Button, ScrollArea } from "@urushi/react";
const entries = [
  "小さな発見を残す",
  "問いを書き留める",
  "違いに気づく",
  "形を整える",
  "余白をつくる",
  "手を動かす",
  "誰かに見せる",
  "次の一歩を決める",
];
export default function ScrollAreaExample() {
  const ref = useRef<HTMLDivElement>(null);
  const [end, setEnd] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>READING FLOW</small>
        <h3>続きをスクロールして読む</h3>
      </header>
      <ScrollArea
        ref={ref}
        label="フィールドノート"
        style={{ height: 240 }}
        onScroll={(e) =>
          setEnd(
            e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
              e.currentTarget.scrollHeight - 4,
          )
        }
      >
        <ol className="study-reading-list">
          {entries.map((entry, i) => (
            <li key={entry}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <strong>{entry}</strong>
              <p>思いついたことをひとつずつ記録します。</p>
            </li>
          ))}
        </ol>
      </ScrollArea>
      <div className="study-actions">
        <Button
          variant="ghost"
          onClick={() =>
            ref.current?.scrollTo({
              top: end ? 0 : ref.current.scrollHeight,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            })
          }
        >
          {end ? "先頭に戻る" : "最後まで読む"}
        </Button>
        <p className="study-caption" role="status">
          {end ? "最後まで読みました" : "スクロールして続きを表示"}
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Button, ButtonGroup, Separator } from "@urushi/react";
export default function SeparatorExample() {
  const [align, setAlign] = useState<"left" | "center" | "right">("left"),
    [bold, setBold] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>SPACE WITH PURPOSE</small>
        <h3>関連する操作を線で区切る</h3>
      </header>
      <div className="study-toolbar">
        <ButtonGroup label="文字揃え">
          {(["left", "center", "right"] as const).map((value, i) => (
            <Button
              key={value}
              size="sm"
              aria-label={["左揃え", "中央揃え", "右揃え"][i]}
              aria-pressed={align === value}
              onClick={() => setAlign(value)}
            >
              {["左", "中央", "右"][i]}
            </Button>
          ))}
        </ButtonGroup>
        <Separator orientation="vertical" />
        <Button size="sm" aria-pressed={bold} onClick={() => setBold(!bold)}>
          太字
        </Button>
      </div>
      <Separator />
      <blockquote
        className="study-quote"
        style={{ textAlign: align, fontWeight: bold ? 650 : 400 }}
      >
        関連する操作を
        <br />
        区切って並べる
      </blockquote>
      <p className="study-caption">
        横の線は内容を、縦の線は操作を区切っています。
      </p>
    </div>
  );
}

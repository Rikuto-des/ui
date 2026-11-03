"use client";
import { useState } from "react";
import { AspectRatio, Button } from "@urushi/react";
export default function AspectRatioExample() {
  const [ratio, setRatio] = useState(16 / 9),
    [position, setPosition] = useState(50);
  return (
    <div className="interaction-study">
      <header>
        <small>REFRAME</small>
        <h3>画像の縦横比と構図を切り替える</h3>
      </header>
      <div className="study-crop">
        <AspectRatio ratio={String(ratio)}>
          <div
            className="study-landscape"
            style={{ backgroundPosition: `${position}% center` }}
            role="img"
            aria-label="丸い太陽と重なる丘の抽象画"
          />
        </AspectRatio>
      </div>
      <div className="study-actions" role="group" aria-label="縦横比">
        {[
          { label: "16:9", value: 16 / 9 },
          { label: "1:1", value: 1 },
          { label: "4:3", value: 4 / 3 },
        ].map((r) => (
          <Button
            key={r.label}
            size="sm"
            aria-pressed={ratio === r.value}
            onClick={() => setRatio(r.value)}
          >
            {r.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPosition(position === 50 ? 75 : 50)}
        >
          構図をずらす
        </Button>
      </div>
    </div>
  );
}

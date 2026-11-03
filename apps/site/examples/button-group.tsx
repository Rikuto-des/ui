"use client";
import { MinusIcon, PlusIcon } from "@urushi/react/icons";
import { useState } from "react";
import { Button, ButtonGroup } from "@urushi/react";
export default function ButtonGroupExample() {
  const [zoom, setZoom] = useState(100),
    [fit, setFit] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>VIEW CONTROLS</small>
        <h3>拡大と縮小の操作をまとめる</h3>
      </header>
      <div className="study-art-window">
        <div
          className="study-art"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <span>FORM</span>
          <strong>01</strong>
        </div>
      </div>
      <div className="study-actions">
        <ButtonGroup label="表示倍率">
          <Button
            aria-label="縮小"
            disabled={zoom <= 75}
            onClick={() => {
              setZoom(Math.max(75, zoom - 25));
              setFit(false);
            }}
          >
            <MinusIcon size={16} />
          </Button>
          <Button
            aria-label="倍率を100%に戻す"
            onClick={() => {
              setZoom(100);
              setFit(false);
            }}
          >
            {zoom}%
          </Button>
          <Button
            aria-label="拡大"
            disabled={zoom >= 150}
            onClick={() => {
              setZoom(Math.min(150, zoom + 25));
              setFit(false);
            }}
          >
            <PlusIcon size={16} />
          </Button>
        </ButtonGroup>
        <Button
          aria-pressed={fit}
          onClick={() => {
            setZoom(75);
            setFit(true);
          }}
        >
          全体を表示
        </Button>
      </div>
      <p className="study-caption" role="status">
        表示倍率 {zoom}%
      </p>
    </div>
  );
}

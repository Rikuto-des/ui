"use client";
import { useState } from "react";
import { Popover, Switch } from "@urushi/react";
export default function PopoverExample() {
  const [grid, setGrid] = useState(true),
    [guides, setGuides] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>ADJUST IN PLACE</small>
        <h3>設定しながら結果を見る</h3>
      </header>
      <div className="study-canvas" data-grid={grid} data-guides={guides}>
        <strong>Make room.</strong>
        <span>CANVAS / 01</span>
      </div>
      <Popover.Trigger popover="canvas-settings">
        キャンバスの設定
      </Popover.Trigger>
      <Popover id="canvas-settings" title="表示設定">
        <div className="study-popover-fields">
          <Switch checked={grid} onChange={(e) => setGrid(e.target.checked)}>
            グリッドを表示
          </Switch>
          <Switch
            checked={guides}
            onChange={(e) => setGuides(e.target.checked)}
          >
            ガイドを表示
          </Switch>
          <Popover.Close popover="canvas-settings" variant="ghost">
            完了
          </Popover.Close>
        </div>
      </Popover>
      <p className="study-caption">設定はその場で反映されます。</p>
    </div>
  );
}

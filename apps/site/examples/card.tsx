"use client";
import { BookmarkSimpleIcon } from "@urushi/react/icons";
import { useState } from "react";
import { Badge, Button, Card } from "@urushi/react";
export default function CardExample() {
  const [saved, setSaved] = useState(false),
    [details, setDetails] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>A SMALL COLLECTION</small>
        <h3>ノートをコレクションに追加する</h3>
      </header>
      <Card
        title="余白のあるノート"
        description="日々の気づきを記録するノートです。"
        selected={saved}
        footer={
          <div className="study-actions">
            <Button aria-pressed={saved} onClick={() => setSaved(!saved)}>
              <BookmarkSimpleIcon size={16} weight={saved ? "fill" : "regular"} />
              {saved ? "コレクションに追加済み" : "コレクションに追加"}
            </Button>
            <Button
              variant="ghost"
              aria-expanded={details}
              aria-controls="card-detail"
              onClick={() => setDetails(!details)}
            >
              詳細
            </Button>
          </div>
        }
      >
        <div className="study-art" data-art="paper">
          <span>FIELD NOTES</span>
          <strong>余白</strong>
        </div>
        <div id="card-detail" hidden={!details} className="study-copy">
          A5サイズの無地のノートで、64ページあります。ここでは商品の購入や注文は行いません。
        </div>
      </Card>
      <p className="study-caption" role="status">
        {saved ? (
          <Badge tone="ok">コレクション 1件</Badge>
        ) : (
          "追加と解除を試せるプレビューです。"
        )}
      </p>
    </div>
  );
}

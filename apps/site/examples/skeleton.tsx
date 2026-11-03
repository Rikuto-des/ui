"use client";
import { useEffect, useState } from "react";
import { Avatar, Button, Skeleton } from "@urushi/react";
export default function SkeletonExample() {
  const [loading, setLoading] = useState(false),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setLoaded(true);
    }, 1700);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <div className="interaction-study">
      <header>
        <small>SPACE RESERVED</small>
        <h3>読み込み前後で位置を保つ</h3>
      </header>
      <div className="study-skeleton-stage" aria-busy={loading}>
        {!loaded || loading ? (
          <div key="placeholder" className="study-skeleton-content">
            <Skeleton shape="circle" style={{ width: 44, height: 44 }} />
            <div>
              <Skeleton shape="text" lines={2} />
            </div>
            <Skeleton style={{ height: 120, gridColumn: "1 / -1" }} />
          </div>
        ) : (
          <div key="content" className="study-skeleton-content">
            <Avatar name="佐藤 美咲" size="lg" />
            <div>
              <strong>佐藤 美咲</strong>
              <p>デザインの記録</p>
            </div>
            <div className="study-art" data-art="paper">
              <span>FIELD NOTES</span>
              <strong>余白</strong>
            </div>
          </div>
        )}
      </div>
      <div className="study-actions">
        <Button
          aria-disabled={loading}
          onClick={() => {
            if (!loading) setLoading(true);
          }}
        >
          {loaded ? "もう一度読み込む" : "内容を読み込む"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setLoading(false);
            setLoaded(false);
          }}
        >
          リセット
        </Button>
      </div>
      <p className="study-caption" role="status">
        {loading
          ? "見本を読み込み中です。"
          : loaded
            ? "内容を表示しました。"
            : "表示領域を先に確保しています。"}
      </p>
    </div>
  );
}

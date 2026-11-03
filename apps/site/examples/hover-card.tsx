"use client";
import { useState } from "react";
import { Avatar, Badge, HoverCard } from "@urushi/react";
export default function HoverCardExample() {
  const [profile, setProfile] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>A GLANCE, THEN A STEP</small>
        <h3>詳細を開く前にプロフィールを確認する</h3>
      </header>
      <p className="study-copy">
        このノートは{" "}
        <HoverCard.Trigger
          hoverCard="person-preview"
          href="#person-full"
          onClick={() => setProfile(true)}
        >
          佐藤 美咲
        </HoverCard.Trigger>{" "}
        が編集しています。
      </p>
      <HoverCard id="person-preview">
        <div className="study-person">
          <Avatar name="佐藤 美咲" status="online" statusLabel="オンライン" />
          <div>
            <strong>佐藤 美咲</strong>
            <p>Product Designer</p>
          </div>
        </div>
        <p className="study-copy">文字と余白、使い心地を整えています。</p>
        <Badge tone="ok" dot>
          オンライン
        </Badge>
      </HoverCard>
      <section
        id="person-full"
        className="study-result"
        hidden={!profile}
        tabIndex={-1}
      >
        <small>PROFILE</small>
        <strong>佐藤 美咲</strong>
        <p>担当：Field notes / Design system</p>
        <p>ホバーやフォーカスで概要を、クリックで詳細を表示できます。</p>
      </section>
      <p className="study-caption">
        タッチ操作では名前をタップして詳細を開けます。
      </p>
    </div>
  );
}

"use client";
import { ArrowRightIcon } from "@urushi/react/icons";
import { useState } from "react";
import { Link } from "@urushi/react";
export default function LinkExample() {
  const [chapter, setChapter] = useState("overview");
  return (
    <div className="interaction-study">
      <header>
        <small>READING PATH</small>
        <h3>文章内のリンクから詳細を開く</h3>
      </header>
      <p className="study-copy">
        まずは
        <Link href="#link-overview" onClick={() => setChapter("overview")}>
          概要
        </Link>
        を確認してください。具体的な使い方は
        <Link href="#link-practice" onClick={() => setChapter("practice")}>
          実装例
        </Link>
        で確認できます。
      </p>
      <section
        id={chapter === "overview" ? "link-overview" : "link-practice"}
        className="study-result"
        key={chapter}
        tabIndex={-1}
      >
        <small>
          {chapter === "overview" ? "01 / OVERVIEW" : "02 / PRACTICE"}
        </small>
        <strong>
          {chapter === "overview"
            ? "文章から関連する情報を開く"
            : "実装例を確認する"}
        </strong>
        <p>
          {chapter === "overview"
            ? "リンクは文章の中でも下線で見分けられます。"
            : "キーボードでもリンク先へ移動できます。"}
        </p>
      </section>
      <Link href="/docs/" variant="standalone">
        セットアップを読む <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Pagination } from "@urushi/react";
const titles = [
  "朝の光",
  "線と余白",
  "色の記録",
  "小さな発見",
  "街の輪郭",
  "紙の手触り",
  "窓辺の景色",
  "日々の道具",
  "静かな時間",
];
export default function PaginationExample() {
  const [page, setPage] = useState(1);
  return (
    <div className="interaction-study">
      <header>
        <small>ONE PAGE AT A TIME</small>
        <h3>表示位置を保ってページを切り替える</h3>
      </header>
      <ol className="study-page-list" start={(page - 1) * 3 + 1}>
        {titles.slice((page - 1) * 3, page * 3).map((title, i) => (
          <li key={title}>
            <span className="study-page-art" data-art={i} />
            <div>
              <small>
                NOTE {String((page - 1) * 3 + i + 1).padStart(2, "0")}
              </small>
              <strong>{title}</strong>
            </div>
          </li>
        ))}
      </ol>
      <Pagination
        page={page}
        total={3}
        href="#notes-page-{page}"
        onClick={(e) => {
          const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
            "a",
          );
          if (!link) return;
          e.preventDefault();
          const next = Number(link.hash.split("-").pop());
          if (next >= 1 && next <= 3) {
            setPage(next);
            requestAnimationFrame(() =>
              document
                .querySelector<HTMLElement>(
                  '.interaction-study [data-slot="pagination"] [aria-current="page"]',
                )
                ?.focus({ preventScroll: true }),
            );
          }
        }}
      />
      <p className="study-caption" role="status">
        {page} / 3 ページ・{(page - 1) * 3 + 1}〜{page * 3}件を表示
      </p>
    </div>
  );
}

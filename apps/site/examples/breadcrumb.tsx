"use client";
import { ArrowRightIcon } from "@urushi/react/icons";
import { useRef, useState } from "react";
import { Breadcrumb, Button } from "@urushi/react";
const levels = ["Workspace", "Projects", "Field notes"];
export default function BreadcrumbExample() {
  const [depth, setDepth] = useState(2);
  const heading = useRef<HTMLHeadingElement>(null);
  const go = (next: number) => {
    setDepth(next);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  };
  return (
    <div className="interaction-study">
      <header>
        <small>FIND YOUR WAY BACK</small>
        <h3>現在地を確認して親の階層に戻る</h3>
      </header>
      <Breadcrumb
        onClick={(e) => {
          const link = (e.target as HTMLElement).closest("a");
          if (link) {
            e.preventDefault();
            const index = Number(link.hash.split("-").pop());
            go(index);
          }
        }}
      >
        {levels.slice(0, depth + 1).map((name, i) => (
          <Breadcrumb.Item
            key={name}
            href={`#breadcrumb-level-${i}`}
            current={i === depth}
          >
            {name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <section
        id={`breadcrumb-level-${depth}`}
        className="study-folder"
        key={depth}
      >
        <small>0{depth + 1} / LOCATION</small>
        <h4 ref={heading} tabIndex={-1}>
          {levels[depth]}
        </h4>
        {depth < 2 ? (
          <Button variant="ghost" onClick={() => go(depth + 1)}>
            {levels[depth + 1]} を開く <ArrowRightIcon size={16} />
          </Button>
        ) : (
          <p>アイデアと記録をまとめたプロジェクトです。</p>
        )}
      </section>
      <p className="study-caption" role="status">
        {levels[depth]}を表示中
      </p>
    </div>
  );
}

"use client";
import { BookmarkSimpleIcon } from "@urushi/react/icons";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Kbd,
  Skeleton,
  Spinner,
  Button,
  ButtonGroup,
  Empty,
  Field,
  Pagination,
  Progress,
  Slider,
  toast,
} from "@urushi/react";

/** Only demonstrations with application state need a client component. */
export function CatalogButtons() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="preview-stack preview-centered">
      <div className="preview-row">
        <Button variant="primary" onClick={() => setSaved(true)}>
          {saved ? "保存しました" : "変更を保存"}
        </Button>
        <Button onClick={() => setSaved(false)}>リセット</Button>
      </div>
      <div className="preview-row">
        <Button variant="ghost" onClick={() => toast("通知のプレビューです")}>
          通知を表示
        </Button>
        <Button disabled>無効</Button>
      </div>
      <span className="preview-hint" role="status">
        {saved ? "変更が反映されました。" : "クリックして状態を確認できます。"}
      </span>
    </div>
  );
}
export function CatalogAction({
  children,
  message,
}: {
  children: string;
  message: string;
}) {
  return (
    <Button size="sm" onClick={() => toast(message, { tone: "ok" })}>
      {children}
    </Button>
  );
}
export function CatalogButtonGroup() {
  const [zoom, setZoom] = useState(100);
  return (
    <div className="preview-stack preview-centered">
      <ButtonGroup label="プレビューの拡大率">
        <Button
          size="sm"
          aria-label="縮小"
          disabled={zoom <= 50}
          onClick={() => setZoom((n) => n - 25)}
        >
          −
        </Button>
        <Button size="sm" onClick={() => setZoom(100)} aria-label="100%に戻す">
          {zoom}%
        </Button>
        <Button
          size="sm"
          aria-label="拡大"
          disabled={zoom >= 200}
          onClick={() => setZoom((n) => n + 25)}
        >
          ＋
        </Button>
      </ButtonGroup>
      <span className="preview-hint" role="status">
        表示倍率 {zoom}%
      </span>
    </div>
  );
}
export function CatalogSlider() {
  const [value, setValue] = useState(64);
  return (
    <div className="preview-stack">
      <Field id="catalog-volume" label="音量">
        <Slider
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          showValue
          valueSuffix="%"
          marks={[
            { value: 0, label: "0" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
          ]}
        />
      </Field>
    </div>
  );
}
export function CatalogProgress() {
  const [value, setValue] = useState(40);
  return (
    <div className="preview-stack">
      <Progress label="プロジェクトの進捗" value={value} />
      <div className="preview-row">
        <Button
          size="sm"
          onClick={() => setValue((n) => (n >= 100 ? 0 : n + 20))}
        >
          {value >= 100 ? "最初から" : "進める"}
        </Button>
      </div>
    </div>
  );
}
export function CatalogPagination() {
  const [page, setPage] = useState(1);
  return (
    <div className="preview-stack preview-centered">
      <p className="preview-hint" role="status">
        ページ {page} / 3
      </p>
      <Pagination
        page={page}
        total={3}
        href="#catalog-page-{page}"
        label="一覧プレビューのページ送り"
        onClick={(e) => {
          const link = (e.target as Element).closest("a");
          if (link) {
            e.preventDefault();
            setPage(Number(link.hash.split("-").at(-1)));
          }
        }}
      />
    </div>
  );
}
export function CatalogEmpty() {
  const [created, setCreated] = useState(false);
  return created ? (
    <div className="preview-stack preview-centered">
      <p role="status">最初のプロジェクトができました。</p>
      <Button size="sm" onClick={() => setCreated(false)}>
        空の状態に戻す
      </Button>
    </div>
  ) : (
    <Empty
      title="まだプロジェクトがありません"
      description="プロジェクトを作成してアイデアを記録できます。"
      action={
        <Button size="sm" onClick={() => setCreated(true)}>
          プロジェクトを作成
        </Button>
      }
    />
  );
}

export function CatalogCard() {
  const [saved, setSaved] = useState(false);
  return (
    <Card
      title="Field notes"
      description="日々の気づきを記録するノートです。"
      selected={saved}
      footer={
        <Button size="sm" aria-pressed={saved} onClick={() => setSaved(!saved)}>
          <BookmarkSimpleIcon size={16} weight={saved ? "fill" : "regular"} />
          {saved ? "保存済み" : "コレクションに追加"}
        </Button>
      }
    >
      <div className="preview-row">
        <Avatar name="佐藤 美咲" status="online" statusLabel="オンライン" />
        <span className="preview-hint">Design journal / 01</span>
      </div>
    </Card>
  );
}
export function CatalogBadge() {
  const [done, setDone] = useState(false);
  return (
    <div className="preview-stack preview-centered">
      <Badge tone={done ? "ok" : "accent"} dot>
        {done ? "完了" : "進行中"}
      </Badge>
      <Button size="sm" variant="ghost" onClick={() => setDone(!done)}>
        {done ? "進行中に戻す" : "完了にする"}
      </Button>
    </div>
  );
}
export function CatalogKeys() {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="preview-stack preview-centered">
      <Kbd pressed={pressed}>Enter ↵</Kbd>
      <Button
        size="sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") setPressed(true);
        }}
        onKeyUp={() => setPressed(false)}
        onBlur={() => setPressed(false)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        押して確認
      </Button>
    </div>
  );
}
export function CatalogLoading({ kind }: { kind: "spinner" | "skeleton" }) {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("done"), 1400);
    return () => clearTimeout(timer);
  }, [phase]);
  return (
    <div className="preview-stack preview-centered">
      {phase === "done" ? (
        <p role="status">ノートを表示しました。</p>
      ) : kind === "spinner" ? (
        <Spinner
          showLabel
          label={
            phase === "loading"
              ? "ノートを準備しています"
              : "読み込み表示の見本"
          }
        />
      ) : (
        <div
          style={{ width: "100%" }}
          role="group"
          aria-label="読み込み表示の見本"
        >
          <Skeleton shape="text" lines={3} />
        </div>
      )}
      <Button
        size="sm"
        onClick={() => setPhase(phase === "loading" ? "idle" : "loading")}
      >
        {phase === "loading" ? "取り消す" : "読み込みを試す"}
      </Button>
    </div>
  );
}

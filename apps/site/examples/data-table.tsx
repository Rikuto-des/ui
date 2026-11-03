"use client";
import { useState } from "react";
import { Badge, Button, Field, Input } from "@urushi/react";
import { DataTable } from "@urushi/react/data-table";
const initial = [
  {
    id: "1",
    name: "Website",
    status: "進行中",
    note: "トップページの余白と文字サイズを調整します。",
    owner: "佐藤 美咲",
  },
  {
    id: "2",
    name: "Mobile app",
    status: "レビュー",
    note: "タッチ操作と画面遷移を確認します。",
    owner: "高橋 蓮",
  },
  {
    id: "3",
    name: "Brand system",
    status: "完了",
    note: "色とタイポグラフィの仕様を整理します。",
    owner: "Alex Chen",
  },
  {
    id: "4",
    name: "Onboarding",
    status: "予定",
    note: "初回操作の流れを設計します。",
    owner: "佐藤 美咲",
  },
];
export default function DataTableExample({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [rows, setRows] = useState(initial),
    [selected, setSelected] = useState<string[]>([]),
    [query, setQuery] = useState(""),
    [removed, setRemoved] = useState<string[]>([]);
  const visible = rows.filter((row) =>
    `${row.name} ${row.status} ${row.owner}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="interaction-study study-wide">
      {!compact && (
        <header>
          <small>LESS NAVIGATION, MORE CONTEXT</small>
          <h3>行の内容を確認してまとめて整理する</h3>
        </header>
      )}
      {!compact && (
        <Field id="table-search" label="プロジェクトを検索">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前・状態・担当者"
          />
        </Field>
      )}
      <DataTable
        locale="ja"
        label="プロジェクト"
        rows={visible}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        selectedIds={selected}
        onSelectionChange={setSelected}
        pageSize={3}
        columns={[
          {
            id: "name",
            header: "名前",
            cell: (row) => <strong>{row.name}</strong>,
            sortValue: (row) => row.name,
          },
          {
            id: "status",
            header: "状態",
            cell: (row) => (
              <Badge tone={row.status === "完了" ? "ok" : "neutral"} dot>
                {row.status}
              </Badge>
            ),
            sortValue: (row) => row.status,
          },
        ]}
        renderDetails={(row) => (
          <div className="study-row-detail">
            <small>担当：{row.owner}</small>
            <p>{row.note}</p>
          </div>
        )}
      />
      {!compact && (
        <div className="study-actions">
          <Button
            size="sm"
            aria-disabled={!selected.length}
            onClick={() => {
              if (!selected.length) return;
              setRemoved((previous) => [
                ...new Set([...previous, ...selected]),
              ]);
              setRows(rows.filter((row) => !selected.includes(row.id)));
              setSelected([]);
            }}
          >
            選択した{selected.length}件をアーカイブ
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-disabled={!removed.length}
            onClick={() => {
              if (!removed.length) return;
              setRows(
                initial.filter(
                  (row) =>
                    rows.some((current) => current.id === row.id) ||
                    removed.includes(row.id),
                ),
              );
              setRemoved([]);
            }}
          >
            元に戻す
          </Button>
        </div>
      )}
      <p className="study-caption" role="status">
        {removed.length
          ? `${removed.length}件をアーカイブしました。元に戻せます。`
          : "行の末尾から詳細を開けます。"}
      </p>
    </div>
  );
}

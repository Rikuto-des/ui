import { defineContract, z, node } from "@urushi/contract";
export default defineContract({
 name: "data-table", tier: 3, styleDependencies: ["checkbox"], summary: "並び替え、ページ送り、行の選択に対応したテーブルです。",
 use: ["並び替え、ページ送り、行の選択に対応したテーブルです。"], avoid: [{case: "検索や複雑な操作が不要な場合", instead: "table"}],
 rendering: "client", platform: {requires: ["React 19", "HTML table"]},
 parts: [{jsx: "DataTable", slot: "data-table", element: "div", description: "並び替え、ページ送り、行の選択に対応したテーブルです。", props: z.object({label: z.string().min(1).describe("テーブルの用途が伝わる名前。"), rows: z.any().meta({"x-ts-type": "readonly unknown[]"}), columns: z.any().meta({"x-ts-type": 'readonly import("../data-table.tsx").DataTableColumn<unknown>[]'}), getRowId: z.any().meta({"x-ts-type": "(row: unknown) => string", description: "並び順が変わっても一定のID。行番号は使いません。"}), getRowLabel: z.any().optional().meta({"x-ts-type": "(row: unknown) => string"}), selectedIds: z.any().optional().meta({"x-ts-type": "readonly string[]"}), onSelectionChange: z.any().optional().meta({"x-ts-type": "(ids: string[]) => void"}), locale: z.string().default("en").describe("操作ラベルはen・jaに対応。並び替えにも使います。"), pageSize: z.number().int().positive().default(10), loading: z.boolean().optional(), renderDetails: z.any().optional().meta({"x-ts-type": "(row: unknown) => React.ReactNode", description: "行末のボタンで展開する詳細。"}), empty: node("0件のときに表示する内容").optional(),}), overrides: ["margin", "width", "layout", "position"]}],
 states: ["disabled", "empty", "focused"],
 a11y: {keyboard: {"Tab": "並び替え・選択・ページ送りの操作へ移動します", "Space": "行の選択を切り替えます", "Enter": "列を並び替えるか、ページを切り替えます"}, rules: ["用途が伝わるlabelを指定します。", "候補・項目・行には重複しない固定のIDを指定します。", "組み合わせた画面を、対象の支援技術で確認してください。"]},
 tokens: ["color.text", "color.surface", "color.focus-ring", "radius.control"],
 examples: [{title: "Example", code: "<DataTable label=\"プロジェクト\" rows={[{id:\"1\",name:\"Website\"}]} getRowId={row => row.id} columns={[{id:\"name\",header:\"名前\",cell: row => row.name,sortValue: row => row.name}]} />"}]
});

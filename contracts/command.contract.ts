import { defineContract, z, node } from "@urushi/contract";
export default defineContract({
 name: "command", tier: 3, summary: "コマンドを検索し、キーボードで実行するダイアログです。",
 use: ["コマンドを検索し、キーボードで実行するダイアログです。"], avoid: [{case: "検索や複雑な操作が不要な場合", instead: "menu"}],
 rendering: "client", platform: {requires: ["React 19", "dialog.showModal"]},
 parts: [{jsx: "Command", slot: "command", element: "dialog", description: "コマンドを検索し、キーボードで実行するダイアログです。", props: z.object({label: z.string().min(1), open: z.boolean(), onOpenChange: z.any().meta({"x-ts-type": "(open: boolean) => void"}), items: z.any().meta({"x-ts-type": 'readonly import("../command.tsx").CommandItem[]'}), placeholder: z.string().optional(), emptyText: z.string().optional(), closeLabel: z.string().optional(), navigationHint: z.string().optional(), actionHint: z.string().optional(),}), overrides: ["margin", "width", "layout", "position"]}],
 states: ["disabled", "empty", "focused"],
 a11y: {keyboard: {"ArrowDown / ArrowUp": "実行できるコマンドへ移動します", "Enter": "現在のコマンドを実行します", "Escape": "閉じて元のフォーカス位置へ戻ります", "Tab": "ダイアログ内の操作へ移動します"}, rules: ["用途が伝わるlabelを指定します。", "候補・項目・行には重複しない固定のIDを指定します。", "組み合わせた画面を、対象の支援技術で確認してください。"]},
 tokens: ["color.text", "color.surface", "color.focus-ring", "radius.control"],
 examples: [{title: "Example", code: "<Command label=\"コマンド\" open={open} onOpenChange={setOpen} items={[{id:\"new\",label:\"作成\",onSelect: createProject}]} />"}]
});

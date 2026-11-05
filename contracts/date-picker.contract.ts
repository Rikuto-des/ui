import { defineContract, z, node } from "@urushi/contract";
export default defineContract({
 name: "date-picker", styleDependencies: ["calendar"], tier: 3, summary: "日付を直接入力するか、カレンダーから選択します。",
 use: ["日付を直接入力するか、カレンダーから選択します。"], avoid: [{case: "検索や複雑な操作が不要な場合", instead: "date-input"}],
 rendering: "client", platform: {requires: ["React 19", "dialog.showModal"]},
 parts: [{jsx: "DatePicker", slot: "date-picker", element: "div", description: "日付を直接入力するか、カレンダーから選択します。", props: z.object({label: z.string().min(1).describe("画面に表示するラベル。必須です。"), value: z.string().optional().describe("YYYY-MM-DD形式。タイムゾーン変換は行いません。"), defaultValue: z.string().optional(), onValueChange: z.any().optional().meta({"x-ts-type": "(value: string) => void"}), min: z.string().optional(), max: z.string().optional(), locale: z.string().default("en"), presets: z.array(z.object({label: z.string(), value: z.string()})).optional().describe("日付候補。valueはYYYY-MM-DD形式。範囲外は選択できません。").meta({"x-ts-type": "readonly { label: string; value: string }[]"}),}), overrides: ["margin", "width", "layout", "position"]}],
 states: ["disabled", "empty", "focused"],
 a11y: {keyboard: {"Arrow keys": "左右で1日、上下で1週間移動します", "Home / End": "週の最初または最後の日へ移動します", "PageUp / PageDown": "前月・翌月へ移動します。Shiftを押すと年を切り替えます", "Enter": "日付を選択します", "Escape": "カレンダーを閉じ、開いたボタンへ戻ります"}, rules: ["用途が伝わるlabelを指定します。", "候補・項目・行には重複しない固定のIDを指定します。", "組み合わせた画面を、対象の支援技術で確認してください。"]},
 tokens: ["color.text", "color.surface", "color.focus-ring", "radius.control"],
 examples: [{title: "Example", code: "<DatePicker label=\"期限\" defaultValue=\"2026-10-30\" locale=\"ja\" />"}]
});

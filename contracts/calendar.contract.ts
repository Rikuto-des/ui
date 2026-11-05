import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "calendar",
  tier: 3,
  summary: "A month of days to pick a date from, always on the page (a booking or schedule view). DatePicker uses the same calendar in its dialog.",
  use: ["Choosing a date while the month stays in view (予約日・配達日を選ぶ)"],
  avoid: [
    { case: "A date field in a form", instead: "date-picker" },
    { case: "A date the user already knows and types", instead: "date-input" },
  ],
  rendering: "client",
  platform: { requires: ["React 19"] },
  parts: [
    {
      jsx: "Calendar",
      slot: "calendar",
      element: "div",
      description: "A named group with the month, its previous and next buttons, and a grid of day buttons. One day holds the Tab stop.",
      props: z.object({
        label: z.string().min(1).describe("Required accessible name (配達日 など)."),
        value: z.string().optional().describe("YYYY-MM-DD. No time zone conversion."),
        defaultValue: z.string().optional(),
        onValueChange: z.any().optional().meta({ "x-ts-type": "(value: string) => void" }),
        min: z.string().optional().describe("YYYY-MM-DD. Earlier days are disabled."),
        max: z.string().optional().describe("YYYY-MM-DD. Later days are disabled."),
        locale: z.string().default("en"),
        defaultFocusedDate: z.string().optional().describe("YYYY-MM-DD. The day that first holds the Tab stop; defaults to the value, else today."),
        autoFocus: z.boolean().default(false).describe("Move focus into the grid on mount, as inside a dialog."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["disabled", "focused"],
  a11y: {
    apg: "date picker dialog (grid)",
    keyboard: {
      "← / →": "previous / next day",
      "↑ / ↓": "same day of the previous / next week",
      "Home / End": "first / last day of the week",
      "PageUp / PageDown": "previous / next month; with Shift, previous / next year",
      "Enter / Space": "choose the day",
    },
    rules: ["Give a label that says what the date is for.", "Show the chosen date in words next to the calendar as well; a highlighted day alone is easy to miss."],
  },
  tokens: ["color.text", "color.surface", "color.action", "color.focus-ring", "radius.control", "radius.panel"],
  examples: [{ title: "Delivery date", code: `<Calendar label="配達日" defaultValue="2026-11-12" min="2026-11-05" locale="ja" />` }],
});

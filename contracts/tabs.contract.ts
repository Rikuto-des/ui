import { defineContract, idref, z } from "@urushi/contract";

export default defineContract({
  name: "tabs",
  styleDependencies: ["button"],
  tier: 2,
  summary: "Switches between panels of equal weight. Server-rendered; the runtime adds clicking and arrow keys.",
  use: ["Views of the same object (概要・設定・履歴)"],
  avoid: [{ case: "Steps of a process", instead: "stepper (planned)" }, { case: "Content most people skip", instead: "accordion" }],
  rendering: "server",
  platform: { requires: [], enhances: [{ feature: "@urushi/core tabs behavior", fallback: "only the default panel is reachable" }] },
  parts: [
    {
      jsx: "Tabs",
      slot: "tabs",
      element: "div",
      description: "The root. Generates the ids that link tabs and panels.",
      props: z.object({
        id: z.string().min(1).describe("Required. Prefix for the tab and panel ids."),
        label: z.string().min(1).describe("Required accessible name of the tab list."),
        defaultValue: z.string().describe("Required value of the tab selected initially."),
        orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
        motion: z.enum(["smooth", "none"]).default("smooth").describe("Moves the selected indicator and interpolates panel height without scaling text. Respects reduced motion; none switches immediately."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    { jsx: "Tabs.List", slot: "tabs-list", element: "div", description: "role=tablist; holds the Tabs.Tab elements.", props: z.object({}), overrides: [] },
    {
      jsx: "Tabs.Tab",
      slot: "tabs-tab",
      element: "button",
      description: "role=tab.",
      props: z.object({ value: z.string().describe("Required; matches a Tabs.Panel value.") }),
      overrides: [],
    },
    {
      jsx: "Tabs.Activate",
      slot: "tabs-activate",
      element: "button",
      description: "A button outside the tab list that selects a panel by Tabs id and value. The runtime keeps it in sync with pointer and keyboard selection; no DOM query or React selection state is needed. It does not move focus into the tab list; keyboard focus remains on the activating button. Disabled targets are not activated.",
      props: z.object({
        tabs: idref("Id of the Tabs root to control.", "tabs"),
        value: z.string().describe("Value of the Tabs.Tab to select."),
        variant: z.enum(["primary", "secondary", "ghost", "danger"]).default("secondary"),
        size: z.enum(["sm", "md", "lg"]).default("md"),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Tabs.Panel",
      slot: "tabs-panel",
      element: "div",
      description: "role=tabpanel.",
      props: z.object({ value: z.string().describe("Required; matches a Tabs.Tab value.") }),
      overrides: [],
    },
  ],
  states: ["selected"],
  a11y: {
    apg: "tabs (automatic activation)",
    keyboard: { "← / →": "move to and select the previous / next tab", "Home / End": "first / last tab", Tab: "moves into the selected panel" },
    rules: ["Tabs.Tab and Tabs.Panel must be direct children of Tabs.List and Tabs."],
  },
  tokens: ["color.text", "color.text-muted", "color.border", "color.action"],
  examples: [
    {
      title: "Select a view from outside the tab list",
      code: `<Tabs.Activate tabs="project" value="settings">設定を開く</Tabs.Activate>
<Tabs id="project" label="プロジェクト" defaultValue="overview">
  <Tabs.List><Tabs.Tab value="overview">概要</Tabs.Tab><Tabs.Tab value="settings">設定</Tabs.Tab></Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel><Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>`,
    },
    {
      title: "Project views",
      code: `<Tabs id="project" label="プロジェクト" defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">概要</Tabs.Tab>
    <Tabs.Tab value="settings">設定</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>`,
    },
  ],
});

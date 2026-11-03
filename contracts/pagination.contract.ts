import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "pagination",
  tier: 1,
  summary: "Links to the pages of a long list: previous, numbered pages with gaps, next.",
  use: ["Search results and lists split into pages"],
  avoid: [{ case: "A feed that loads more as you scroll", instead: "a load-more Button" }],
  rendering: "server",
  platform: { requires: [] },
  parts: [
    {
      jsx: "Pagination",
      slot: "pagination",
      element: "nav",
      description: "A nav of links. Each link's href comes from the template, so it works without JavaScript.",
      props: z.object({
        page: z.number().int().min(1).describe("Required. The current page."),
        total: z.number().int().min(1).describe("Required. The number of pages."),
        href: z.string().min(1).describe("Required URL template; {page} is replaced, e.g. \"/tasks?page={page}\"."),
        siblings: z.number().int().min(0).max(3).default(1).describe("Pages shown on each side of the current one."),
        label: z.string().min(1).default("ページ送り"),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["current"],
  a11y: { rules: ["The current page has aria-current=\"page\"; each number says \"n ページ目\"."] },
  tokens: ["color.text", "color.ghost-hover", "color.field", "shadow.control"],
  examples: [{ title: "Tasks", code: `<Pagination page={3} total={12} href="/tasks?page={page}" />` }],
});

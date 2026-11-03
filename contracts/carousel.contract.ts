import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "carousel",
  tier: 2,
  summary: "Slides in a horizontal scroll-snap strip; where CSS ::scroll-button and ::scroll-marker exist, the browser adds the buttons and dots.",
  use: ["A set of images or cards of equal weight that do not all fit"],
  avoid: [{ case: "Content most people must see", instead: "a list or grid" }],
  rendering: "server",
  platform: {
    requires: ["scroll-snap"],
    enhances: [{ feature: "::scroll-button / ::scroll-marker", fallback: "scroll by swipe, trackpad or the arrow keys" }],
  },
  parts: [
    {
      jsx: "Carousel",
      slot: "carousel",
      element: "section",
      description: "A named region (aria-roledescription=\"カルーセル\") with a focusable scroll strip.",
      props: z.object({
        label: z.string().min(1).describe("Required. Names the carousel."),
        previousLabel: z.string().default("前のスライド").describe("Accessible name for the previous-slide control."),
        nextLabel: z.string().default("次のスライド").describe("Accessible name for the next-slide control."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
    {
      jsx: "Carousel.Item",
      slot: "carousel-item",
      element: "div",
      description: "One slide; it is named \"n / total\".",
      props: z.object({}),
      overrides: [],
    },
  ],
  states: [],
  a11y: { keyboard: { "← / →": "move between slides when the strip is focused; respects RTL", "Home / End": "first / last slide with the runtime", "Tab": "previous, numbered positions and next controls" }, rules: ["Slides never move by themselves.", "The optional runtime adds controls and a current position in every supported browser; reduced motion uses immediate scrolling."] },
  tokens: ["color.text", "color.border-strong", "radius.panel"],
  examples: [
    {
      title: "Photos",
      code: `<Carousel label="会場の写真">
  <Carousel.Item><img src="/1.jpg" alt="受付" /></Carousel.Item>
  <Carousel.Item><img src="/2.jpg" alt="講演" /></Carousel.Item>
</Carousel>`,
    },
  ],
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { register } from "tsx/esm/api";

// node --test strips types from .ts but cannot load the .tsx components.
register();

type TabsModule = typeof import("../src/tabs.tsx");
type RadioGroupModule = typeof import("../src/radio-group.tsx");
type AccordionModule = typeof import("../src/accordion.tsx");

/**
 * Evaluates a component module again, as Vite does on a hot update (`?t=…`):
 * every function in it is a new object, while elements created before the
 * update still point at the old ones.
 */
async function load<T>(file: string, version: string): Promise<T> {
  return (await import(`${new URL(file, import.meta.url).href}?v=${version}`)) as T;
}

const tabs = { before: await load<TabsModule>("../src/tabs.tsx", "before"), after: await load<TabsModule>("../src/tabs.tsx", "after") };
const radioGroup = {
  before: await load<RadioGroupModule>("../src/radio-group.tsx", "before"),
  after: await load<RadioGroupModule>("../src/radio-group.tsx", "after"),
};
const accordion = {
  before: await load<AccordionModule>("../src/accordion.tsx", "before"),
  after: await load<AccordionModule>("../src/accordion.tsx", "after"),
};

function tabsTree(root: TabsModule, parts: TabsModule, list = parts) {
  return h(
    root.Tabs,
    { id: "project", label: "Project", defaultValue: "overview" },
    h(list.Tabs.List, null, h(parts.Tabs.Tab, { value: "overview" }, "Overview"), h(parts.Tabs.Tab, { value: "activity" }, "Activity")),
    h(parts.Tabs.Panel, { value: "overview" }, "Overview panel"),
    h(parts.Tabs.Panel, { value: "activity" }, "Activity panel"),
  );
}

test("Tabs wires parts created before a hot update", () => {
  const expected = renderToStaticMarkup(tabsTree(tabs.after, tabs.after));
  assert.match(expected, /id="project-tab-overview" aria-controls="project-panel-overview" aria-selected="true"/);
  // React runs the new Tabs (and the new Tabs.List) with the old elements as
  // children, so every level has to recognize parts from the previous version.
  for (const list of [tabs.before, tabs.after]) {
    assert.equal(renderToStaticMarkup(tabsTree(tabs.after, tabs.before, list)), expected);
  }
});

test("Tabs parts outside Tabs still throw", () => {
  const { Tabs } = tabs.after;
  assert.throws(() => renderToStaticMarkup(h(Tabs.List, null)), { message: "Tabs.List must be a direct child of Tabs" });
  assert.throws(() => renderToStaticMarkup(h(Tabs.Tab, { value: "a" })), {
    message: "Tabs.Tab must be a direct child of Tabs.List inside Tabs",
  });
  assert.throws(() => renderToStaticMarkup(h(Tabs.Panel, { value: "a" })), { message: "Tabs.Panel must be a direct child of Tabs" });
  // A part wrapped in another element is not a direct child, so it gets no wiring.
  assert.throws(
    () => renderToStaticMarkup(h(Tabs, { id: "t", label: "T", defaultValue: "a" }, h("div", null, h(Tabs.List, null)))),
    { message: "Tabs.List must be a direct child of Tabs" },
  );
});

function radioGroupTree(root: RadioGroupModule, parts: RadioGroupModule) {
  return h(
    root.RadioGroup,
    { name: "plan", legend: "Plan", defaultValue: "pro", required: true },
    h(parts.RadioGroup.Item, { value: "free" }, "Free"),
    h(parts.RadioGroup.Item, { value: "pro" }, "Pro"),
  );
}

test("RadioGroup passes name, required and the initial check to items created before a hot update", () => {
  const expected = renderToStaticMarkup(radioGroupTree(radioGroup.after, radioGroup.after));
  assert.equal(expected.match(/<input required=""[^>]* name="plan"/g)?.length, 2);
  assert.equal(expected.match(/checked=""/g)?.length, 1);
  assert.equal(renderToStaticMarkup(radioGroupTree(radioGroup.after, radioGroup.before)), expected);
});

function accordionTree(root: AccordionModule, parts: AccordionModule) {
  return h(
    root.Accordion,
    { name: "faq" },
    h(parts.Accordion.Item, { title: "Shipping" }, "Ships in two days."),
    h(parts.Accordion.Item, { title: "Returns", defaultOpen: true }, "Within 30 days."),
  );
}

test("Accordion passes its name to items created before a hot update", () => {
  const expected = renderToStaticMarkup(accordionTree(accordion.after, accordion.after));
  assert.equal(expected.match(/<details name="faq"/g)?.length, 2);
  assert.equal(renderToStaticMarkup(accordionTree(accordion.after, accordion.before)), expected);
});

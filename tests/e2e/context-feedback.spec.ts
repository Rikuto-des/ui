import { test, expect } from "@playwright/test";
import { build } from "esbuild";
import { resolve } from "node:path";

test.beforeEach(async ({ page }) => {
  const bundle = await build({
    stdin: {
      resolveDir: resolve("."),
      loader: "tsx",
      contents: `
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{DatePicker}from'./packages/react/src/date-picker.tsx';import{DataTable}from'./packages/react/src/data-table.tsx';import{Command}from'./packages/react/src/command.tsx';
function App(){const[open,setOpen]=useState(false),[result,setResult]=useState('');return <main style={{padding:24,maxWidth:600}}><h1>Context feedback</h1>
<DatePicker label="Due" defaultValue="2028-02-28" min="2028-02-01" max="2028-03-01" presets={[{label:'Leap day',value:'2028-02-29'},{label:'Impossible date',value:'2028-02-30'},{label:'Before minimum',value:'2028-01-31'},{label:'After maximum',value:'2028-03-02'}]}/>
<DataTable label="Records" rows={['A','B','C','D']} columns={[{id:'name',header:'Name',cell:r=>r,sortValue:r=>r}]} getRowId={r=>r} pageSize={2} renderDetails={r=><p>{r} details</p>}/>
<button onClick={e=>{e.currentTarget.focus();setOpen(true);}}>Open commands</button><p role="status">{result}</p>
<Command label="Find" open={open} onOpenChange={setOpen} items={[{id:'alpha',label:'Alpha',description:'First note',keywords:'first alpha',preview:<p>Alpha preview</p>,onSelect:()=>setResult('Alpha executed')},{id:'beta',label:'Beta',description:'Second note',keywords:'second beta',preview:<p>Beta preview</p>,onSelect:()=>setResult('Beta executed')},{id:'blocked',label:'Disabled',disabled:true,onSelect:()=>setResult('ERROR')}]} /></main>};createRoot(document.getElementById('root')).render(<App/>);`,
    },
    bundle: true,
    format: "esm",
    write: false,
    logLevel: "silent",
  });
  await page.route("**/context-fixture", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><head><title>Context feedback</title><link rel="stylesheet" href="/@fs${resolve("packages/react/styles/index.css")}"><link rel="stylesheet" href="/@fs${resolve("packages/packs/generated/graphite.css")}"></head><body><div id="root"></div><script type="module" src="/context-fixture.js"></script></body></html>`,
    }),
  );
  await page.route("**/context-fixture.js", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: bundle.outputFiles[0].text,
    }),
  );
  await page.goto("/context-fixture");
});
test("presets validate calendar dates and bounds, and restore trigger focus", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Due: 2028-02-28" }).click();
  for (const name of ["Impossible date", "Before minimum", "After maximum"])
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toBeDisabled();
  await page
    .getByRole("button", { name: "Leap day", exact: true })
    .press("Enter");
  await expect(page.getByLabel("Due", { exact: true })).toHaveValue(
    "2028-02-29",
  );
  await expect(
    page.getByRole("button", { name: "Due: 2028-02-29" }),
  ).toBeFocused();
});
test("row expansion follows stable IDs across sorting and pagination", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Details for A" }).click();
  await expect(page.getByText("A details", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await expect(page.getByText("A details", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Details for A" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("A details", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Details for B" }).click();
  await expect(page.getByText("B details", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Details for A" }).click();
  await expect(page.getByText("A details", { exact: true })).toHaveCount(0);
});
test("command explores with arrows, matches all words and skips disabled commands", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Open commands" });
  await trigger.press("Enter");
  const input = page.getByRole("combobox", { name: "Find" });
  await input.press("ArrowDown");
  await expect(page.locator('[data-slot="command-preview"]')).toHaveText(
    "Beta preview",
  );
  await input.press("ArrowDown");
  await expect(page.locator('[data-slot="command-preview"]')).toHaveText(
    "Alpha preview",
  );
  await input.fill(" note second ");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.locator('[data-slot="command-preview"]')).toHaveText(
    "Beta preview",
  );
  await input.press("Enter");
  await expect(page.locator('p[role="status"]')).toHaveText("Beta executed");
  await expect(trigger).toBeFocused();
});
test("context motion is finite and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Open commands" }).click();
  const preview = page.locator('[data-slot="command-preview"]');
  await expect(preview).toHaveCSS("animation-name", "ur-context-enter");
  await expect(preview).toHaveCSS("animation-iteration-count", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("combobox", { name: "Find" }).press("ArrowDown");
  await expect(preview).toHaveCSS("animation-name", "none");
  await expect(preview).toHaveText("Beta preview");
});

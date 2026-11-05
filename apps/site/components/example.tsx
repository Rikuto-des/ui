import { Tabs } from "@urushi/react/tabs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { examples } from "@/lib/examples";
import { CodeBlock } from "./code-block";

/** Preview and the exact rendering source share keyboard-accessible tabs. */
export async function Example({ slug }: { slug: string }) {
  const Demo = examples[slug];
  const source = await readFile(join(process.cwd(), "examples", `${slug}.tsx`), "utf8");
  const layout = ["dialog", "alert-dialog", "sheet", "popover", "menu", "tooltip", "hover-card", "avatar", "badge", "spinner", "toggle", "toggle-group", "button-group", "kbd"].includes(slug) ? "compact" : ["navigation-menu", "data-table", "table", "carousel", "sidebar", "button"].includes(slug) ? "wide" : "standard";
  const guidance = ["checkbox", "switch", "toggle"].includes(slug) ? "Tabで移動し、Spaceで切り替えられます。" : ["tabs", "radio-group", "toggle-group"].includes(slug) ? "Tabで移動し、矢印キーで選択できます。" : ["context-menu"].includes(slug) ? "Shift+F10 か Menu キーでも開けます。Escapeで閉じられます。" : ["menubar"].includes(slug) ? "左右の矢印でメニューを移り、↓で開きます。Escapeで閉じられます。" : ["form"].includes(slug) ? "送信すると、エラーのまとめにフォーカスが移ります。まとめのリンクで欄に移れます。" : ["resizable"].includes(slug) ? "区切りにTabで移り、矢印キーで幅を変えられます。" : ["drawer"].includes(slug) ? "つまみか見出しを下に引くと閉じます。Escapeでも閉じられます。" : ["dialog", "sheet", "popover", "menu", "tooltip", "hover-card", "navigation-menu"].includes(slug) ? "キーボードでも操作できます。Escapeで閉じられます。" : undefined;
  return (
    <div className="example" data-layout={layout}>
      <Tabs id={`example-${slug}`} label={`${slug} example`} defaultValue="preview">
        <Tabs.List><Tabs.Tab value="preview">Preview</Tabs.Tab><Tabs.Tab value="code">Code</Tabs.Tab></Tabs.List>
        <Tabs.Panel value="preview"><div className="stage"><div className="stage-content"><Demo /></div></div>{guidance && <p className="preview-guidance">{guidance}</p>}</Tabs.Panel>
        <Tabs.Panel value="code"><CodeBlock code={source} /></Tabs.Panel>
      </Tabs>
    </div>
  );
}

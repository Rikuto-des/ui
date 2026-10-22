import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import plugin from "../src/index.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});
// For TypeScript-only syntax (`import { type X }`).
const tsTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});
const rules = plugin.rules;

tester.run("no-visual-override", rules["no-visual-override"], {
  valid: [
    `<Button variant="danger">削除</Button>`,
    `<Button className="mt-4 w-full md:w-auto self-end">保存</Button>`,
    `<Popover id="p" title="t" className="w-80 max-h-96" />`,
    `<Button style={{ marginTop: 8, gridColumn: "span 2" }}>保存</Button>`,
    `<div className="bg-red-500 rounded-xl" />`,
    { code: `<Button className="my-utility">保存</Button>`, options: [{ allowUnknownClasses: true }] },
    `<Button className={["mt-2", isWide && "w-full"].join(" ")}>保存</Button>`,
  ],
  invalid: [
    {
      code: `<Button className="bg-red-500 rounded-xl px-6">削除</Button>`,
      errors: [{ messageId: "className" }],
    },
    {
      code: `<Dialog.Trigger dialog="d" className={cn("mt-2", isBig && "h-12")}>開く</Dialog.Trigger>`,
      errors: [{ messageId: "className" }],
    },
    {
      code: `<Dialog id="d" title="t" className="mt-4" />`,
      errors: [{ messageId: "className" }],
    },
    {
      code: `<Button style={{ background: "red", marginTop: 4 }}>保存</Button>`,
      errors: [{ messageId: "style" }],
    },
    {
      code: `<Dialog.Actions className="gap-2" />`,
      errors: [{ messageId: "className" }],
    },
    {
      code: `<Btn className="text-white">保存</Btn>`,
      options: [{ components: { Btn: "Button" } }],
      errors: [{ messageId: "className" }],
    },
    // Classes joined from an array are checked like cn() arguments.
    {
      code: `<Button className={["mt-2", isDanger ? "bg-red-500" : ""].filter(Boolean).join(" ")}>削除</Button>`,
      errors: [{ messageId: "className" }],
    },
    // The hint names the prop the part has for that look, and never a variant it does not have.
    { code: `<Button className="bg-red-500">削除</Button>`, errors: [{ message: /色は variant（primary \| secondary \| ghost \| danger）で選んでください。/ }] },
    {
      code: `<Card className="p-8 shadow-lg">…</Card>`,
      errors: [{ message: /^(?!.*variant).*余白は padding（sm \| md \| lg）で選んでください。shadow-lg にあたる props はありません（<Card> で選べる見た目は padding（sm \| md \| lg）だけです）。className から外して/ }],
    },
    { code: `<Badge className="bg-green-100 text-green-800">完了</Badge>`, errors: [{ message: /^(?!.*variant).*色は tone（neutral \| accent \| ok \| danger）で選んでください。$/ }] },
    { code: `<Card style={{ padding: 24, boxShadow: "none" }}>…</Card>`, errors: [{ message: /^(?!.*variant).*style で変えてよいのは.*余白は padding（sm \| md \| lg）で選んでください。boxShadow にあたる props はありません.*style から外して/ }] },
    { code: `<Dialog.Actions className="rounded-lg" />`, errors: [{ message: /角の丸みはパックが決めます/ }] },
    { code: `<Card className="bg-white">…</Card>`, errors: [{ message: /bg-white にあたる props はありません（<Card> で選べる見た目は padding（sm \| md \| lg）だけです）/ }] },
    { code: `<Tooltip id="t" className="shadow-md">⌘S</Tooltip>`, errors: [{ message: /shadow-md にあたる props はありません（<Tooltip> に見た目を選ぶ props はありません）/ }] },
    // Classes that lay out the children belong on the app's own element inside the part.
    { code: `<Card className="flex flex-col gap-6">…</Card>`, errors: [{ message: /だけです。中身の並び（flex・gap など）は、子要素に自分の要素（div や span）を置いて、そこに書いてください。$/ }] },
    { code: `<Button className="h-12">保存</Button>`, errors: [{ message: /大きさは size（sm \| md \| lg）で選んでください。/ }] },
  ],
});

tester.run("no-raw-color", rules["no-raw-color"], {
  valid: [
    `<div className="grid gap-4" />`,
    `<p style={{ color: "var(--yl-color-text-muted)" }} />`,
    `<div className={["grid gap-4", isOpen && "mt-2"].join(" ")} />`,
    `<div className={\`p-4 \${isOpen ? "mt-2" : ""}\`} />`,
    // Outside className, only strings that read as a class list are checked: not ids, prose, CSS values or token names.
    `function rowClass() { return "flex items-center gap-2"; }`,
    `const id = "row-actions"; const note = "Use bg-red-500 for errors"; const rule = "1px solid red"; const token = "text-muted";`,
    `const selector = "[data-state=open]"; const label = "bg-red-500 は使わない";`,
  ],
  invalid: [
    { code: `<div className="bg-slate-100 text-blue-600/80" />`, errors: [{ messageId: "palette" }, { messageId: "palette" }] },
    { code: `<div className="p-[13px]" />`, errors: [{ messageId: "arbitrary" }] },
    { code: `<p style={{ color: "#ff0000", background: "oklch(0.7 0.1 30)" }} />`, errors: [{ messageId: "rawStyle" }, { messageId: "rawStyle" }] },
    // A token inside a Tailwind arbitrary value is still an arbitrary value; the message
    // gives the same token in style and in CSS, with the property filled in.
    {
      code: `<p className="text-sm text-[var(--yl-color-text-muted)]" />`,
      errors: [{ message: /style=\{\{ color: "var\(--yl-color-text-muted\)" \}\}.*color: var\(--yl-color-text-muted\)/ }],
    },
    { code: `<div className="bg-(--yl-color-surface)" />`, errors: [{ message: /style=\{\{ backgroundColor: "var\(--yl-color-surface\)" \}\}/ }] },
    { code: `<div className="border-t-[var(--yl-color-border)]" />`, errors: [{ message: /borderTopColor: "var\(--yl-color-border\)"/ }] },
    { code: `<p className="text-[length:var(--yl-font-size-small)]" />`, errors: [{ message: /fontSize: "var\(--yl-font-size-small\)"/ }] },
    // A `:` inside the brackets is part of the value, not a variant.
    { code: `<p className="text-[color:var(--yl-color-text-muted)]" />`, errors: [{ messageId: "arbitraryToken" }] },
    { code: `<p className="md:[color:var(--yl-color-text)]" />`, errors: [{ message: /color: "var\(--yl-color-text\)"/ }] },
    // Palette colors name the tokens to use instead, never an arbitrary value to write.
    { code: `<p className="text-gray-500" />`, errors: [{ message: /style=\{\{ color: "var\(--yl-color-text\)" \}\}.*--yl-color-text-muted/ }] },
    { code: `<p className="hover:text-red-600" />`, errors: [{ message: /color: "var\(--yl-color-danger\)"/ }] },
    { code: `<div className="w-[400px]" />`, errors: [{ message: /w-96/ }] },
    { code: `<div className="bg-[#f5f5f5]" />`, errors: [{ message: /backgroundColor: "var\(--yl-color-bg\)"/ }] },
    { code: `<p className="[color:#666]" />`, errors: [{ message: /style=\{\{ color: "var\(--yl-color-text\)" \}\}.*\[color:var\(--yl-color-text\)\]/ }] },
    { code: `<p style={{ color: "#6b7280" }} />`, errors: [{ message: /color: "var\(--yl-color-text\)"/ }] },
    // On a component, the fix is the variant, not style.
    {
      code: `<Button className="bg-red-500">削除</Button>`,
      errors: [{ message: /<Button> の見た目はパックとバリアントが決めます。色は variant（primary \| secondary \| ghost \| danger）で選び/ }],
    },
    { code: `<Badge className="bg-[var(--yl-color-ok)]">完了</Badge>`, errors: [{ message: /色は tone（/ }] },
    { code: `<Card className="bg-gray-50">…</Card>`, errors: [{ message: /^(?!.*variant).*<Card> の色はパックが決めます/ }] },
    // className built from arrays and template literals.
    {
      code: `<div className={["rounded-lg p-4", isSelected ? "border-[var(--yl-color-action)]" : "border-gray-200"].join(" ")} />`,
      errors: [{ messageId: "arbitraryToken" }, { messageId: "palette" }],
    },
    { code: `<div className={["p-4", isOpen && "bg-slate-100"].filter(Boolean).join(" ")} />`, errors: [{ messageId: "palette" }] },
    { code: `<div className={\`p-4 \${isOpen ? "text-red-600" : ""}\`} />`, errors: [{ messageId: "palette" }] },
    // Blue and purple are emphasis: accent (selection, in progress) first, then action (the primary action).
    {
      code: `<div className="border-purple-600" />`,
      errors: [{ message: /borderColor: "var\(--yl-color-accent\)".*候補: --yl-color-accent・--yl-color-action・--yl-color-border・.*飾りには使いません.*主な操作の色なら --yl-color-action/ }],
    },
    { code: `<p className="text-blue-600" />`, errors: [{ message: /color: "var\(--yl-color-accent\)"/ }] },
    // A light tint behind content is a surface: the hue's tokens come after the surfaces.
    { code: `<div className="bg-purple-50" />`, errors: [{ message: /backgroundColor: "var\(--yl-color-bg\)".*候補: --yl-color-bg・--yl-color-surface・--yl-color-secondary・--yl-color-accent・--yl-color-action/ }] },
    { code: `<div className="bg-red-50" />`, errors: [{ message: /backgroundColor: "var\(--yl-color-bg\)".*--yl-color-danger/ }] },
    { code: `<div className="bg-red-600" />`, errors: [{ message: /backgroundColor: "var\(--yl-color-danger\)"/ }] },
    // A class list outside className: a function or variable that holds the classes.
    {
      code: `function changeClass(n) { return n > 0 ? "bg-green-100 text-green-700" : "text-gray-600"; }`,
      errors: [
        { message: /^パレットの色（bg-green-100）.*backgroundColor: "var\(--yl-color-bg\)"/ },
        { message: /^パレットの色（text-green-700）.*color: "var\(--yl-color-ok\)"/ },
        { message: /^パレットの色（text-gray-600）/ },
      ],
    },
    { code: `const cls = \`px-2 \${active ? "bg-blue-600" : ""} text-white\`;`, errors: [{ message: /--yl-color-accent/ }, { message: /^パレットの色（text-white）/ }] },
    { code: `const TONES = { up: "p-[13px]", "bg-slate-100": true };`, errors: [{ messageId: "arbitrary" }, { messageId: "palette" }] },
    // When the file passes it to the className of a part, the fix is the part's variant.
    {
      code: `function changeClassName(n) { return n > 0 ? "bg-green-100" : "bg-red-100"; } const x = <Badge className={changeClassName(n)}>+3%</Badge>;`,
      errors: [
        { message: /^パレットの色（bg-green-100）は使えません。changeClassName は <Badge> の className に使われています。<Badge> の見た目はパックとバリアントが決めます。色は tone（neutral \| accent \| ok \| danger）で選び/ },
        { message: /changeClassName は <Badge>/ },
      ],
    },
    {
      code: `function Change({ up }) { const colorClass = up ? "text-green-700" : "text-red-700"; return <Badge className={cn("gap-1", colorClass)}>x</Badge>; }`,
      errors: [{ message: /colorClass は <Badge> の className に使われています。.*tone/ }, { message: /colorClass は <Badge>/ }],
    },
    // On the app's own element, the fix stays the token.
    { code: `const tone = "text-green-700"; const x = <span className={tone}>+3%</span>;`, errors: [{ message: /color: "var\(--yl-color-ok\)"/ }] },
  ],
});

tester.run("valid-idref", rules["valid-idref"], {
  valid: [
    `<><Dialog.Trigger dialog="confirm">削除</Dialog.Trigger><Dialog id="confirm" title="t" /></>`,
    `<><Popover.Trigger popover="f">フィルタ</Popover.Trigger><Popover id="f" title="t" /></>`,
    `<><Button command="show-modal" commandfor="x">開く</Button><dialog id="x" /></>`,
    `<Dialog.Trigger dialog={id}>削除</Dialog.Trigger>`,
    `<><Menu.Trigger menu="m">操作</Menu.Trigger><Menu id="m" label="操作" /></>`,
    `<><Tooltip.Trigger tooltip="t">保存</Tooltip.Trigger><Tooltip id="t">⌘S</Tooltip></>`,
  ],
  invalid: [
    { code: `<Dialog.Trigger dialog="confrim">削除</Dialog.Trigger>`, errors: [{ messageId: "missing" }] },
    {
      code: `<><Dialog.Trigger dialog="f">開く</Dialog.Trigger><Popover id="f" title="t" /></>`,
      errors: [{ messageId: "wrongKind" }],
    },
    { code: `<Button command="show-modal">開く</Button>`, errors: [{ messageId: "commandWithoutTarget" }] },
    { code: `<><Button commandfor="x">開く</Button><dialog id="x" /></>`, errors: [{ messageId: "targetWithoutCommand" }] },
    {
      code: `<><Menu.Trigger menu="actions">操作</Menu.Trigger><Popover id="actions" title="t" /></>`,
      errors: [{ messageId: "wrongKind" }],
    },
    { code: `<Tooltip.Trigger tooltip="tip">保存</Tooltip.Trigger>`, errors: [{ messageId: "missing" }] },
  ],
});

tester.run("required-props", rules["required-props"], {
  valid: [
    `<Dialog id="d" title="削除しますか？" />`,
    `<Dialog {...props} />`,
    `<Field id="e" label="メール"><Input /></Field>`,
    `<RadioGroup name="v" legend="公開範囲" />`,
  ],
  invalid: [
    { code: `<Dialog id="d" />`, errors: [{ messageId: "missing" }] },
    { code: `<Dialog.Trigger>開く</Dialog.Trigger>`, errors: [{ messageId: "missing" }] },
    { code: `<Field id="e"><Input /></Field>`, errors: [{ messageId: "missing" }] },
    { code: `<Menu id="m" />`, errors: [{ messageId: "missing" }] },
    { code: `<RadioGroup name="v" />`, errors: [{ messageId: "missing" }] },
  ],
});

tester.run("accessible-name", rules["accessible-name"], {
  valid: [
    `<Popover id="p" title="フィルタ" />`,
    `<Popover id="p" aria-label="フィルタ" />`,
    `<Button aria-label="閉じる"><XIcon /></Button>`,
    `<Button><XIcon /> 閉じる</Button>`,
    `<Button>{label}</Button>`,
  ],
  invalid: [
    { code: `<Popover id="p" />`, errors: [{ messageId: "popover" }] },
    { code: `<Button><XIcon /></Button>`, errors: [{ messageId: "iconOnly" }] },
    { code: `<Popover.Close popover="p"><svg /></Popover.Close>`, errors: [{ messageId: "iconOnly" }] },
    { code: `<Tooltip.Trigger tooltip="t"><CopyIcon /></Tooltip.Trigger>`, errors: [{ messageId: "iconOnly" }] },
    { code: `<Menu.Trigger menu="m"><MoreIcon /></Menu.Trigger>`, errors: [{ messageId: "iconOnly" }] },
  ],
});

tester.run("tabs-match", rules["tabs-match"], {
  valid: [
    `<Tabs id="t" label="表示" defaultValue="a"><Tabs.List><Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab></Tabs.List><Tabs.Panel value="a" /><Tabs.Panel value="b" /></Tabs>`,
    // Values built at runtime cannot be checked statically.
    `<Tabs id="t" label="表示" defaultValue="a"><Tabs.List>{items.map((i) => <Tabs.Tab value={i}>{i}</Tabs.Tab>)}</Tabs.List></Tabs>`,
  ],
  invalid: [
    {
      code: `<Tabs id="t" label="表示" defaultValue="a"><Tabs.List><Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab></Tabs.List><Tabs.Panel value="a" /></Tabs>`,
      errors: [{ messageId: "noPanel" }],
    },
    {
      code: `<Tabs id="t" label="表示" defaultValue="overview"><Tabs.List><Tabs.Tab value="summary">概要</Tabs.Tab></Tabs.List><Tabs.Panel value="summary" /><Tabs.Panel value="extra" /></Tabs>`,
      errors: [{ messageId: "badDefault" }, { messageId: "noTab" }],
    },
  ],
});

tester.run("prefer-native", rules["prefer-native"], {
  valid: [`<div role="button" onClick={f} />`, `<Button onClick={f}>保存</Button>`],
  invalid: [{ code: `<div onClick={f}>保存</div>`, errors: [{ messageId: "clickable" }] }],
});

tester.run("valid-token", rules["valid-token"], {
  valid: [
    `<p style={{ color: "var(--yl-color-text-muted)" }} />`,
    `<p style={{ color: \`var(--yl-color-\${tone})\` }} />`,
    `<p style={{ color: "var(--yl-color-" + tone + ")" }} />`,
    `<div className="gap-(--yl-space-3)" />`,
    // Defining a custom property or naming an anchor does not read a token.
    `<style>{\`.row { anchor-name: --yl-selected-row; --yl-local: 4px; }\`}</style>`,
    // A stylesheet outside JSX may define its own custom properties (scripts/design-system.tsx).
    `const css = \`.ink { fill: var(--yl-brand-graphite); }\`;`,
  ],
  invalid: [
    { code: `<p style={{ color: "var(--yl-color-brand)" }} />`, errors: [{ message: /--yl-color-brand というトークンはありません。--yl-color-action・--yl-color-accent のことですか。.*text-muted/ }] },
    { code: `<div style={{ background: "var(--yl-color-surface-muted)" }} />`, errors: [{ message: /--yl-color-surface・/ }] },
    { code: `<div className="text-[var(--yl-color-on-accent)]" />`, errors: [{ message: /--yl-color-on-action/ }] },
    { code: `<div className="bg-(--yl-color-card)" />`, errors: [{ message: /--yl-color-surface のことですか/ }] },
    { code: `<div style={{ padding: "var(--yl-spacing-4)" }} />`, errors: [{ message: /--yl-space-4 のことですか/ }] },
    { code: `<p style={{ color: \`var(--yl-colour-\${tone})\` }} />`, errors: [{ messageId: "unknownPrefix" }] },
    { code: `<style>{\`.price { color: var(--yl-color-primary); }\`}</style>`, errors: [{ message: /--yl-color-action のことですか/ }] },
    // A single CSS value is checked outside JSX too.
    { code: `function tone(change) { return change > 0 ? "var(--yl-color-success)" : "var(--yl-color-danger)"; }`, errors: [{ message: /--yl-color-ok のことですか/ }] },
    { code: `const box = { borderColor: \`var(--yl-color-brand)\` };`, errors: [{ messageId: "unknown" }] },
  ],
});

tester.run("valid-import", rules["valid-import"], {
  valid: [
    `import { Button, Dialog, Tabs } from "@yourlib/react";`,
    `import { YourlibRuntime } from "@yourlib/react/runtime";`,
    `import { Dialog } from "@yourlib/react/dialog";`,
    `import "@yourlib/react/styles.css";`,
    `import * as yl from "@yourlib/react";`,
    `import { TabsTrigger } from "@radix-ui/react-tabs";`,
    `import { Tabs } from "@yourlib/react"; const x = <Tabs.Tab value="a">A</Tabs.Tab>;`,
  ],
  invalid: [
    { code: `import { TabsTrigger } from "@yourlib/react";`, errors: [{ message: /TabsTrigger は "@yourlib\/react" にありません。<Tabs\.Tab value="…"> を使ってください。import するのは Tabs です。/ }] },
    { code: `import { TabsContent } from "@yourlib/react";`, errors: [{ message: /<Tabs\.Panel value="…">/ }] },
    {
      code: `import { DialogContent, DialogFooter, DialogTitle } from "@yourlib/react";`,
      errors: [{ message: /<Dialog id="…" title="…"> そのものが入れ物です/ }, { message: /<Dialog\.Actions>/ }, { message: /<Dialog id="…" title="…"> の title/ }],
    },
    // Suggestions carry the props the part requires, so the fix does not trade this error for required-props.
    { code: `import { DropdownMenuTrigger } from "@yourlib/react";`, errors: [{ message: /<Menu\.Trigger menu="…"> を使ってください。/ }] },
    { code: `import { TextField } from "@yourlib/react";`, errors: [{ message: /<Field id="…" label="…"> の中に <Input>/ }] },
    { code: `import { Radio } from "@yourlib/react";`, errors: [{ message: /<RadioGroup name="…" legend="…"> の中に <RadioGroup\.Item value="…">/ }] },
    { code: `import { Modal } from "@yourlib/react";`, errors: [{ message: /<Dialog id="…" title="…"> を使ってください。開くボタンは <Dialog\.Trigger dialog="…">/ }] },
    { code: `import { MenuSub } from "@yourlib/react";`, errors: [{ message: /<Menu id="…" label="…">・<Menu\.Trigger menu="…">・<Menu\.Item>・<Menu\.Link href="…">・<Menu\.Separator>/ }] },
    { code: `import { CardHeader, CardFooter } from "@yourlib/react";`, errors: [{ message: /<Card title="…">/ }, { message: /<Card footer=\{…\}>/ }] },
    { code: `import { AccordionTrigger } from "@yourlib/react";`, errors: [{ message: /<Accordion\.Item title="…">/ }] },
    { code: `import { DropdownMenuItem } from "@yourlib/react";`, errors: [{ message: /<Menu\.Item>.*import するのは Menu です/ }] },
    { code: `import { SelectItem } from "@yourlib/react";`, errors: [{ message: /<option>/ }] },
    { code: `import { TextArea } from "@yourlib/react";`, errors: [{ message: /Textarea のことですか/ }] },
    { code: `import { TextField, Stack } from "@yourlib/react";`, errors: [{ message: /<Field id="…" label="…"> の中に <Input>/ }, { message: /HTML の要素/ }] },
    { code: `import { YourlibRuntime } from "@yourlib/react";`, errors: [{ message: /"@yourlib\/react\/runtime" から import/ }] },
    { code: `import { Avatar } from "@yourlib/react";`, errors: [{ message: /部品は Accordion・Badge・Button/ }] },
    { code: `import { Tab, TabList, TabPanel } from "@yourlib/react";`, errors: [{ message: /<Tabs\.Tab value="…">/ }, { message: /<Tabs\.List>/ }, { message: /<Tabs\.Panel value="…">/ }] },
    { code: `import { Tabs } from "@yourlib/react"; const x = <Tabs.Trigger value="a">A</Tabs.Trigger>;`, errors: [{ message: /<Tabs\.Trigger> はありません。<Tabs\.Tab value="…"> を使ってください。/ }] },
    { code: `import { Dialog as D } from "@yourlib/react"; const x = <D.Content />;`, errors: [{ message: /<D\.Content> はありません。<Dialog id="…" title="…"> そのものが入れ物です/ }] },
    // When one part replaces the element, the props written on it are checked as that part, in the same report.
    {
      code: `import { DropdownMenuItem } from "@yourlib/react"; const x = <><DropdownMenuItem onSelect={edit}>編集</DropdownMenuItem><DropdownMenuItem onSelect={remove}>削除</DropdownMenuItem></>;`,
      errors: [
        {
          message:
            /^(?!.*onSelect は使えません.*onSelect は使えません)DropdownMenuItem は "@yourlib\/react" にありません。<Menu\.Item> を使ってください。import するのは Menu です。<DropdownMenuItem> に書いた props も直してください。<Menu\.Item> の onSelect は使えません。.*押したときの処理は onClick に書きます。$/,
        },
      ],
    },
    { code: `import { DropdownMenuItem } from "@yourlib/react"; const x = <DropdownMenuItem variant="destructive" onClick={f}>削除</DropdownMenuItem>;`, errors: [{ message: /<Menu\.Item> の variant に "destructive" はありません。.*variant="danger" のことですか。$/ }] },
    { code: `import { DropdownMenuItem } from "@yourlib/react"; const x = <DropdownMenuItem onClick={f}>編集</DropdownMenuItem>;`, errors: [{ message: /import するのは Menu です。$/ }] },
    { code: `import { DropdownMenuTrigger } from "@yourlib/react"; const x = <DropdownMenuTrigger asChild><Button>…</Button></DropdownMenuTrigger>;`, errors: [{ message: /<Menu\.Trigger> に asChild という props はありません。asChild はありません。<Menu\.Trigger> はそれ自体が <button> を描きます。/ }] },
    { code: `import { DropdownMenu as Root } from "@yourlib/react"; const x = <Root open={open} onOpenChange={setOpen} />;`, errors: [{ message: /<Root> に書いた props も直してください。<Menu> に open という props はありません。開閉は <Menu\.Trigger menu="…">.*<Menu> に onOpenChange/ }] },
    { code: `import { PopoverContent } from "@yourlib/react"; const x = <PopoverContent align="end" sideOffset={4} />;`, errors: [{ message: /そのものが入れ物です。.*<Popover> に sideOffset という props はありません。トリガーとの間隔はパックが決めます。$/ }] },
    { code: `import { Loader } from "@yourlib/react"; const x = <Loader>読み込み中</Loader>;`, errors: [{ message: /<Spinner> は子要素を取りません。読み上げる文は label で指定します/ }] },
    { code: `import { Tabs } from "@yourlib/react"; const x = <Tabs.Trigger value="a" asChild>A</Tabs.Trigger>;`, errors: [{ message: /<Tabs\.Tab value="…"> を使ってください。<Tabs\.Trigger> に書いた props も直してください。<Tabs\.Tab> に asChild/ }] },
    // When the props split between parts (TextField → Field and Input), they are left to valid-props after the fix.
    { code: `import { TextField } from "@yourlib/react"; const x = <TextField label="メール" helperText="…" />;`, errors: [{ message: /^(?!.*に書いた props).*<Input>/ }] },
    { code: `import yourlib from "@yourlib/react";`, errors: [{ messageId: "noDefault" }] },
    { code: `import { Button } from "@yourlib/react/components/button";`, errors: [{ messageId: "unknownPath" }] },
  ],
});

tsTester.run("valid-import (TypeScript)", rules["valid-import"], {
  valid: [`import { Button, type ButtonProps } from "@yourlib/react";`, `import type { DialogProps } from "@yourlib/react";`],
  invalid: [{ code: `import type { DialogContentProps } from "@yourlib/react";`, errors: [{ messageId: "unknownName" }] }],
});

tester.run("valid-props", rules["valid-props"], {
  valid: [
    // Contract props, the HTML attributes of the element the props go to, key and ref.
    `<Button variant="danger" type="submit" disabled onClick={f} key="a" ref={r}>削除</Button>`,
    `<Switch name="notify" checked={on} onChange={(e) => setOn(e.currentTarget.checked)}>メール通知</Switch>`,
    `<Dialog id="d" title="t" dismissible="any" onClose={f} />`,
    `<Popover id="p" title="t" side="bottom" align="start" onToggle={f} />`,
    `<Accordion.Item title="t" defaultOpen name="faq" onToggle={f} />`,
    `<Link href="/x" target="_blank" external>x</Link>`,
    `<Toaster position="bottom-end" />`,
    `<Card headingLevel="h3" padding="lg" />`,
    // aria-* and data-* are not checked, as in TypeScript.
    `<Badge data-state="x" aria-hidden="true" tone="ok">完了</Badge>`,
    // Values that are not static are left to the type checker.
    `<Button variant={variant} size={big ? "lg" : "md"}>保存</Button>`,
    // Another package's component with the same name, and the file's own component.
    `import { Dialog } from "@radix-ui/react-dialog"; const x = <Dialog open onOpenChange={f} />;`,
    `function Card({ elevated }) { return <div />; } const x = <Card elevated />;`,
    // A component installed by `yourlib add` is checked like the one it re-exports.
    `import { Button } from "@/components/ui/button"; const x = <Button variant="primary">保存</Button>;`,
    `import { Card } from "./app-card"; const x = <Card elevated />;`,
  ],
  invalid: [
    // Props no part has, with the yourlib way to write them.
    {
      code: `<Dialog id="d" title="t" open={open} onOpenChange={setOpen} />`,
      errors: [
        { message: /<Dialog> に open という props はありません。開閉は <Dialog\.Trigger dialog="…"> と <Dialog\.Close dialog="…"> がブラウザの機能でします。.*onClose/ },
        { messageId: "unknownProp" },
      ],
    },
    { code: `<Popover id="p" title="t" onOpenChange={f} />`, errors: [{ message: /<Popover\.Trigger popover="…">.*onToggle/ }] },
    { code: `<Checkbox onCheckedChange={setChecked}>同意する</Checkbox>`, errors: [{ message: /onChange で受け取り、event\.currentTarget\.checked/ }] },
    { code: `<Select onValueChange={setValue} />`, errors: [{ message: /<select> と同じく onChange で受け取り、event\.currentTarget\.value/ }] },
    { code: `<RadioGroup name="p" legend="プラン" value={plan} onValueChange={setPlan} />`, errors: [{ message: /defaultValue/ }, { message: /onChange/ }] },
    { code: `<Tabs id="t" label="表示" defaultValue="a" onValueChange={f} />`, errors: [{ message: /yl-tabs-change/ }] },
    {
      code: `<Accordion type="single" collapsible><Accordion.Item value="a" title="t" /></Accordion>`,
      errors: [{ message: /<Accordion name="…">/ }, { message: /collapsible は要りません/ }, { message: /defaultOpen/ }],
    },
    { code: `<Tabs id="t" label="表示" defaultValue="a" items={items} />`, errors: [{ message: /<Tabs\.List> の中に <Tabs\.Tab value="…">/ }] },
    { code: `<Select options={options} />`, errors: [{ message: /<option value="…">/ }] },
    { code: `<Dialog.Trigger dialog="d" asChild><Button>開く</Button></Dialog.Trigger>`, errors: [{ message: /asChild はありません。<Dialog\.Trigger> はそれ自体が <button> を描きます。/ }] },
    { code: `<Switch label="通知" />`, errors: [{ message: /ラベルは子要素に書きます（<Switch>…<\/Switch>）/ }] },
    { code: `<Textarea label="本文" error={error} />`, errors: [{ message: /<Field id="…" label="…">/ }, { message: /<Field id="…" label="…" error="…">/ }] },
    { code: `<Badge variant="secondary">下書き</Badge>`, errors: [{ message: /色や見た目は tone（neutral \| accent \| ok \| danger）で選びます。/ }] },
    { code: `<Card variant="outline" />`, errors: [{ message: /^(?!.*tone)<Card> に variant という props はありません。<Card> の見た目はパックが決めます。<Card> にある props は title・/ }] },
    { code: `<Button radius="full">保存</Button>`, errors: [{ message: /角の丸みはパックが決めます/ }] },
    { code: `<Popover id="p" title="t" placement="bottom-start" />`, errors: [{ message: /side（top \| bottom \| start \| end）と align（start \| center \| end）で選びます/ }] },
    { code: `<Menu.Trigger target="actions">操作</Menu.Trigger>`, errors: [{ message: /開くメニューの id は menu で指定します（<Menu\.Trigger menu="…">）/ }] },
    { code: `<Dialog.Close dialogId="d">閉じる</Dialog.Close>`, errors: [{ message: /id は dialog で指定します/ }] },
    { code: `<Button isLoading>保存</Button>`, errors: [{ message: /loading と書きます/ }] },
    { code: `<Button classname="mt-2">保存</Button>`, errors: [{ message: /className と書きます（大文字と小文字が違います）/ }] },
    { code: `<Dialog id="d" title="t" dismissable="any" />`, errors: [{ message: /dismissible のことですか/ }] },
    { code: `<Spinner elevated />`, errors: [{ message: /<Spinner> にある props は label・size（sm \| md \| lg）です（ほかは HTML の属性）。/ }] },
    // Aliases and namespace imports resolve to the part.
    { code: `import { Dialog as D } from "@yourlib/react"; const x = <D.Trigger dialogId="d">開く</D.Trigger>;`, errors: [{ message: /<D\.Trigger> に dialogId/ }] },
    { code: `import * as yl from "@yourlib/react"; const x = <yl.Switch label="通知" />;`, errors: [{ messageId: "unknownProp" }] },
    { code: `import { Switch } from "@/components/ui/switch"; const x = <Switch label="通知" />;`, errors: [{ messageId: "unknownProp" }] },
    // Values the contract does not list, with the closest one.
    { code: `<Toaster position="bottom-right" />`, errors: [{ message: /<Toaster> の position に "bottom-right" はありません。position は "bottom-end" \| "bottom-center" \| "top-end" のどれかです。position="bottom-end" のことですか。/ }] },
    { code: `<Button variant="destructive">削除</Button>`, errors: [{ message: /variant="danger" のことですか/ }] },
    { code: `<Button variant="outline">キャンセル</Button>`, errors: [{ message: /variant="secondary" のことですか/ }] },
    { code: `<Badge tone="success">完了</Badge>`, errors: [{ message: /tone="ok" のことですか/ }] },
    { code: `<Button size={isWide ? "large" : "md"}>保存</Button>`, errors: [{ message: /size="lg" のことですか/ }] },
    { code: `<Card headingLevel={2} />`, errors: [{ message: /headingLevel に \{2\} はありません。.*headingLevel="h2" のことですか/ }] },
    { code: `<Dialog id="d" title="t" dismissible={false} />`, errors: [{ message: /dismissible="none" のことですか/ }] },
    { code: `<Menu id="m" label="操作" side="right" />`, errors: [{ message: /side="end" のことですか/ }] },
    // Accepted by the type, but does something else than in Radix.
    { code: `<Menu.Item onSelect={archive}>アーカイブ</Menu.Item>`, errors: [{ message: /<Menu\.Item> の onSelect は使えません。.*onClick/ }] },
    { code: `<Accordion defaultValue="a" />`, errors: [{ message: /<Accordion\.Item defaultOpen>/ }] },
    // Parts whose type takes no children.
    { code: `<Spinner>読み込み中</Spinner>`, errors: [{ message: /<Spinner> は子要素を取りません。読み上げる文は label で指定します/ }] },
  ],
});

---
name: urushi
description: Rules for building UI with urushi components. Use whenever you write or edit JSX that uses urushi components, packs or tokens.
---

# Building UI with urushi

urushi components are native HTML elements with a contract. Follow the contract; the lint plugin enforces it.

## Generate, verify, repair

1. Read `urushi context <component...>` before writing JSX. It returns the exact contracts together with the design rules and valid tokens. Use `urushi describe <component>` when you only need the API contract.
2. After editing, run `urushi check --project <tsconfig.json> --strict --json`. This is offline and read-only; it checks TypeScript and the contract rules without executing the application's ESLint configuration.
3. For each issue, use its file/line/column, message and related contracts to repair the source. Do not silence rules with eslint-disable or weaken the project's TypeScript settings to obtain a pass.
4. Re-run the same check. Exit code 1 means diagnostics remain; exit code 0 means this static gate passed. A pass does not verify layout, browser interactions, dynamic values, cross-file ID references or screen readers: test those separately.
5. Before updating installed components, run `urushi update --dry-run --json`. After updating, resolve conflicts, run `urushi diff`, then repeat the static and browser checks.

## Ground rules

1. Visuals come from the active pack (`data-pack` on <html> or any section). Never restyle a component with className or style.
   className on a component may only adjust the categories its contract lists (margin, width, layout, position).
2. Need a different look? Use a variant prop. If none fits, stop and ask: a new variant is added to the contract and to every pack, never inlined.
3. Colors in your own markup come from the pack's tokens (see Tokens below; no other `--ur-*` name exists).
   Write them in your own CSS (`color: var(--ur-color-text-muted)`) or in `style` on your own elements (`style={{ color: "var(--ur-color-text-muted)" }}`).
   Never inside Tailwind arbitrary values (`text-[var(--ur-color-text-muted)]`, `bg-(--ur-color-surface)`). No Tailwind palette colors (`bg-gray-100`) and no raw hex/oklch values.
   For spacing and sizes use Tailwind's scale (`p-4`, `gap-3`, `max-w-md`) or the `--ur-space-*` tokens, not arbitrary values (`p-[13px]`).
4. Prefer native behavior. Dialog.Trigger, Popover.Trigger, Menu.Trigger and Tooltip.Trigger wire the browser's own opening (command, popovertarget, interestfor); Accordion uses <details name>. No useState is needed to open or close anything.
5. Link elements by id, like HTML: every Trigger/Close references an existing id of the right kind (a Menu.Trigger points at a <Menu>, not a <Popover>).
6. Put one control inside each Field and let Field wire id, aria-describedby, aria-invalid and required. Do not set them on the control by hand.
7. In Tabs, every Tabs.Tab value has a Tabs.Panel with the same value, and defaultValue names one of the tabs.
8. Render <UrushiRuntime /> (from `@urushi/react/runtime`) and <Toaster /> once in the root layout. Call toast() only from client code (event handlers). Everything else renders in Server Components.
9. Before building a screen, decide which pack and density it uses, then compose components. Do not mix packs inside one control.

## Components

### Accordion — Collapsible sections built on native <details>/<summary>; a shared name makes them exclusive.

Use for: FAQs; Secondary settings that most people skip.
Not for: Switching between views of equal weight (use tabs).
- `<Accordion>`.
- `<Accordion.Item>` requires `title`.
- Titles are short and say what the section holds.

```tsx
<Accordion name="faq">
  <Accordion.Item title="料金はかかりますか？">無料で始められます。</Accordion.Item>
  <Accordion.Item title="解約はいつでもできますか？">はい、いつでもできます。</Accordion.Item>
</Accordion>
```

### AlertDialog — A modal confirmation (role=alertdialog) that only its buttons can close.

Use for: Confirming something that cannot be undone.
Not for: A form or a longer task (use dialog).
- `<AlertDialog>` requires `id`, `title`, `description`.
- `<AlertDialog.Trigger>` requires `alertDialog`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<AlertDialog.Cancel>` requires `alertDialog`.
- `<AlertDialog.Action>` requires `alertDialog`; variant: primary|secondary|ghost|danger.
- title and description are required.
- Focus starts on the safe choice.

```tsx
<AlertDialog.Trigger alertDialog="delete" variant="danger">削除</AlertDialog.Trigger>
<AlertDialog id="delete" title="削除しますか？" description="タスク 5 件が消えます。取り消せません。">
  <AlertDialog.Cancel alertDialog="delete">キャンセル</AlertDialog.Cancel>
  <AlertDialog.Action alertDialog="delete">削除する</AlertDialog.Action>
</AlertDialog>
```

### Alert — A callout in the page: a title, supporting text and an optional action, in a tone.

Use for: A notice that stays on the page (maintenance, a limit reached); The result of a page-level check.
Not for: Reporting the result of an action that just happened (use toast); An error on one input (use field).
- `<Alert>` requires `title`; tone: neutral|accent|ok|warning|danger.
- Never rely on tone alone; the title says what happened.
- Not a live region: for news that arrives later, use a toast.

```tsx
<Alert tone="accent" title="10 月 30 日 2:00〜4:00 にメンテナンスを行います">この間は申し込みを受け付けられません。</Alert>
```

### AspectRatio — A box that keeps a ratio (CSS aspect-ratio); its media fills it.

Use for: Thumbnails, video embeds, maps.
Not for: A square avatar (use avatar).
- `<AspectRatio>`.
- The media inside still needs its own alt text or title.

```tsx
<AspectRatio ratio="4 / 3"><img src="/photo.jpg" alt="会場の様子" /></AspectRatio>
```

### Avatar — A person's picture, or their initial when there is no picture or it fails to load.

Use for: Who wrote, owns or is assigned something.
Not for: A logo or an illustration (use img).
- `<Avatar>` requires `name`; status: online|away|busy|offline; size: sm|md|lg.
- name is required; the picture itself is decorative.

```tsx
<Avatar name="佐藤 美咲" src="/people/sato.jpg" />
```

### Badge — A short status or count label.

Use for: Status of an item (対応中, 完了); A count next to a label.
Not for: An action (use button).
- `<Badge>`; tone: neutral|accent|ok|danger.
- Never rely on tone alone; the text states the status.

```tsx
<Badge tone="danger" dot>期限切れ</Badge>
```

### Breadcrumb — Where the page sits in the site: a nav with an ordered list of links.

Use for: Pages more than two levels deep.
Not for: Steps of a process (use steps).
- `<Breadcrumb>`.
- `<Breadcrumb.Item>`.
- The last item is the current page.
- Separators are drawn by CSS and not read.

```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/">ホーム</Breadcrumb.Item>
  <Breadcrumb.Item href="/settings">設定</Breadcrumb.Item>
  <Breadcrumb.Item current>通知</Breadcrumb.Item>
</Breadcrumb>
```

### ButtonGroup — Buttons that belong together, joined into one shape (role=group).

Use for: Related actions on one object; A split between an action and its menu.
Not for: Choosing one of several options (use toggle-group).
- `<ButtonGroup>` requires `label`; orientation: horizontal|vertical.
- label is required: a group needs a name.

```tsx
<ButtonGroup label="リンク"><Button>コピー</Button><Button>共有</Button></ButtonGroup>
```

### Button — A native <button> that runs or confirms an action.

Use for: Submitting a form; Confirming a dialog; Opening a dialog or popover through `command`.
Not for: Navigating to another page (use link); Toggling a setting on and off (use switch).
- `<Button>`; variant: primary|secondary|ghost|danger; size: sm|md|lg; command: show-modal|close|request-close|toggle-popover|show-popover|hide-popover.
- An icon-only button needs aria-label.
- Use at most one primary button per view.
- Loading buttons stay focusable (aria-disabled), they are never natively disabled.

```tsx
<Button variant="primary" type="submit">Save</Button>
```

### Calendar — A month of days to pick a date from, always on the page (a booking or schedule view). DatePicker uses the same calendar in its dialog.

Use for: Choosing a date while the month stays in view (予約日・配達日を選ぶ).
Not for: A date field in a form (use date-picker); A date the user already knows and types (use date-input).
- `<Calendar>` requires `label`.
- Give a label that says what the date is for.
- Show the chosen date in words next to the calendar as well; a highlighted day alone is easy to miss.

```tsx
<Calendar label="配達日" defaultValue="2026-11-12" min="2026-11-05" locale="ja" />
```

### Card — A surface that groups related content, with an optional title, description and footer.

Use for: A self-contained group of content or settings.
Not for: Wrapping every block on a page (use spacing instead) (use separator).
- `<Card>`; headingLevel: h2|h3|h4; padding: sm|md|lg.
- Pick headingLevel so headings stay in order on the page.

```tsx
<Card title="通知" description="受け取る通知を選びます。" footer={<Button>保存</Button>}>…</Card>
```

### Carousel — Slides in a horizontal scroll-snap strip; where CSS ::scroll-button and ::scroll-marker exist, the browser adds the buttons and dots.

Use for: A set of images or cards of equal weight that do not all fit.
Not for: Content most people must see (use a list or grid).
- `<Carousel>` requires `label`.
- `<Carousel.Item>`.
- Slides never move by themselves.
- The optional runtime adds controls and a current position in every supported browser; reduced motion uses immediate scrolling.

```tsx
<Carousel label="会場の写真">
  <Carousel.Item><img src="/1.jpg" alt="受付" /></Carousel.Item>
  <Carousel.Item><img src="/2.jpg" alt="講演" /></Carousel.Item>
</Carousel>
```

### Checkbox — A native checkbox with its own label.

Use for: Choosing any number of options; Confirming a single statement (agree to terms).
Not for: A setting that applies immediately (use switch); Exactly one of several options (use radio-group).
- `<Checkbox>`.
- children is the label; never leave it empty.

```tsx
<Checkbox name="terms" required>利用規約に同意します</Checkbox>
```

### Collapsible — One section that opens and closes: a native <details>.

Use for: Advanced options under a form; Details most people skip.
Not for: Several sections in a row (use accordion).
- `<Collapsible>` requires `title`.
- The title says what is inside.

```tsx
<Collapsible title="詳細な設定">…</Collapsible>
```

### Combobox — 検索して候補を絞り込み、1つの値を選択します。

Use for: 検索して候補を絞り込み、1つの値を選択します。.
Not for: 検索や複雑な操作が不要な場合 (use select).
- `<Combobox>` requires `label`, `options`; filter: local|manual.
- 用途が伝わるlabelを指定します。
- 候補・項目・行には重複しない固定のIDを指定します。
- 組み合わせた画面を、対象の支援技術で確認してください。

```tsx
<Combobox label="担当者" options={[{ value: "mika", label: "Mika Sato" }, { value: "kai", label: "Kai Ito" }]} />
```

### Command — コマンドを検索し、キーボードで実行するダイアログです。

Use for: コマンドを検索し、キーボードで実行するダイアログです。.
Not for: 検索や複雑な操作が不要な場合 (use menu).
- `<Command>` requires `label`, `open`, `onOpenChange`, `items`.
- 用途が伝わるlabelを指定します。
- 候補・項目・行には重複しない固定のIDを指定します。
- 組み合わせた画面を、対象の支援技術で確認してください。

```tsx
<Command label="コマンド" open={open} onOpenChange={setOpen} items={[{id:"new",label:"作成",onSelect: createProject}]} />
```

### ContextMenu — A menu of actions that opens where the user right-clicks an area, long-presses it on touch, or presses Shift+F10 inside it. Its items are Menu's (Menu.Item, Menu.Separator, Menu.Sub) and behave the same way.

Use for: Shortcuts for actions on an item in a list, a file or a canvas (名前を変更・複製・削除).
Not for: The only way to reach an action (use menu); Actions on a button the user clicks (use menu).
- `<ContextMenu>` requires `id`, `label`.
- `<ContextMenu.Area>` requires `menu`.
- A context menu is hidden: every action in it must also be reachable another way (a Menu.Trigger, a button or a shortcut).
- Items are verbs (名前を変更, 複製, 削除).
- Put destructive items last, after a Menu.Separator.

```tsx
<ContextMenu.Area menu="file-actions">
  <ul>…</ul>
</ContextMenu.Area>
<ContextMenu id="file-actions" label="ファイルの操作">
  <Menu.Item shortcut="F2">名前を変更</Menu.Item>
  <Menu.Item>複製</Menu.Item>
  <Menu.Separator />
  <Menu.Item variant="danger">削除</Menu.Item>
</ContextMenu>
```

### DataTable — 並び替え、ページ送り、行の選択に対応したテーブルです。

Use for: 並び替え、ページ送り、行の選択に対応したテーブルです。.
Not for: 検索や複雑な操作が不要な場合 (use table).
- `<DataTable>` requires `label`, `rows`, `columns`, `getRowId`.
- 用途が伝わるlabelを指定します。
- 候補・項目・行には重複しない固定のIDを指定します。
- 組み合わせた画面を、対象の支援技術で確認してください。

```tsx
<DataTable label="プロジェクト" rows={[{id:"1",name:"Website"}]} getRowId={row => row.id} columns={[{id:"name",header:"名前",cell: row => row.name,sortValue: row => row.name}]} />
```

### DateInput — A native date or time input with the browser's own picker, drawn like Input.

Use for: A date, time or month where typing or the system picker is enough.
Not for: Picking from a visible calendar on the page (use a date picker (planned)).
- `<DateInput>`; type: date|time|datetime-local|month; size: sm|md|lg.
- Label it with a Field; min and max are announced by the browser.

```tsx
<Field id="due" label="期限"><DateInput min="2026-10-01" /></Field>
```

### DatePicker — 日付を直接入力するか、カレンダーから選択します。

Use for: 日付を直接入力するか、カレンダーから選択します。.
Not for: 検索や複雑な操作が不要な場合 (use date-input).
- `<DatePicker>` requires `label`.
- 用途が伝わるlabelを指定します。
- 候補・項目・行には重複しない固定のIDを指定します。
- 組み合わせた画面を、対象の支援技術で確認してください。

```tsx
<DatePicker label="期限" defaultValue="2026-10-30" locale="ja" />
```

### Dialog — A modal native <dialog> that interrupts the user for a confirmation or a short task.

Use for: Confirming a destructive action; A short form that must be finished before continuing.
Not for: Showing supplementary information next to a control (use popover); Reporting the result of an action (use toast).
- `<Dialog>` requires `id`, `title`; dismissible: any|closerequest|none; size: sm|md|lg.
- `<Dialog.Trigger>` requires `dialog`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Dialog.Close>` requires `dialog`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Dialog.Actions>`.
- Install UrushiRuntime to restore the clicked invoker after closing on Safari too; without it, pointer focus follows browser settings.
- For dynamically rendered React content, set initialFocus to an input or safe button id. React autoFocus can run before showModal(); initialFocus runs after the dialog opens. Set returnFocus to a stable trigger id when opening programmatically or unmounting the dialog.
- title is required; it becomes the accessible name through aria-labelledby.
- Every Dialog.Trigger and Dialog.Close must reference an existing Dialog id.
- Destructive confirmations should put focus on the safe action with autofocus.
- For client-side mutations, hold a ref<HTMLDialogElement> on Dialog. On success call ref.current?.close() before removing the trigger or changing state. Use Button for that action; Dialog.Close is suitable for Cancel.

```tsx
<Dialog.Trigger dialog="confirm-delete" variant="danger">Delete</Dialog.Trigger>
<Dialog id="confirm-delete" title="Delete this project?" description="This cannot be undone.">
  <Dialog.Actions>
    <Dialog.Close dialog="confirm-delete" autoFocus>Cancel</Dialog.Close>
    <Button variant="danger" type="submit" form="delete-form">Delete</Button>
  </Dialog.Actions>
</Dialog>
```

### Drawer — A modal <dialog> that slides up from the bottom with a handle, and closes when dragged down. A bottom Sheet for phones: the runtime adds the drag; without it, Escape, the backdrop and Drawer.Close still close it.

Use for: A short form or a choice on a phone; Details of a list row on small screens.
Not for: A panel beside a list on large screens (use sheet); A short confirmation (use alert-dialog).
- `<Drawer>` requires `id`, `title`; dismissible: any|closerequest|none.
- `<Drawer.Trigger>` requires `drawer`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Drawer.Close>` requires `drawer`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- title is required.
- The handle is decorative: give every drawer a visible way to close it (a Drawer.Close, or an action that closes it).
- Every trigger and close button references an existing Drawer id.

```tsx
<Drawer.Trigger drawer="add-event" variant="primary">予定を追加</Drawer.Trigger>
<Drawer id="add-event" title="予定を追加">
  <Field label="題名"><Input /></Field>
  <Drawer.Close drawer="add-event">やめる</Drawer.Close>
</Drawer>
```

### Empty — What a list or page shows when there is nothing in it yet, and how to start.

Use for: An empty list, no search results, a first-run screen.
Not for: An error (use alert).
- `<Empty>` requires `title`.
- The icon is decorative (aria-hidden); the title carries the meaning.

```tsx
<Empty title="まだタスクがありません" description="最初のタスクを追加しましょう。" action={<Button variant="primary">タスクを追加</Button>} />
```

### Field — Labels a single form control and links its description and error message to it.

Use for: Every text input, textarea and select in a form.
Not for: A checkbox or switch (they carry their own label) (use checkbox); A group of radio buttons (use radio-group).
- `<Field>` requires `id`, `label`.
- Every control has a visible label; hideLabel only when the context already labels it visually.
- Error messages say what is wrong and how to fix it.

```tsx
<Field id="email" label="メールアドレス" error="@ を含むアドレスを入力してください。" required>
  <Input type="email" name="email" />
</Field>
```

### FileInput — A native <input type="file">; the dropzone variant is a large target that files can be dropped on (no JavaScript).

Use for: Attaching files to a form.
Not for: Uploading in the background with progress (use your own uploader with Progress).
- `<FileInput>`; variant: default|dropzone.
- Label it with a Field; say the accepted types in its description.

```tsx
<Field id="files" label="添付ファイル"><FileInput variant="dropzone" multiple /></Field>
```

### HoverCard — A preview card for a link, shown on hover and keyboard focus (interestfor).

Use for: A person or page preview behind a link.
Not for: Information needed to act (use popover); A short label (use tooltip).
- `<HoverCard>` requires `id`; side: top|bottom|start|end; align: start|center|end.
- `<HoverCard.Trigger>` requires `hoverCard`, `href`.
- Everything in the card is also reachable through the link's page.

```tsx
<HoverCard.Trigger hoverCard="sato" href="/people/sato">佐藤 美咲</HoverCard.Trigger>
<HoverCard id="sato">…</HoverCard>
```

### InputGroup — An Input with fixed text or a button attached before or after it, drawn as one field.

Use for: A URL prefix (https://); A unit (円, %); A search field with its button.
Not for: Several inputs on one line (use a grid of Fields).
- `<InputGroup>`; size: sm|md|lg.
- `<InputGroup.Addon>`.
- Put the meaning in the Field label too: addon text is not part of the input's name.

```tsx
<Field id="site" label="サイトの URL">
  <InputGroup><InputGroup.Addon>https://</InputGroup.Addon><Input /></InputGroup>
</Field>
```

### Input — A native single-line <input> styled by the pack.

Use for: Short free text, email, numbers, dates, search.
Not for: Several lines of text (use textarea); Picking from a known list (use select).
- `<Input>`; size: sm|md|lg.
- Wrap in Field so it has a label.
- Use the right type and autocomplete for the data.

```tsx
<Field id="email" label="メールアドレス"><Input type="email" name="email" autoComplete="email" /></Field>
```

### Item — A row of a list: an icon, a title, a description and one action, like the rows of a settings screen. Item.Group is the list (a bordered panel with lines between the rows); a row with href is one link.

Use for: Settings screens; Lists of accounts, files or members with one action per row.
Not for: Rows compared by column (use table); Many rows to sort or filter (use data-table); Actions in a popup (use menu).
- `<Item>` requires `title`.
- `<Item.Group>`; variant: outline|plain.
- Put Item only inside Item.Group.
- A row with href has no action: a link cannot contain another control.
- A Switch in action needs its own aria-label (the row title is not its label).
- The icon is decorative (aria-hidden); the title carries the meaning.

```tsx
<Item.Group label="アカウント">
  <Item title="メールアドレス" description="hanako@example.jp" action={<Button size="sm" variant="secondary">変更</Button>} />
  <Item title="お知らせメール" description="締め切りの前日に送ります" action={<Switch aria-label="お知らせメール" defaultChecked />} />
  <Item title="パスワードと二段階認証" description="最後の変更は 3 か月前" href="/settings/security" />
</Item.Group>
```

### Kbd — A key or keyboard shortcut, in a native <kbd>.

Use for: Shortcuts in help text and tooltips.
Not for: Code (use code).
- `<Kbd>`.
- Write the key's name as text (⌘ is read as its name on most screen readers).

```tsx
<Kbd>⌘</Kbd><Kbd>K</Kbd>
```

### Link — A native <a> that navigates to another page or place.

Use for: Navigating to another page; Linking to an external site.
Not for: Running an action on the current page (use button).
- `<Link>` requires `href`; variant: inline|standalone.
- Link text names the destination; never 'here' or 'more'.
- External links announce that they open a new tab.

```tsx
<p>詳しくは<Link href="/docs">使い方ガイド</Link>をご覧ください。</p>
```

### Menu — A list of actions in a popover (menu button pattern), with optional submenus. Opens without JavaScript; the runtime adds arrow keys, typeahead and submenu hover.

Use for: Secondary actions on an item (編集・複製・削除).
Not for: Choosing a value (use select); Navigation (use link).
- `<Menu>` requires `id`, `label`; side: top|bottom|start|end; align: start|center|end.
- `<Menu.Trigger>` requires `menu`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Menu.Item>`; variant: default|danger.
- `<Menu.Link>` requires `href`.
- `<Menu.Separator>`.
- `<Menu.Sub>` requires `label`.
- Items are verbs (編集, 複製, 削除).
- Put destructive items last, after a Menu.Separator.
- Nest one level of Menu.Sub at most; deeper choices belong in a dialog.

```tsx
<Menu.Trigger menu="row-actions" variant="ghost" aria-label="操作">…</Menu.Trigger>
<Menu id="row-actions" label="タスクの操作">
  <Menu.Item>編集</Menu.Item>
  <Menu.Item>複製</Menu.Item>
  <Menu.Separator />
  <Menu.Item variant="danger">削除</Menu.Item>
</Menu>
```

### Menubar — A row of menus for an application (ファイル・編集・表示), like a desktop menu bar. Each Menubar.Menu is a trigger and its menu; the items are Menu's (Menu.Item, Menu.Separator, Menu.Sub). Opens without JavaScript; the runtime adds the menubar keyboard model and hover switching.

Use for: The command menus of an editor or a tool that works like a desktop application.
Not for: Site navigation (use navigation-menu); A few actions on one item (use menu).
- `<Menubar>` requires `label`.
- `<Menubar.Menu>` requires `label`.
- Name each menu with one short noun (ファイル, 編集, 表示).
- Keep the bar to the menus of one application; links between pages belong in NavigationMenu.
- Show shortcuts with Menu.Item's shortcut; the app registers them.

```tsx
<Menubar label="ノートのメニュー">
  <Menubar.Menu label="ファイル">
    <Menu.Item shortcut="⌘N">新しいノート</Menu.Item>
    <Menu.Item shortcut="⌘O">開く…</Menu.Item>
  </Menubar.Menu>
  <Menubar.Menu label="編集">
    <Menu.Item shortcut="⌘Z">元に戻す</Menu.Item>
    <Menu.Item shortcut="⇧⌘Z">やり直す</Menu.Item>
  </Menubar.Menu>
</Menubar>
```

### Meter — A measurement within a known range, in a native <meter> that colors itself by low / high / optimum.

Use for: Storage used, a quota, a score.
Not for: How far a task has got (use progress).
- `<Meter>` requires `label`, `value`.
- label is required; it is linked with aria-labelledby.
- Say the value in text too: color alone does not tell how full it is.

```tsx
<Meter label="使用容量" value={82} high={80} optimum={0} valueText="8.2 GB / 10 GB" />
```

### NavigationMenu — Site navigation with native disclosures, pointer-intent hover, collision-aware flyouts and responsive inline layout.

Use for: A website header with grouped links; Nested navigation that remains usable before JavaScript loads.
Not for: Actions such as delete or archive (use menu); Persistent application sidebar (use sidebar).
- `<NavigationMenu>` requires `label`.
- `<NavigationMenu.Group>` requires `title`; submenu: flyout|inline.
- `<NavigationMenu.Link>` requires `href`.
- Use navigation links, not role=menu or menuitem.
- Give the navigation a unique label.
- Use at most one current link per navigation.
- Do not put buttons, links or inputs inside Group title.
- Install UrushiRuntime for hover intent, flyouts, Escape, outside dismissal and arrow keys. Basic disclosure and links need no runtime.
- Hover must not move focus or hide a panel containing keyboard focus. Touch and narrow screens use explicit activation.

```tsx
<NavigationMenu label="Main navigation">
  <NavigationMenu.Group title="Product">
    <NavigationMenu.Link href="/overview" current>Overview</NavigationMenu.Link>
    <NavigationMenu.Group title="Developers">
      <NavigationMenu.Link href="/docs">Documentation</NavigationMenu.Link>
    </NavigationMenu.Group>
  </NavigationMenu.Group>
  <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
</NavigationMenu>
```

### OTPInput — A one-time code field: one native input drawn as separate boxes, with one-time-code autofill.

Use for: Codes sent by mail or SMS.
Not for: Passwords (use input type="password").
- `<OTPInput>`.
- It is one field, so screen readers and paste work as for any input.
- Label it with a Field.

```tsx
<Field id="code" label="確認コード"><OTPInput /></Field>
```

### Pagination — Links to the pages of a long list: previous, numbered pages with gaps, next.

Use for: Search results and lists split into pages.
Not for: A feed that loads more as you scroll (use a load-more Button).
- `<Pagination>` requires `page`, `total`, `href`.
- The current page has aria-current="page"; each number says "n ページ目".

```tsx
<Pagination page={3} total={12} href="/tasks?page={page}" />
```

### Popover — A non-modal panel in the top layer (native `popover`), positioned against its trigger with CSS anchor positioning.

Use for: Filters or settings attached to a control; Supplementary content that keeps the page usable.
Not for: A task that must be finished before continuing (use dialog); A list of actions (use menu); A short label on hover (use tooltip).
- `<Popover>` requires `id`; side: top|bottom|start|end; align: start|center|end; mode: auto|manual.
- `<Popover.Trigger>` requires `popover`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Popover.Close>` requires `popover`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- Provide title or aria-label so the panel has an accessible name.
- Every Popover.Trigger and Popover.Close must reference an existing Popover id.

```tsx
<Popover.Trigger popover="filters">Filters</Popover.Trigger>
<Popover id="filters" title="Filters" side="bottom" align="start">…</Popover>
```

### Progress — How far a task has got, in a native <progress> with a visible label.

Use for: Uploads, imports, multi-step processes.
Not for: A measurement within a range (disk usage, a score) (use meter); Waiting with no known length (use spinner).
- `<Progress>` requires `label`.
- label is required; it is linked with aria-labelledby.

```tsx
<Progress label="写真をアップロード中" value={42} />
```

### RadioGroup — A <fieldset> of native radio buttons: exactly one choice, arrow keys move between them.

Use for: Choosing exactly one of two to six visible options.
Not for: Many options or a long list (use select); Any number of choices (use checkbox).
- `<RadioGroup>` requires `name`, `legend`; orientation: vertical|horizontal; variant: default|cards.
- `<RadioGroup.Item>` requires `value`.
- legend is required; it is the group's accessible name.

```tsx
<RadioGroup name="plan" legend="プラン" defaultValue="team">
  <RadioGroup.Item value="free">無料</RadioGroup.Item>
  <RadioGroup.Item value="team" description="5 人まで">チーム</RadioGroup.Item>
</RadioGroup>
```

### Resizable — Two panes split by a handle that changes their sizes, like a mail list beside the message. Drag the handle, or focus it and use the arrow keys (WAI-ARIA window splitter). Without the runtime the split stays at defaultSize.

Use for: A list beside its details in an application; An editor beside its preview.
Not for: A page layout that should follow the screen size (use CSS grid); Showing or hiding a side panel (use sheet).
- `<Resizable>`; orientation: horizontal|vertical.
- `<Resizable.Panel>`.
- `<Resizable.Handle>` requires `label`.
- label is required; it names the handle.
- Put exactly two Resizable.Panel and one Resizable.Handle between them.
- Keep min large enough that the first pane stays usable.

```tsx
<Resizable defaultSize={35} min={25} max={60}>
  <Resizable.Panel>…一覧…</Resizable.Panel>
  <Resizable.Handle label="一覧の幅" />
  <Resizable.Panel>…本文…</Resizable.Panel>
</Resizable>
```

### ScrollArea — A scrolling region with pack-styled scrollbars, focusable and named so keyboards can scroll it.

Use for: A long list inside a fixed-height panel; Wide content that scrolls sideways.
Not for: The page itself (use the document scroll).
- `<ScrollArea>` requires `label`; orientation: vertical|horizontal|both.
- label is required: a focusable region needs a name.

```tsx
<ScrollArea label="参加者" style={{ blockSize: 240 }}>…</ScrollArea>
```

### Select — A native <select>; with appearance: base-select its picker follows the pack.

Use for: Choosing one option from a list of about 5 to 15.
Not for: Two to five visible options (use radio-group); Actions (use menu).
- `<Select>`; size: sm|md|lg.
- Wrap in Field so it has a label.

```tsx
<Field id="owner" label="担当"><Select name="owner" placeholder="選択してください"><option>山田</option><option>佐藤</option></Select></Field>
```

### Separator — A thin rule between groups of content.

Use for: Separating groups when spacing alone is not enough.
Not for: Decorating every block (use card).
- `<Separator>`; orientation: horizontal|vertical.
- Use decorative when the rule adds no structure.

```tsx
<Separator />
```

### Sheet — A modal <dialog> that slides in from an edge of the screen.

Use for: Details or a form next to a list; Navigation or filters on small screens.
Not for: A short confirmation (use alert-dialog).
- `<Sheet>` requires `id`, `title`; side: start|end|top|bottom; size: sm|md|lg; dismissible: any|closerequest|none.
- `<Sheet.Trigger>` requires `sheet`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Sheet.Close>` requires `sheet`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- title is required.
- Every trigger and close button references an existing Sheet id.

```tsx
<Sheet.Trigger sheet="task">詳細</Sheet.Trigger>
<Sheet id="task" title="告知メールの文面を確定する">…</Sheet>
```

### Sidebar — An app's side navigation: groups of links, optionally collapsible with native <details>.

Use for: The main navigation of an app with many sections.
Not for: A short list of top-level pages (use a header nav).
- `<Sidebar>` requires `label`.
- `<Sidebar.Group>` requires `title`.
- `<Sidebar.Item>` requires `href`.
- Exactly one item is current per page.
- Icons are decorative; the text names the link.

```tsx
<Sidebar label="メイン">
  <Sidebar.Group title="プロジェクト">
    <Sidebar.Item href="/tasks" current>タスク</Sidebar.Item>
    <Sidebar.Item href="/members">メンバー</Sidebar.Item>
  </Sidebar.Group>
</Sidebar>
```

### Skeleton — A placeholder shape shown while content loads.

Use for: Reserving the space of content that is still loading.
Not for: An action in progress (use spinner).
- `<Skeleton>`; shape: block|text|circle.
- Set aria-busy="true" on the region that is loading.

```tsx
<Skeleton shape="text" lines={3} />
```

### Slider — A native range input with optional live value feedback and directly selectable labelled marks.

Use for: An approximate value where the exact number matters less (音量, 明るさ).
Not for: An exact number (use input).
- `<Slider>`.
- Label it with a Field.

```tsx
<Field id="volume" label="音量"><Slider min={0} max={100} defaultValue={60} /></Field>
```

### Spinner — An indeterminate progress indicator with a status message for screen readers.

Use for: Short waits where the remaining time is unknown.
Not for: Loading a layout you can predict (use skeleton); A button that is submitting (use button (loading)).
- `<Spinner>`; size: sm|md|lg.
- label says what is loading when it is not obvious.

```tsx
<Spinner label="検索結果を読み込み中" />
```

### Steps — Where the user is in a fixed sequence: an ordered list with aria-current="step".

Use for: Sign-up or checkout steps; A setup checklist.
Not for: Switching between views (use tabs).
- `<Steps>` requires `label`; orientation: horizontal|vertical.
- `<Steps.Item>` requires `title`; status: done|current|upcoming.
- Exactly one step is current.
- State is spoken (完了 / 現在の手順), not only shown by color.

```tsx
<Steps label="申し込みの手順">
  <Steps.Item title="アカウント" status="done" />
  <Steps.Item title="お支払い" status="current" />
  <Steps.Item title="確認" />
</Steps>
```

### Switch — A native checkbox with role="switch" for settings that take effect immediately.

Use for: Turning a setting on or off right away.
Not for: A choice that is submitted with a form (use checkbox).
- `<Switch>`.
- The label names the setting, not its state ('通知', not '通知をオンにする').

```tsx
<Switch name="notify" defaultChecked>メール通知</Switch>
```

### Table — A native <table> styled by the pack. You write thead, tbody, th and td as usual.

Use for: Comparing items across the same columns; Lists with several attributes per row.
Not for: Laying out a page (use CSS grid).
- `<Table>` requires `caption`; density: default|compact.
- caption is required: it is the table's accessible name.
- Use th with scope="col" / scope="row" for headers.

```tsx
<Table caption="タスク">
  <thead><tr><th scope="col">タスク</th><th scope="col">期限</th></tr></thead>
  <tbody><tr><td>告知メールの文面を確定する</td><td>10/24</td></tr></tbody>
</Table>
```

### Tabs — Switches between panels of equal weight. Server-rendered; the runtime adds clicking and arrow keys.

Use for: Views of the same object (概要・設定・履歴).
Not for: Steps of a process (use stepper (planned)); Content most people skip (use accordion).
- `<Tabs>` requires `id`, `label`, `defaultValue`; orientation: horizontal|vertical; motion: smooth|none.
- `<Tabs.List>`.
- `<Tabs.Tab>` requires `value`.
- `<Tabs.Activate>` requires `tabs`, `value`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Tabs.Panel>` requires `value`.
- Tabs.Tab and Tabs.Panel must be direct children of Tabs.List and Tabs.

```tsx
<Tabs.Activate tabs="project" value="settings">設定を開く</Tabs.Activate>
<Tabs id="project" label="プロジェクト" defaultValue="overview">
  <Tabs.List><Tabs.Tab value="overview">概要</Tabs.Tab><Tabs.Tab value="settings">設定</Tabs.Tab></Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel><Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>
```

### Textarea — A native <textarea> that grows with its content (field-sizing).

Use for: Comments, descriptions and other multi-line text.
Not for: A single line (use input).
- `<Textarea>`.
- Wrap in Field so it has a label.

```tsx
<Field id="comment" label="コメント"><Textarea name="comment" rows={4} /></Field>
```

### Toaster — Brief notifications about the result of an action. Place one <Toaster /> per page and call toast() from client code.

Use for: Confirming that an action finished (保存しました); Reporting a recoverable failure.
Not for: Anything the user must decide (use dialog); Errors in a form field (use field).
- `<Toaster>`; position: bottom-end|bottom-center|top-end.
- Messages are short and name the result in the same words as the action (保存 → 保存しました).
- Toasts are announced politely; never put the only copy of important information in one.

```tsx
toast("保存しました", { tone: "ok" })
```

### ToggleGroup — A segmented control: native radios (one choice) or checkboxes (several) drawn as one row of buttons.

Use for: Choosing a view (リスト / ボード); Text alignment in a toolbar.
Not for: Navigation between pages (use tabs or links).
- `<ToggleGroup>` requires `legend`, `name`; type: single|multiple; size: sm|md.
- `<ToggleGroup.Item>` requires `value`.
- legend is required even when hidden.
- Icon-only items need aria-label.

```tsx
<ToggleGroup legend="表示" name="view" defaultValue="list">
  <ToggleGroup.Item value="list">リスト</ToggleGroup.Item>
  <ToggleGroup.Item value="board">ボード</ToggleGroup.Item>
</ToggleGroup>
```

### Toggle — A button-looking on/off control. It is a native checkbox, so it works in forms and without JavaScript.

Use for: Formatting in a toolbar (太字); Showing or hiding something in place.
Not for: A setting that applies at once in a list of settings (use switch); One of several exclusive options (use toggle-group).
- `<Toggle>`; size: sm|md|lg.
- Icon-only toggles need aria-label.
- It is exposed as a checkbox (checked / not checked).

```tsx
<Toggle aria-label="太字"><BoldIcon /></Toggle>
```

### Tooltip — A short description shown on hover and keyboard focus: popover="hint" opened through interestfor.

Use for: Naming or describing an icon button; A keyboard shortcut hint.
Not for: Anything interactive or essential (use popover); Long explanations (use popover).
- `<Tooltip>` requires `id`; side: top|bottom|start|end; align: start|center|end.
- `<Tooltip.Trigger>` requires `tooltip`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- The trigger still needs its own name (aria-label for icon buttons); the tooltip only describes it.
- Never put links or buttons in a tooltip.

```tsx
<Tooltip.Trigger tooltip="tip-copy" aria-label="コピー" variant="ghost">⧉</Tooltip.Trigger>
<Tooltip id="tip-copy">クリップボードにコピー（⌘C）</Tooltip>
```

## Tokens

Every pack defines these custom properties, with its own values. Use them in your own CSS or in `style` on your own elements (rule 3); components already use them.

### color

- `--ur-color-bg`: Page background.
- `--ur-color-surface`: Panels, cards and tables.
- `--ur-color-surface-overlay`: Dialogs, popovers and menus.
- `--ur-color-field`: Fill of inputs and checkboxes.
- `--ur-color-text`: Body text and headings.
- `--ur-color-text-muted`: Secondary text: descriptions, table headers, helper text.
- `--ur-color-text-subtle`: Dates, counts and notes.
- `--ur-color-border`: Dividers and table rules (1px).
- `--ur-color-border-strong`: Hovered input borders; emphasized dividers.
- `--ur-color-border-control`: Border of secondary buttons.
- `--ur-color-secondary`: Fill of secondary buttons.
- `--ur-color-secondary-hover`: Hovered secondary buttons.
- `--ur-color-on-secondary`: Text on secondary buttons.
- `--ur-color-ghost-hover`: Hovered ghost buttons and navigation items.
- `--ur-color-action`: Fill of the primary action (one per screen).
- `--ur-color-action-hover`: Hovered primary actions.
- `--ur-color-on-action`: Text and icons on an action fill.
- `--ur-color-danger`: Fill of danger buttons; text that signals danger (errors, overdue).
- `--ur-color-danger-hover`: Hovered danger buttons.
- `--ur-color-on-danger`: Text and icons on a danger fill.
- `--ur-color-accent`: Focus, selection and in-progress state. Not for decoration.
- `--ur-color-focus-ring`: Focus rings.
- `--ur-color-ok`: Done or success marks; always next to a text label.
- `--ur-color-backdrop`: Behind modal dialogs.
- `--ur-color-link`: Inline link text.
- `--ur-color-border-field`: Borders of inputs, selects, checkboxes and radios.
- `--ur-color-track`: Track of a switch that is off.
- `--ur-color-skeleton`: Loading placeholders.
- `--ur-color-tooltip`: Tooltip fill (the inverse of the page).
- `--ur-color-on-tooltip`: Text on tooltips.
- `--ur-color-thumb`: Knob of a switch that is off.
- `--ur-color-warning`: Caution: a value getting high, a notice that needs attention. Always with words.

### shadow

- `--ur-shadow-control`: Secondary buttons.
- `--ur-shadow-action`: Primary buttons.
- `--ur-shadow-danger`: Danger buttons.
- `--ur-shadow-panel`: Panels and cards.
- `--ur-shadow-overlay`: Popovers and menus.
- `--ur-shadow-dialog`: Dialogs.

### material

- `--ur-material-overlay`: backdrop-filter of popovers and menus (`none` in opaque packs).
- `--ur-material-backdrop`: backdrop-filter behind modal dialogs.

### radius

- `--ur-radius-control`: Buttons and inputs.
- `--ur-radius-panel`: Panels and cards.
- `--ur-radius-overlay`: Popovers and menus.
- `--ur-radius-dialog`: Dialogs.
- `--ur-radius-checkbox`: Checkboxes.
- `--ur-radius-squircle-control`: radius-control where `corner-shape` is supported (components switch by themselves).
- `--ur-radius-squircle-panel`: radius-panel where `corner-shape` is supported.
- `--ur-radius-squircle-overlay`: radius-overlay where `corner-shape` is supported.
- `--ur-radius-squircle-dialog`: radius-dialog where `corner-shape` is supported.
- `--ur-radius-badge`: Badges.

### corner-shape

- `--ur-corner-shape`: `corner-shape` of components (`round` or `squircle`).

### space

- `--ur-space-1`: Smallest step: between an icon and its text.
- `--ur-space-2`: Inside dense rows.
- `--ur-space-3`: Between buttons; between a label and its field.
- `--ur-space-4`: Between a panel's heading and its body.
- `--ur-space-5`: Between form fields.
- `--ur-space-6`: Section padding; above a dialog's buttons.

### control

- `--ur-control-sm`: Height of size="sm" controls.
- `--ur-control-md`: Height of size="md" controls.
- `--ur-control-lg`: Height of size="lg" controls.
- `--ur-control-padding-sm`: Inline padding of size="sm" controls.
- `--ur-control-padding-md`: Inline padding of size="md" controls.
- `--ur-control-padding-lg`: Inline padding of size="lg" controls.

### font

- `--ur-font-family-ui`: The UI font stack.
- `--ur-font-size-small`: Captions, badges and helper text.
- `--ur-font-size-control`: Text in buttons and inputs.
- `--ur-font-size-body`: Body text.
- `--ur-font-size-title`: Titles of panels and dialogs.
- `--ur-font-weight-control`: Weight of button labels.
- `--ur-font-weight-title`: Weight of titles.
- `--ur-font-line-height-body`: Line height of body text.
- `--ur-font-line-height-title`: Line height of titles.
- `--ur-font-tracking-body`: letter-spacing of body text.
- `--ur-font-tracking-title`: letter-spacing of titles.
- `--ur-font-features-title`: font-feature-settings of titles.
- `--ur-font-numeric`: font-variant-numeric for numbers that line up (tables, counters).

### border

- `--ur-border-width`: Width of component borders and dividers.

### motion

- `--ur-motion-duration-fast`: Hover and press transitions.
- `--ur-motion-duration-overlay`: Opening and closing overlays.
- `--ur-motion-ease-out`: Easing of hover and press transitions.
- `--ur-motion-ease-overlay`: Easing of overlays.
- `--ur-motion-enter-scale`: Scale an overlay opens from (1 with reduced motion).
- `--ur-motion-press-scale`: Scale of a pressed button (1 with reduced motion).

### focus-ring

- `--ur-focus-ring-width`: Width of focus rings.
- `--ur-focus-ring-offset`: Gap between a control and its focus ring.

### dialog

- `--ur-dialog-padding`: Inner padding of dialogs.
- `--ur-dialog-size-sm`: Width of size="sm" dialogs.
- `--ur-dialog-size-md`: Width of size="md" dialogs.
- `--ur-dialog-size-lg`: Width of size="lg" dialogs.

### popover

- `--ur-popover-offset`: Gap between a trigger and its popover.
- `--ur-popover-padding`: Inner padding of popovers.

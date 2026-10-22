---
name: yourlib
description: Rules for building UI with yourlib components. Use whenever you write or edit JSX that uses yourlib components, packs or tokens.
---

# Building UI with yourlib

yourlib components are native HTML elements with a contract. Follow the contract; the lint plugin enforces it.

## Ground rules

1. Visuals come from the active pack (`data-pack` on <html> or any section). Never restyle a component with className or style.
   className on a component may only adjust the categories its contract lists (margin, width, layout, position).
2. Need a different look? Use a variant prop. If none fits, stop and ask: a new variant is added to the contract and to every pack, never inlined.
3. Colors in your own markup come from the pack's tokens (see Tokens below; no other `--yl-*` name exists).
   Write them in your own CSS (`color: var(--yl-color-text-muted)`) or in `style` on your own elements (`style={{ color: "var(--yl-color-text-muted)" }}`).
   Never inside Tailwind arbitrary values (`text-[var(--yl-color-text-muted)]`, `bg-(--yl-color-surface)`). No Tailwind palette colors (`bg-gray-100`) and no raw hex/oklch values.
   For spacing and sizes use Tailwind's scale (`p-4`, `gap-3`, `max-w-md`) or the `--yl-space-*` tokens, not arbitrary values (`p-[13px]`).
4. Prefer native behavior. Dialog.Trigger, Popover.Trigger, Menu.Trigger and Tooltip.Trigger wire the browser's own opening (command, popovertarget, interestfor); Accordion uses <details name>. No useState is needed to open or close anything.
5. Link elements by id, like HTML: every Trigger/Close references an existing id of the right kind (a Menu.Trigger points at a <Menu>, not a <Popover>).
6. Put one control inside each Field and let Field wire id, aria-describedby, aria-invalid and required. Do not set them on the control by hand.
7. In Tabs, every Tabs.Tab value has a Tabs.Panel with the same value, and defaultValue names one of the tabs.
8. Render <YourlibRuntime /> (from `@yourlib/react/runtime`) and <Toaster /> once in the root layout. Call toast() only from client code (event handlers). Everything else renders in Server Components.
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

### Badge — A short status or count label.

Use for: Status of an item (対応中, 完了); A count next to a label.
Not for: An action (use button).
- `<Badge>`; tone: neutral|accent|ok|danger.
- Never rely on tone alone; the text states the status.

```tsx
<Badge tone="danger" dot>期限切れ</Badge>
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

### Card — A surface that groups related content, with an optional title, description and footer.

Use for: A self-contained group of content or settings.
Not for: Wrapping every block on a page (use spacing instead) (use separator).
- `<Card>`; headingLevel: h2|h3|h4; padding: sm|md|lg.
- Pick headingLevel so headings stay in order on the page.

```tsx
<Card title="通知" description="受け取る通知を選びます。" footer={<Button>保存</Button>}>…</Card>
```

### Checkbox — A native checkbox with its own label.

Use for: Choosing any number of options; Confirming a single statement (agree to terms).
Not for: A setting that applies immediately (use switch); Exactly one of several options (use radio-group).
- `<Checkbox>`.
- children is the label; never leave it empty.

```tsx
<Checkbox name="terms" required>利用規約に同意します</Checkbox>
```

### Dialog — A modal native <dialog> that interrupts the user for a confirmation or a short task.

Use for: Confirming a destructive action; A short form that must be finished before continuing.
Not for: Showing supplementary information next to a control (use popover); Reporting the result of an action (use toast).
- `<Dialog>` requires `id`, `title`; dismissible: any|closerequest|none; size: sm|md|lg.
- `<Dialog.Trigger>` requires `dialog`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Dialog.Close>` requires `dialog`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Dialog.Actions>`.
- title is required; it becomes the accessible name through aria-labelledby.
- Every Dialog.Trigger and Dialog.Close must reference an existing Dialog id.
- Destructive confirmations should put focus on the safe action with autofocus.

```tsx
<Dialog.Trigger dialog="confirm-delete" variant="danger">Delete</Dialog.Trigger>
<Dialog id="confirm-delete" title="Delete this project?" description="This cannot be undone.">
  <Dialog.Actions>
    <Dialog.Close dialog="confirm-delete" autoFocus>Cancel</Dialog.Close>
    <Button variant="danger" type="submit" form="delete-form">Delete</Button>
  </Dialog.Actions>
</Dialog>
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

### Input — A native single-line <input> styled by the pack.

Use for: Short free text, email, numbers, dates, search.
Not for: Several lines of text (use textarea); Picking from a known list (use select).
- `<Input>`; size: sm|md|lg.
- Wrap in Field so it has a label.
- Use the right type and autocomplete for the data.

```tsx
<Field id="email" label="メールアドレス"><Input type="email" name="email" autoComplete="email" /></Field>
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

### Menu — A list of actions in a popover (menu button pattern). Opens without JavaScript; the runtime adds arrow keys and typeahead.

Use for: Secondary actions on an item (編集・複製・削除).
Not for: Choosing a value (use select); Navigation (use link).
- `<Menu>` requires `id`, `label`; side: top|bottom|start|end; align: start|center|end.
- `<Menu.Trigger>` requires `menu`; variant: primary|secondary|ghost|danger; size: sm|md|lg.
- `<Menu.Item>`; variant: default|danger.
- `<Menu.Link>` requires `href`.
- `<Menu.Separator>`.
- Items are verbs (編集, 複製, 削除).
- Put destructive items last, after a Menu.Separator.

```tsx
<Menu.Trigger menu="row-actions" variant="ghost" aria-label="操作">…</Menu.Trigger>
<Menu id="row-actions" label="タスクの操作">
  <Menu.Item>編集</Menu.Item>
  <Menu.Item>複製</Menu.Item>
  <Menu.Separator />
  <Menu.Item variant="danger">削除</Menu.Item>
</Menu>
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

### RadioGroup — A <fieldset> of native radio buttons: exactly one choice, arrow keys move between them.

Use for: Choosing exactly one of two to six visible options.
Not for: Many options or a long list (use select); Any number of choices (use checkbox).
- `<RadioGroup>` requires `name`, `legend`; orientation: vertical|horizontal.
- `<RadioGroup.Item>` requires `value`.
- legend is required; it is the group's accessible name.

```tsx
<RadioGroup name="plan" legend="プラン" defaultValue="team">
  <RadioGroup.Item value="free">無料</RadioGroup.Item>
  <RadioGroup.Item value="team" description="5 人まで">チーム</RadioGroup.Item>
</RadioGroup>
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

### Skeleton — A placeholder shape shown while content loads.

Use for: Reserving the space of content that is still loading.
Not for: An action in progress (use spinner).
- `<Skeleton>`; shape: block|text|circle.
- Set aria-busy="true" on the region that is loading.

```tsx
<Skeleton shape="text" lines={3} />
```

### Spinner — An indeterminate progress indicator with a status message for screen readers.

Use for: Short waits where the remaining time is unknown.
Not for: Loading a layout you can predict (use skeleton); A button that is submitting (use button (loading)).
- `<Spinner>`; size: sm|md|lg.
- label says what is loading when it is not obvious.

```tsx
<Spinner label="検索結果を読み込み中" />
```

### Switch — A native checkbox with role="switch" for settings that take effect immediately.

Use for: Turning a setting on or off right away.
Not for: A choice that is submitted with a form (use checkbox).
- `<Switch>`.
- The label names the setting, not its state ('通知', not '通知をオンにする').

```tsx
<Switch name="notify" defaultChecked>メール通知</Switch>
```

### Tabs — Switches between panels of equal weight. Server-rendered; the runtime adds clicking and arrow keys.

Use for: Views of the same object (概要・設定・履歴).
Not for: Steps of a process (use stepper (planned)); Content most people skip (use accordion).
- `<Tabs>` requires `id`, `label`, `defaultValue`; orientation: horizontal|vertical.
- `<Tabs.List>`.
- `<Tabs.Tab>` requires `value`.
- `<Tabs.Panel>` requires `value`.
- Tabs.Tab and Tabs.Panel must be direct children of Tabs.List and Tabs.

```tsx
<Tabs id="project" label="プロジェクト" defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">概要</Tabs.Tab>
    <Tabs.Tab value="settings">設定</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
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

- `--yl-color-bg`: Page background.
- `--yl-color-surface`: Panels, cards and tables.
- `--yl-color-surface-overlay`: Dialogs, popovers and menus.
- `--yl-color-field`: Fill of inputs and checkboxes.
- `--yl-color-text`: Body text and headings.
- `--yl-color-text-muted`: Secondary text: descriptions, table headers, helper text.
- `--yl-color-text-subtle`: Dates, counts and notes.
- `--yl-color-border`: Dividers and table rules (1px).
- `--yl-color-border-strong`: Hovered input borders; emphasized dividers.
- `--yl-color-border-control`: Border of secondary buttons.
- `--yl-color-secondary`: Fill of secondary buttons.
- `--yl-color-secondary-hover`: Hovered secondary buttons.
- `--yl-color-on-secondary`: Text on secondary buttons.
- `--yl-color-ghost-hover`: Hovered ghost buttons and navigation items.
- `--yl-color-action`: Fill of the primary action (one per screen).
- `--yl-color-action-hover`: Hovered primary actions.
- `--yl-color-on-action`: Text and icons on an action fill.
- `--yl-color-danger`: Fill of danger buttons; text that signals danger (errors, overdue).
- `--yl-color-danger-hover`: Hovered danger buttons.
- `--yl-color-on-danger`: Text and icons on a danger fill.
- `--yl-color-accent`: Focus, selection and in-progress state. Not for decoration.
- `--yl-color-focus-ring`: Focus rings.
- `--yl-color-ok`: Done or success marks; always next to a text label.
- `--yl-color-backdrop`: Behind modal dialogs.
- `--yl-color-link`: Inline link text.
- `--yl-color-border-field`: Borders of inputs, selects, checkboxes and radios.
- `--yl-color-track`: Track of a switch that is off.
- `--yl-color-skeleton`: Loading placeholders.
- `--yl-color-tooltip`: Tooltip fill (the inverse of the page).
- `--yl-color-on-tooltip`: Text on tooltips.
- `--yl-color-thumb`: Knob of a switch that is off.

### shadow

- `--yl-shadow-control`: Secondary buttons.
- `--yl-shadow-action`: Primary buttons.
- `--yl-shadow-danger`: Danger buttons.
- `--yl-shadow-panel`: Panels and cards.
- `--yl-shadow-overlay`: Popovers and menus.
- `--yl-shadow-dialog`: Dialogs.

### material

- `--yl-material-overlay`: backdrop-filter of popovers and menus (`none` in opaque packs).
- `--yl-material-backdrop`: backdrop-filter behind modal dialogs.

### radius

- `--yl-radius-control`: Buttons and inputs.
- `--yl-radius-panel`: Panels and cards.
- `--yl-radius-overlay`: Popovers and menus.
- `--yl-radius-dialog`: Dialogs.
- `--yl-radius-checkbox`: Checkboxes.
- `--yl-radius-squircle-control`: radius-control where `corner-shape` is supported (components switch by themselves).
- `--yl-radius-squircle-panel`: radius-panel where `corner-shape` is supported.
- `--yl-radius-squircle-overlay`: radius-overlay where `corner-shape` is supported.
- `--yl-radius-squircle-dialog`: radius-dialog where `corner-shape` is supported.
- `--yl-radius-badge`: Badges.

### corner-shape

- `--yl-corner-shape`: `corner-shape` of components (`round` or `squircle`).

### space

- `--yl-space-1`: Smallest step: between an icon and its text.
- `--yl-space-2`: Inside dense rows.
- `--yl-space-3`: Between buttons; between a label and its field.
- `--yl-space-4`: Between a panel's heading and its body.
- `--yl-space-5`: Between form fields.
- `--yl-space-6`: Section padding; above a dialog's buttons.

### control

- `--yl-control-sm`: Height of size="sm" controls.
- `--yl-control-md`: Height of size="md" controls.
- `--yl-control-lg`: Height of size="lg" controls.
- `--yl-control-padding-sm`: Inline padding of size="sm" controls.
- `--yl-control-padding-md`: Inline padding of size="md" controls.
- `--yl-control-padding-lg`: Inline padding of size="lg" controls.

### font

- `--yl-font-family-ui`: The UI font stack.
- `--yl-font-size-small`: Captions, badges and helper text.
- `--yl-font-size-control`: Text in buttons and inputs.
- `--yl-font-size-body`: Body text.
- `--yl-font-size-title`: Titles of panels and dialogs.
- `--yl-font-weight-control`: Weight of button labels.
- `--yl-font-weight-title`: Weight of titles.
- `--yl-font-line-height-body`: Line height of body text.
- `--yl-font-line-height-title`: Line height of titles.
- `--yl-font-tracking-body`: letter-spacing of body text.
- `--yl-font-tracking-title`: letter-spacing of titles.
- `--yl-font-features-title`: font-feature-settings of titles.
- `--yl-font-numeric`: font-variant-numeric for numbers that line up (tables, counters).

### border

- `--yl-border-width`: Width of component borders and dividers.

### motion

- `--yl-motion-duration-fast`: Hover and press transitions.
- `--yl-motion-duration-overlay`: Opening and closing overlays.
- `--yl-motion-ease-out`: Easing of hover and press transitions.
- `--yl-motion-ease-overlay`: Easing of overlays.
- `--yl-motion-enter-scale`: Scale an overlay opens from (1 with reduced motion).
- `--yl-motion-press-scale`: Scale of a pressed button (1 with reduced motion).

### focus-ring

- `--yl-focus-ring-width`: Width of focus rings.
- `--yl-focus-ring-offset`: Gap between a control and its focus ring.

### dialog

- `--yl-dialog-padding`: Inner padding of dialogs.
- `--yl-dialog-size-sm`: Width of size="sm" dialogs.
- `--yl-dialog-size-md`: Width of size="md" dialogs.
- `--yl-dialog-size-lg`: Width of size="lg" dialogs.

### popover

- `--yl-popover-offset`: Gap between a trigger and its popover.
- `--yl-popover-padding`: Inner padding of popovers.

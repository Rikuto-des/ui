import { SquaresFourIcon, NotebookIcon, PlusIcon, PencilSimpleIcon, SlidersHorizontalIcon, CaretDownIcon, InfoIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon } from "@urushi/react/icons";
import {
  ComboboxExample,
  CalendarExample,
  DatePickerExample,
  DataTableExample,
  CommandExample,
} from "./interactive-examples";
import {
  Accordion,
  Alert,
  AlertDialog,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Carousel,
  Chart,
  Checkbox,
  Collapsible,
  ContextMenu,
  DateInput,
  Dialog,
  Drawer,
  Field,
  FileInput,
  Form,
  HoverCard,
  Input,
  InputGroup,
  Item,
  Link,
  Menu,
  Menubar,
  Meter,
  NavigationMenu,
  OTPInput,
  Popover,
  RadioGroup,
  Resizable,
  ScrollArea,
  Select,
  Separator,
  Sheet,
  Sidebar,
  Steps,
  Switch,
  Table,
  Tabs,
  Textarea,
  Toggle,
  ToggleGroup,
  Tooltip,
} from "@urushi/react";
import {
  CatalogCard,
  CatalogBadge,
  CatalogKeys,
  CatalogLoading,
  CatalogAction,
  CatalogButtonGroup,
  CatalogButtons,
  CatalogEmpty,
  CatalogPagination,
  CatalogProgress,
  CatalogSlider,
} from "./catalog-actions";

const image = (label: string, index = 0) => (
  <svg viewBox="0 0 240 135" role="img" aria-label={label}>
    <rect width="240" height="135" fill="var(--ur-color-skeleton)" />
    <circle cx={170 - index * 40} cy="45" r="26" fill="var(--ur-color-field)" />
    <path
      d="M0 135 70 50l65 85M80 135 170 70l70 65"
      fill="var(--ur-color-border-strong)"
    />
    <path d="M0 135 60 94l70 41" fill="var(--ur-color-accent)" />
  </svg>
);

/** Actual public components rendered on the server; the catalog filters these nodes. */
export function CatalogPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "combobox":
      return <ComboboxExample />;
    case "calendar":
      return <CalendarExample compact />;
    case "date-picker":
      return <DatePickerExample compact />;
    case "data-table":
      return <DataTableExample compact />;
    case "command":
      return <CommandExample compact />;
    case "button":
      return <CatalogButtons />;
    case "button-group":
      return <CatalogButtonGroup />;
    case "input":
      return (
        <div className="preview-stack">
          <Field id="catalog-name" label="名前">
            <Input placeholder="Alex Morgan" autoComplete="off" />
          </Field>
          <Input
            type="search"
            aria-label="プレビュー内を検索"
            placeholder="検索…"
          />
        </div>
      );
    case "field":
      return (
        <Field
          id="catalog-field-email"
          label="メールアドレス"
          description="招待リンクの送信先です。"
          required
        >
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="off"
          />
        </Field>
      );
    case "input-group":
      return (
        <Field id="catalog-domain" label="ウェブサイト">
          <InputGroup>
            <InputGroup.Addon>https://</InputGroup.Addon>
            <Input placeholder="urushi.design" />
          </InputGroup>
        </Field>
      );
    case "textarea":
      return (
        <Field id="catalog-message" label="メッセージ">
          <Textarea
            placeholder="アイデアを共有しましょう。"
            rows={3}
            maxLength={160}
            showCount
          />
        </Field>
      );
    case "select":
      return (
        <div className="preview-stack">
          <Field id="catalog-framework" label="Framework">
            <Select defaultValue="next">
              <option value="next">Next.js</option>
              <option value="react">React</option>
              <option value="remix">Remix</option>
            </Select>
          </Field>
          <Field id="catalog-region" label="Region">
            <Select placeholder="リージョンを選択">
              <option value="tokyo">Tokyo</option>
              <option value="london">London</option>
              <option value="sf">San Francisco</option>
            </Select>
          </Field>
        </div>
      );
    case "checkbox":
      return (
        <div className="preview-stack">
          <Checkbox
            defaultChecked
            description="週に一度、更新をお知らせします。"
          >
            ニュースレター
          </Checkbox>
          <Checkbox>製品のアップデート</Checkbox>
          <Checkbox disabled>管理者のみ変更可能</Checkbox>
        </div>
      );
    case "switch":
      return (
        <div className="preview-stack">
          <Switch defaultChecked description="新しいコメントを知らせます。">
            通知を受け取る
          </Switch>
          <Switch>フォーカスモード</Switch>
        </div>
      );
    case "radio-group":
      return (
        <RadioGroup
          name="catalog-plan"
          legend="プランを選択"
          variant="cards"
          defaultValue="pro"
        >
          <RadioGroup.Item value="free">Free</RadioGroup.Item>
          <RadioGroup.Item value="pro" description="チームで共同作業ができます。">
            Pro
          </RadioGroup.Item>
          <RadioGroup.Item value="team">Team</RadioGroup.Item>
        </RadioGroup>
      );
    case "slider":
      return <CatalogSlider />;
    case "date-input":
      return (
        <Field id="catalog-date" label="公開日">
          <DateInput defaultValue="2026-10-30" />
        </Field>
      );
    case "file-input":
      return (
        <Field
          id="catalog-file"
          label="ファイルを選択"
          description="プレビューだけを表示し、アップロードは行いません。"
        >
          <FileInput variant="dropzone" accept="image/*" showFiles />
        </Field>
      );
    case "otp-input":
      return (
        <Field
          id="catalog-otp"
          label="確認コード"
          description="6桁の数字を入力してください。"
        >
          <OTPInput />
        </Field>
      );
    case "card":
      return <CatalogCard />;
    case "badge":
      return <CatalogBadge />;
    case "avatar":
      return (
        <div className="preview-row preview-centered">
          <Avatar
            name="Alex Morgan"
            status="online"
            statusLabel="オンライン"
            size="sm"
          />
          <Avatar name="Mika Sato" status="away" statusLabel="離席中" />
          <Avatar
            name="Kai Ito"
            status="busy"
            statusLabel="取り込み中"
            size="lg"
          />
        </div>
      );
    case "kbd":
      return <CatalogKeys />;
    case "table":
      return (
        <Table caption="最近のプロジェクト">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Website</td>
              <td>
                <Badge tone="ok" dot>
                  Live
                </Badge>
              </td>
            </tr>
            <tr>
              <td>Mobile</td>
              <td>
                <Badge>Draft</Badge>
              </td>
            </tr>
            <tr>
              <td>Design system</td>
              <td>
                <Badge tone="accent">Review</Badge>
              </td>
            </tr>
          </tbody>
        </Table>
      );
    case "tabs":
      return (
        <Tabs id="catalog-tabs" label="プレビューの設定" defaultValue="account">
          <Tabs.List>
            <Tabs.Tab value="account">Account</Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="account">
            <Field id="catalog-username" label="ユーザー名">
              <Input defaultValue="alex.morgan" />
            </Field>
          </Tabs.Panel>
          <Tabs.Panel value="security">
            <Field id="catalog-password" label="パスワード">
              <Input
                type="password"
                placeholder="新しいパスワード"
                autoComplete="new-password"
              />
            </Field>
          </Tabs.Panel>
        </Tabs>
      );
    case "accordion":
      return (
        <Accordion name="catalog-faq">
          <Accordion.Item title="商用利用できますか？" defaultOpen>
            MITライセンスで利用できます。
          </Accordion.Item>
          <Accordion.Item title="テーマを変えられますか？">
            GraphiteとLucentを切り替えられます。
          </Accordion.Item>
        </Accordion>
      );
    case "collapsible":
      return (
        <Collapsible title="最近のファイル">
          <div className="preview-stack">
            <span>navigation-menu.tsx</span>
            <span>button.tsx</span>
            <span>tokens.json</span>
          </div>
        </Collapsible>
      );
    case "separator":
      return (
        <div>
          <span className="preview-heading">Urushi</span>
          <p className="preview-hint">Thoughtful defaults. Yours to build.</p>
          <Separator decorative />
          <div className="preview-row">
            <Link href="/docs/">Docs</Link>
            <Separator orientation="vertical" />
            <Link href="/docs/cli/">CLI</Link>
          </div>
        </div>
      );
    case "aspect-ratio":
      return (
        <AspectRatio ratio="16 / 9">{image("風景のイラスト")}</AspectRatio>
      );
    case "scroll-area":
      return (
        <ScrollArea label="プレビューのメンバー" style={{ blockSize: 180 }}>
          <ul className="preview-people">
            {[
              "Alex Morgan",
              "Mika Sato",
              "Kai Ito",
              "Hana Mori",
              "Ren Tanaka",
              "Sora Abe",
            ].map((name) => (
              <li key={name}>
                <Avatar name={name} size="sm" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      );
    case "carousel":
      return (
        <Carousel label="風景のスライド">
          {["Morning", "Afternoon", "Evening"].map((label, i) => (
            <Carousel.Item key={label}>
              <AspectRatio ratio="16 / 9">{image(label, i)}</AspectRatio>
              <p className="preview-hint">{label}</p>
            </Carousel.Item>
          ))}
        </Carousel>
      );
    case "alert":
      return (
        <Alert title="準備ができました" tone="ok">
          変更を保存しました。いつでも公開できます。
        </Alert>
      );
    case "progress":
      return <CatalogProgress />;
    case "meter":
      return (
        <div className="preview-stack">
          <Meter
            label="ストレージ"
            value={3.2}
            max={10}
            high={8}
            optimum={0}
            valueText="3.2 GB / 10 GB"
          />
          <Meter label="今月の利用量" value={64} valueText="64%" />
        </div>
      );
    case "spinner":
      return <CatalogLoading kind="spinner" />;
    case "skeleton":
      return <CatalogLoading kind="skeleton" />;
    case "empty":
      return <CatalogEmpty />;
    case "chart":
      return (
        <div className="catalog-item-group">
          <Chart title="月ごとの売上（万円）" unit="万円" height={110} labels={["8月", "9月", "10月", "11月"]} series={[{ name: "今年", values: [47, 63, 71, 78] }, { name: "去年", values: [45, 49, 52, 58] }]} />
        </div>
      );
    case "form":
      return (
        <div className="catalog-item-group">
          <Form id="catalog-form" method="dialog">
            <Field id="catalog-form-email" label="メールアドレス" required>
              <Input type="email" />
            </Field>
            <Button type="submit">登録する</Button>
          </Form>
        </div>
      );
    case "resizable":
      return (
        <div className="catalog-split">
          <Resizable defaultSize={40}>
            <Resizable.Panel>
              <p className="catalog-split-pane">一覧</p>
            </Resizable.Panel>
            <Resizable.Handle label="一覧の幅" />
            <Resizable.Panel>
              <p className="catalog-split-pane">本文</p>
            </Resizable.Panel>
          </Resizable>
        </div>
      );
    case "item":
      return (
        <div className="catalog-item-group">
        <Item.Group label="設定">
          <Item title="お知らせメール" description="締め切りの前日に送ります" action={<Switch aria-label="お知らせメール" defaultChecked />} />
          <Item title="パスワード" description="最後の変更は 3 か月前" href="/components/item/" />
        </Item.Group>
        </div>
      );
    case "breadcrumb":
      return (
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/components/">Components</Breadcrumb.Item>
          <Breadcrumb.Item current>Breadcrumb</Breadcrumb.Item>
        </Breadcrumb>
      );
    case "pagination":
      return <CatalogPagination />;
    case "steps":
      return (
        <Steps label="セットアップ" orientation="vertical">
          <Steps.Item title="アカウント" status="done" />
          <Steps.Item title="プロフィール" status="current" />
          <Steps.Item title="完了" />
        </Steps>
      );
    case "navigation-menu":
      return (
        <NavigationMenu label="一覧のNavigation Menu">
          <NavigationMenu.Group title="Product">
            <NavigationMenu.Link
              href="/components/button/"
              description="日々の操作に使うコンポーネントを紹介します。"
            >
              Button
            </NavigationMenu.Link>
            <NavigationMenu.Group title="Resources">
              <NavigationMenu.Link href="/docs/ai/">
                AI workflow
              </NavigationMenu.Link>
              <NavigationMenu.Link href="/docs/cli/">CLI</NavigationMenu.Link>
            </NavigationMenu.Group>
          </NavigationMenu.Group>
          <NavigationMenu.Group title="Explore" columns={2}>
            <NavigationMenu.Link href="/components/dialog/">
              Dialog
            </NavigationMenu.Link>
            <NavigationMenu.Link href="/components/tabs/">
              Tabs
            </NavigationMenu.Link>
            <NavigationMenu.Link href="/docs/packs/">
              Themes
            </NavigationMenu.Link>
            <NavigationMenu.Link href="/docs/">Get started</NavigationMenu.Link>
          </NavigationMenu.Group>
        </NavigationMenu>
      );
    case "sidebar":
      return (
        <Sidebar label="一覧のSidebar">
          <Sidebar.Group title="Workspace">
            <Sidebar.Item
              href="/components/"
              current
              icon={<SquaresFourIcon size={16} />}
            >
              Overview
            </Sidebar.Item>
            <Sidebar.Item
              href="/docs/"
              icon={<NotebookIcon size={16} />}
            >
              Documentation
            </Sidebar.Item>
          </Sidebar.Group>
          <Sidebar.Group title="Settings" collapsible defaultOpen={false}>
            <Sidebar.Item href="/docs/packs/">Appearance</Sidebar.Item>
          </Sidebar.Group>
        </Sidebar>
      );
    case "dialog":
      return (
        <>
          <Dialog.Trigger dialog="catalog-dialog" variant="primary">
            プロジェクトを作成 {<PlusIcon size={16} />}
          </Dialog.Trigger>
          <Dialog
            id="catalog-dialog"
            title="新しいプロジェクト"
            description="プレビュー用のフォームです。外部には送信しません。"
          >
            <form method="dialog" className="preview-stack">
              <Field id="catalog-project-title" label="プロジェクト名" required>
                <Input placeholder="My next idea" />
              </Field>
              <Dialog.Actions>
                <Dialog.Close dialog="catalog-dialog" variant="ghost">
                  キャンセル
                </Dialog.Close>
                <Button type="submit" variant="primary">
                  作成する
                </Button>
              </Dialog.Actions>
            </form>
          </Dialog>
        </>
      );
    case "alert-dialog":
      return (
        <>
          <AlertDialog.Trigger
            alertDialog="catalog-alert-dialog"
            variant="danger"
          >
            プロジェクトを削除
          </AlertDialog.Trigger>
          <AlertDialog
            id="catalog-alert-dialog"
            title="プロジェクトを削除しますか？"
            description="これは操作のプレビューです。実際のデータは削除されません。"
          >
            <AlertDialog.Cancel alertDialog="catalog-alert-dialog">
              キャンセル
            </AlertDialog.Cancel>
            <AlertDialog.Action alertDialog="catalog-alert-dialog">
              削除する
            </AlertDialog.Action>
          </AlertDialog>
        </>
      );
    case "drawer":
      return (
        <>
          <Drawer.Trigger drawer="catalog-drawer">予定を追加</Drawer.Trigger>
          <Drawer id="catalog-drawer" title="予定を追加" description="下に引くと閉じます。">
            <div className="preview-stack">
              <Field id="catalog-drawer-event" label="題名">
                <Input defaultValue="デザインの確認" />
              </Field>
              <Drawer.Close drawer="catalog-drawer">閉じる</Drawer.Close>
            </div>
          </Drawer>
        </>
      );
    case "sheet":
      return (
        <>
          <Sheet.Trigger sheet="catalog-sheet">
            プロフィールを編集 {<PencilSimpleIcon size={16} />}
          </Sheet.Trigger>
          <Sheet
            id="catalog-sheet"
            title="プロフィール"
            description="表示名と自己紹介を編集できます。"
          >
            <div className="preview-stack">
              <Field id="catalog-profile-name" label="表示名">
                <Input defaultValue="Alex Morgan" />
              </Field>
              <Field id="catalog-profile-bio" label="自己紹介">
                <Textarea defaultValue="Designer & developer." />
              </Field>
              <Sheet.Close sheet="catalog-sheet" variant="primary">
                完了
              </Sheet.Close>
            </div>
          </Sheet>
        </>
      );
    case "popover":
      return (
        <>
          <Popover.Trigger popover="catalog-popover">
            表示設定 {<SlidersHorizontalIcon size={16} />}
          </Popover.Trigger>
          <Popover id="catalog-popover" title="表示設定">
            <div className="preview-stack">
              <Switch defaultChecked>グリッドを表示</Switch>
              <Switch>ガイドを表示</Switch>
            </div>
          </Popover>
        </>
      );
    case "menu":
      return (
        <>
          <Menu.Trigger menu="catalog-menu">
            Actions {<CaretDownIcon size={16} />}
          </Menu.Trigger>
          <Menu id="catalog-menu" label="一覧プレビューの操作">
            <Menu.Link href="/components/menu/">APIを見る</Menu.Link>
            <Menu.Link href="/docs/cli/">インストール方法</Menu.Link>
            <Menu.Separator />
            <Menu.Item disabled>実行できない操作</Menu.Item>
          </Menu>
        </>
      );
    case "context-menu":
      return (
        <>
          <ContextMenu.Area menu="catalog-context-menu">
            <button type="button" className="catalog-context-target">右クリックして操作</button>
          </ContextMenu.Area>
          <ContextMenu id="catalog-context-menu" label="一覧プレビューの操作">
            <Menu.Link href="/components/context-menu/">APIを見る</Menu.Link>
            <Menu.Link href="/docs/cli/">インストール方法</Menu.Link>
          </ContextMenu>
        </>
      );
    case "menubar":
      return (
        <Menubar label="一覧プレビューのメニュー">
          <Menubar.Menu label="ファイル">
            <Menu.Link href="/components/menubar/">APIを見る</Menu.Link>
          </Menubar.Menu>
          <Menubar.Menu label="ヘルプ">
            <Menu.Link href="/docs/cli/">インストール方法</Menu.Link>
          </Menubar.Menu>
        </Menubar>
      );
    case "hover-card":
      return (
        <>
          <HoverCard.Trigger hoverCard="catalog-hover-card" href="/docs/">
            @urushi
          </HoverCard.Trigger>
          <HoverCard id="catalog-hover-card">
            <div className="preview-row">
              <Avatar name="Urushi" />
              <div>
                <strong>Urushi</strong>
                <p className="preview-hint">
                  React components, thoughtfully made.
                </p>
              </div>
            </div>
          </HoverCard>
        </>
      );
    case "tooltip":
      return (
        <>
          <Tooltip.Trigger tooltip="catalog-tooltip">
            ホバーして確認{" "}
            {<InfoIcon size={16} />}
          </Tooltip.Trigger>
          <Tooltip id="catalog-tooltip">
            キーボードのフォーカスでも表示できます。
          </Tooltip>
        </>
      );
    case "toast":
      return (
        <CatalogAction message="変更を保存しました">通知を表示</CatalogAction>
      );
    case "toggle":
      return (
        <div className="preview-row">
          <Toggle aria-label="太字" defaultChecked>
            {<TextBIcon size={16} />}
          </Toggle>
          <Toggle aria-label="斜体">{<TextItalicIcon size={16} />}</Toggle>
          <Toggle aria-label="下線">
            {<TextUnderlineIcon size={16} />}
          </Toggle>
        </div>
      );
    case "toggle-group":
      return (
        <ToggleGroup name="catalog-view" legend="表示方法" defaultValue="list">
          <ToggleGroup.Item value="list">List</ToggleGroup.Item>
          <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
          <ToggleGroup.Item value="board">Board</ToggleGroup.Item>
        </ToggleGroup>
      );
    case "link":
      return (
        <div className="preview-stack">
          <p className="preview-hint">
            詳しい使い方は<Link href="/docs/">ドキュメント</Link>で確認できます。
          </p>
          <Link href="/docs/ai/" variant="standalone">
            AI workflow <span aria-hidden="true">↗</span>
          </Link>
        </div>
      );
    default:
      throw new Error(`Missing catalog preview: ${slug}`);
  }
}

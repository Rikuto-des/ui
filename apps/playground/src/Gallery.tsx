import type { ReactNode } from "react";
import {
  Accordion,
  Alert,
  AlertDialog,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  Chart,
  Checkbox,
  Collapsible,
  ContextMenu,
  DateInput,
  Dialog,
  Drawer,
  Empty,
  Field,
  FileInput,
  Form,
  HoverCard,
  Input,
  InputGroup,
  Item,
  Kbd,
  Link,
  Menu,
  Menubar,
  Meter,
  OTPInput,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Resizable,
  ScrollArea,
  Select,
  Separator,
  Sheet,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  Steps,
  Switch,
  Table,
  Tabs,
  Textarea,
  Toggle,
  ToggleGroup,
  Tooltip,
} from "@urushi/react";
import { IconBold, IconCalendar, IconCopy, IconItalic, IconList, IconMore, IconPeople, IconPlus, IconShare, IconTasks } from "./icons.tsx";

interface Entry {
  id: string;
  name: string;
  /** The browser feature the component is built on. */
  base: string;
  /** What, if anything, needs the optional runtime. */
  js: string;
}

const groups: { label: string; entries: Entry[] }[] = [
  {
    label: "操作",
    entries: [
      { id: "button", name: "Button", base: "<button>", js: "不要" },
      { id: "link", name: "Link", base: "<a>", js: "不要" },
      { id: "button-group", name: "ButtonGroup", base: 'role="group"', js: "不要" },
      { id: "toggle", name: "Toggle", base: '<input type="checkbox">', js: "不要" },
      { id: "toggle-group", name: "ToggleGroup", base: "radio と checkbox", js: "不要" },
      { id: "menu", name: "Menu", base: 'popover="auto"', js: "矢印キーとタイプアヘッドだけ" },
      { id: "context-menu", name: "ContextMenu", base: 'popover="auto"', js: "右クリックで開くのに必要" },
      { id: "menubar", name: "Menubar", base: 'role="menubar" と popover="auto"', js: "矢印キーとホバーでの切り替えだけ" },
    ],
  },
  {
    label: "入力",
    entries: [
      { id: "field", name: "Field + Input", base: "<label> と aria-describedby", js: "不要" },
      { id: "form", name: "Form", base: "<form> と制約の検証", js: "まとめて表示するのに必要" },
      { id: "input-group", name: "InputGroup", base: ":has() で 1 つの枠に", js: "不要" },
      { id: "textarea", name: "Textarea", base: "field-sizing: content", js: "不要" },
      { id: "select", name: "Select", base: "<select> と base-select", js: "不要" },
      { id: "checkbox", name: "Checkbox", base: '<input type="checkbox">', js: "不要" },
      { id: "switch", name: "Switch", base: 'role="switch"', js: "不要" },
      { id: "radio-group", name: "RadioGroup", base: "<fieldset> と radio", js: "不要" },
      { id: "slider", name: "Slider", base: '<input type="range">', js: "不要" },
      { id: "date-input", name: "DateInput", base: '<input type="date">', js: "不要" },
      { id: "file-input", name: "FileInput", base: '<input type="file">', js: "不要" },
      { id: "otp-input", name: "OTPInput", base: "one-time-code", js: "不要" },
    ],
  },
  {
    label: "表示",
    entries: [
      { id: "card", name: "Card", base: "見出しレベルを選べる", js: "不要" },
      { id: "badge", name: "Badge", base: "<span>", js: "不要" },
      { id: "avatar", name: "Avatar", base: 'role="img" と <img>', js: "不要" },
      { id: "kbd", name: "Kbd", base: "<kbd>", js: "不要" },
      { id: "table", name: "Table", base: "<table> と <caption>", js: "不要" },
      { id: "chart", name: "Chart", base: "HTML と CSS、数字は table", js: "不要" },
      { id: "item", name: "Item", base: "<ul> と <li>", js: "不要" },
      { id: "tabs", name: "Tabs", base: "ARIA tabs をサーバーで描画", js: "切り替えに必要" },
      { id: "accordion", name: "Accordion", base: "<details name>", js: "不要" },
      { id: "collapsible", name: "Collapsible", base: "<details>", js: "不要" },
      { id: "separator", name: "Separator", base: "<hr>", js: "不要" },
      { id: "aspect-ratio", name: "AspectRatio", base: "aspect-ratio", js: "不要" },
      { id: "scroll-area", name: "ScrollArea", base: 'role="region"', js: "不要" },
      { id: "resizable", name: "Resizable", base: 'role="separator" と grid', js: "幅を変えるのに必要" },
      { id: "carousel", name: "Carousel", base: "::scroll-marker", js: "不要" },
    ],
  },
  {
    label: "状態",
    entries: [
      { id: "alert", name: "Alert", base: "見出しのある面", js: "不要" },
      { id: "progress", name: "Progress", base: "<progress>", js: "不要" },
      { id: "meter", name: "Meter", base: "<meter>", js: "不要" },
      { id: "spinner", name: "Spinner", base: 'role="status"', js: "不要" },
      { id: "skeleton", name: "Skeleton", base: "CSS のみ", js: "不要" },
      { id: "empty", name: "Empty", base: "CSS のみ", js: "不要" },
    ],
  },
  {
    label: "ナビゲーション",
    entries: [
      { id: "breadcrumb", name: "Breadcrumb", base: "<nav> と <ol>", js: "不要" },
      { id: "pagination", name: "Pagination", base: "<nav> とリンク", js: "不要" },
      { id: "steps", name: "Steps", base: 'aria-current="step"', js: "不要" },
      { id: "sidebar", name: "Sidebar", base: "<nav> と <details>", js: "不要" },
    ],
  },
  {
    label: "重なり",
    entries: [
      { id: "dialog", name: "Dialog", base: "<dialog> と command", js: "不要" },
      { id: "alert-dialog", name: "AlertDialog", base: 'role="alertdialog"', js: "不要" },
      { id: "sheet", name: "Sheet", base: "<dialog> と command", js: "不要" },
      { id: "drawer", name: "Drawer", base: "<dialog> と command", js: "引いて閉じるのに必要" },
      { id: "popover", name: "Popover", base: "popover とアンカー配置", js: "不要" },
      { id: "hover-card", name: "HoverCard", base: "popover と interestfor", js: "Chromium 以外で必要" },
      { id: "tooltip", name: "Tooltip", base: 'popover="hint" と interestfor', js: "Chromium 以外で必要" },
      { id: "toast", name: "Toast", base: 'popover="manual" と aria-live', js: "表示に必要" },
    ],
  },
];
const byId = Object.fromEntries(groups.flatMap((g) => g.entries).map((e) => [e.id, e]));
// "Field + Input" is one entry but two components.
const count = groups.flatMap((g) => g.entries).reduce((n, e) => n + e.name.split(" + ").length, 0);

function Section({ id, summary, children }: { id: string; summary: ReactNode; children: ReactNode }) {
  const entry = byId[id];
  return (
    <section className="g-section" id={id} aria-labelledby={`${id}-heading`}>
      <header className="g-head">
        <h2 id={`${id}-heading`}>{entry.name}</h2>
        <p className="g-summary">{summary}</p>
        <dl className="g-facts">
          <div>
            <dt>土台</dt>
            <dd>
              <code>{entry.base}</code>
            </dd>
          </div>
          <div>
            <dt>JavaScript</dt>
            <dd data-needs={entry.js === "不要" ? undefined : ""}>{entry.js}</dd>
          </div>
        </dl>
      </header>
      <div className="g-stage">{children}</div>
    </section>
  );
}

function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="g-example">
      <figcaption>{label}</figcaption>
      <div className="g-demo">{children}</div>
    </figure>
  );
}

/**
 * Every component on one page. Like Showcase it uses no hooks and no event
 * handlers, so the static build renders the same tree with zero scripts.
 * `toastDemo` is the one client-only part; the static page passes a note.
 */
export function Gallery({ toastDemo }: { toastDemo: ReactNode }) {
  return (
    <div className="site gallery">
      <header className="nav wrap">
        <span className="wordmark">
          Urushi
        </span>
      </header>

      <div className="g-layout wrap">
        <nav className="g-index" aria-label="コンポーネントの一覧">
          {groups.map((g) => (
            <div key={g.label} className="g-index-group">
              <p>{g.label}</p>
              <ul>
                {g.entries.map((e) => (
                  <li key={e.id}>
                    <a href={`#${e.id}`}>{e.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <main className="g-main">
          <div className="g-intro">
            <h1>コンポーネント</h1>
            <p className="lede">
              {count} 種類。どれも Server Components のまま描画でき、多くはブラウザ標準の要素だけで動きます。上のバーでパックとテーマを切り替えると、同じコンポーネントがそのまま着せ替わります。
            </p>
          </div>

          <Section id="button" summary="押すと何かが起きる操作。ページ内で一番大事な操作にだけ primary を使います。">
            <Example label="種類">
              <div className="g-row">
                <Button variant="primary">保存する</Button>
                <Button>下書きに戻す</Button>
                <Button variant="ghost">キャンセル</Button>
                <Button variant="danger">削除する</Button>
              </div>
            </Example>
            <Example label="大きさ">
              <div className="g-row">
                <Button size="sm">小</Button>
                <Button>中</Button>
                <Button size="lg">大</Button>
              </div>
            </Example>
            <Example label="処理中">
              <div className="g-row">
                <Button variant="primary" loading data-testid="loading-button">
                  保存しています
                </Button>
              </div>
            </Example>
          </Section>

          <Section id="link" summary="別のページや場所への移動。操作には Button を使います。">
            <Example label="文中">
              <p className="g-prose">
                公開前に<Link href="#field">入力欄の書き方</Link>を確認してください。
              </p>
            </Example>
            <Example label="単独・外部">
              <div className="g-stack">
                <Link variant="standalone" href="#tabs">
                  すべてのタスクを見る
                </Link>
                <Link external href="https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog" data-testid="link-external">
                  MDN の dialog 要素
                </Link>
              </div>
            </Example>
          </Section>

          <Section id="button-group" summary="まとまりのある操作を 1 つの形につなげます。いくつかから 1 つを選ぶなら ToggleGroup を使います。">
            <Example label="関連する操作">
              <div className="g-stack">
                <ButtonGroup label="リンク" data-testid="link-actions">
                  <Button>コピー</Button>
                  <Button>共有</Button>
                  <Button>埋め込み</Button>
                </ButtonGroup>
                <ButtonGroup label="表示の大きさ">
                  <Button size="sm">縮小</Button>
                  <Button size="sm">100%</Button>
                  <Button size="sm">拡大</Button>
                </ButtonGroup>
              </div>
            </Example>
          </Section>

          <Section id="toggle" summary="押すと入り、もう一度押すと切れる。中身はチェックボックスなので、フォームで送られます。">
            <Example label="ツールバー">
              <div className="g-toolbar" role="group" aria-label="書式">
                <Toggle name="bold" aria-label="太字" defaultChecked data-testid="toggle-bold">
                  <IconBold />
                </Toggle>
                <Toggle name="italic" aria-label="斜体" data-testid="toggle-italic">
                  <IconItalic />
                </Toggle>
                <Toggle name="preview">プレビュー</Toggle>
              </div>
            </Example>
          </Section>

          <Section id="toggle-group" summary="ひと続きのボタンの形をした選択肢。1 つ選ぶならラジオ、いくつも選ぶならチェックボックスです。">
            <Example label="1 つ選ぶ">
              <ToggleGroup legend="表示" name="view" defaultValue="list" data-testid="view-group">
                <ToggleGroup.Item value="list">リスト</ToggleGroup.Item>
                <ToggleGroup.Item value="board">ボード</ToggleGroup.Item>
                <ToggleGroup.Item value="calendar">カレンダー</ToggleGroup.Item>
              </ToggleGroup>
            </Example>
            <Example label="いくつも選ぶ">
              <ToggleGroup legend="表示する曜日" name="days" type="multiple" size="sm" hideLegend={false} data-testid="days-group">
                {["月", "火", "水", "木", "金", "土", "日"].map((d, i) => (
                  <ToggleGroup.Item key={d} value={d} defaultChecked={i < 5}>
                    {d}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </Example>
          </Section>

          <Section id="menu" summary="ボタンから開く操作の一覧。開くと最初の項目にフォーカスが移り、矢印キーで選べます。">
            <Example label="行の操作">
              <div className="g-row">
                <span className="g-row-label">告知メールの文面を確定する</span>
                <Menu.Trigger menu="row-menu" variant="ghost" size="sm" aria-label="その他の操作" data-testid="menu-trigger">
                  <IconMore />
                </Menu.Trigger>
                <Menu id="row-menu" label="タスクの操作" align="end" data-testid="row-menu">
                  <Menu.Item>編集する</Menu.Item>
                  <Menu.Item>複製する</Menu.Item>
                  <Menu.Link href="#tabs">履歴を見る</Menu.Link>
                  <Menu.Separator />
                  <Menu.Item variant="danger">削除する</Menu.Item>
                </Menu>
              </div>
            </Example>
            <Example label="サブメニュー">
              <div className="g-row">
                <span className="g-row-label">申し込みページの画像を差し替える</span>
                <Menu.Trigger menu="task-menu" variant="ghost" size="sm" aria-label="タスクの操作" data-testid="sub-menu-trigger">
                  <IconMore />
                </Menu.Trigger>
                <Menu id="task-menu" label="タスクの操作" align="end" data-testid="task-menu">
                  <Menu.Item>編集する</Menu.Item>
                  <Menu.Sub label="担当者を変える" data-testid="assign-sub">
                    <Menu.Item>佐藤 美咲</Menu.Item>
                    <Menu.Item>鈴木 健太</Menu.Item>
                    <Menu.Item>高橋 陽菜</Menu.Item>
                    <Menu.Item>担当者なし</Menu.Item>
                  </Menu.Sub>
                  <Menu.Sub label="優先度" data-testid="priority-sub">
                    <Menu.Item>高</Menu.Item>
                    <Menu.Item>中</Menu.Item>
                    <Menu.Item>低</Menu.Item>
                  </Menu.Sub>
                  <Menu.Separator />
                  <Menu.Item variant="danger">削除する</Menu.Item>
                </Menu>
              </div>
            </Example>
          </Section>

          <Section id="context-menu" summary="右クリック・長押し・Shift+F10 で、押した場所に出る操作の一覧。中身は Menu と同じで、同じ操作はほかの方法でもできるようにします。">
            <Example label="ファイルの操作">
              <ContextMenu.Area menu="file-menu" data-testid="file-area">
                <div className="g-files">
                  <p className="g-files-hint">ファイルを右クリックするか、選んで Shift+F10 を押します。</p>
                  <ul>
                    {["企画書.pdf", "見積もり.xlsx", "打ち合わせメモ.md"].map((name) => (
                      <li key={name}>
                        <button type="button">{name}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </ContextMenu.Area>
              <ContextMenu id="file-menu" label="ファイルの操作" data-testid="file-menu">
                <Menu.Item>開く</Menu.Item>
                <Menu.Item shortcut="F2">名前を変更</Menu.Item>
                <Menu.Item>複製</Menu.Item>
                <Menu.Sub label="移動" data-testid="move-sub">
                  <Menu.Item>仕事</Menu.Item>
                  <Menu.Item>個人</Menu.Item>
                  <Menu.Item>アーカイブ</Menu.Item>
                </Menu.Sub>
                <Menu.Separator />
                <Menu.Item variant="danger">削除</Menu.Item>
              </ContextMenu>
            </Example>
          </Section>

          <Section id="menubar" summary="アプリの上に並ぶメニュー（ファイル・編集・表示）。左右の矢印でメニューを移り、開いたまま隣に動くと切り替わります。">
            <Example label="ノートアプリ">
              <Menubar label="ノートのメニュー" data-testid="menubar">
                <Menubar.Menu label="ファイル">
                  <Menu.Item shortcut="⌘N">新しいノート</Menu.Item>
                  <Menu.Item shortcut="⌘O">開く…</Menu.Item>
                  <Menu.Sub label="書き出す">
                    <Menu.Item>PDF</Menu.Item>
                    <Menu.Item>Markdown</Menu.Item>
                  </Menu.Sub>
                  <Menu.Separator />
                  <Menu.Item shortcut="⌘P">印刷…</Menu.Item>
                </Menubar.Menu>
                <Menubar.Menu label="編集">
                  <Menu.Item shortcut="⌘Z">元に戻す</Menu.Item>
                  <Menu.Item shortcut="⇧⌘Z">やり直す</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item shortcut="⌘X">切り取り</Menu.Item>
                  <Menu.Item shortcut="⌘C">コピー</Menu.Item>
                  <Menu.Item shortcut="⌘V">貼り付け</Menu.Item>
                </Menubar.Menu>
                <Menubar.Menu label="表示">
                  <Menu.Item>目次を表示</Menu.Item>
                  <Menu.Item shortcut="⌘+">文字を大きく</Menu.Item>
                  <Menu.Item shortcut="⌘−">文字を小さく</Menu.Item>
                </Menubar.Menu>
                <Menubar.Menu label="ヘルプ">
                  <Menu.Item shortcut="?">ショートカット一覧</Menu.Item>
                  <Menu.Link href="#menubar">使い方のガイド</Menu.Link>
                </Menubar.Menu>
              </Menubar>
            </Example>
          </Section>

          <Section id="field" summary="ラベル・説明・エラーを入力欄に結びつけます。結びつけは Field が行うので、書き忘れがありません。">
            <Example label="基本">
              <div className="g-form">
                <Field id="g-name" label="氏名" required>
                  <Input autoComplete="name" placeholder="山田 花子" />
                </Field>
                <Field id="g-email" label="メールアドレス" description="受付完了のお知らせを送ります。">
                  <Input type="email" autoComplete="email" placeholder="hanako@example.jp" />
                </Field>
              </div>
            </Example>
            <Example label="エラー">
              <div className="g-form">
                <Field id="g-code" label="招待コード" error="コードが見つかりません。メールに書かれた 8 桁の英数字を入れてください。">
                  <Input defaultValue="AB12" spellCheck={false} />
                </Field>
              </div>
            </Example>
            <Example label="大きさ">
              <div className="g-row g-row-fill">
                <Field id="g-size-sm" label="小" hideLabel>
                  <Input size="sm" placeholder="小" />
                </Field>
                <Field id="g-size-md" label="中" hideLabel>
                  <Input placeholder="中" />
                </Field>
                <Field id="g-size-lg" label="大" hideLabel>
                  <Input size="lg" placeholder="大" />
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="form" summary="送信したときの入力エラーを、各欄の下と上のまとめに出します。まとめのリンクで欄に移れます。JavaScript がないときはブラウザの吹き出しになります。">
            <Example label="登録">
              <Form id="g-signup" data-testid="signup" onSubmit={(e) => { e.preventDefault(); e.currentTarget.dataset.sent = ""; }}>
                <Field id="g-signup-name" label="名前" required>
                  <Input autoComplete="name" />
                </Field>
                <Field id="g-signup-email" label="連絡先のメールアドレス" required>
                  <Input type="email" autoComplete="email" />
                </Field>
                <Field id="g-signup-age" label="年齢" description="18 歳以上">
                  <Input type="number" min={18} inputMode="numeric" />
                </Field>
                <div className="g-row">
                  <Button type="submit" variant="primary">登録する</Button>
                </div>
              </Form>
            </Example>
          </Section>

          <Section id="input-group" summary="入力欄の前後に決まった文字やボタンをつなげます。Field の中に置けば、ラベルや説明は中の Input に結びつきます。">
            <Example label="前置きと単位">
              <div className="g-form">
                <Field id="g-site" label="サイトの URL" description="https:// は入れなくてかまいません。">
                  <InputGroup>
                    <InputGroup.Addon>https://</InputGroup.Addon>
                    <Input placeholder="example.jp" data-testid="site-url" />
                  </InputGroup>
                </Field>
                <Field id="g-budget" label="予算（円）">
                  <InputGroup>
                    <Input inputMode="numeric" placeholder="50000" />
                    <InputGroup.Addon>円</InputGroup.Addon>
                  </InputGroup>
                </Field>
              </div>
            </Example>
            <Example label="ボタン付き">
              <div className="g-form">
                <Field id="g-invite-to" label="招待するメールアドレス" error="メールアドレスの形になっていません。">
                  <InputGroup>
                    <Input type="email" defaultValue="hanako@" />
                    <Button>招待</Button>
                  </InputGroup>
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="textarea" summary="複数行の入力。対応ブラウザでは入力に合わせて高さが伸びます（スクリプトなし）。">
            <Example label="自動で伸びる">
              <div className="g-form">
                <Field id="g-notes" label="備考" description="改行できます。">
                  <Textarea placeholder="当日の持ち物や集合場所など" data-testid="notes" />
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="select" summary="決まった選択肢から 1 つ選ぶ。base-select に対応したブラウザでは、開いた一覧もパックの見た目になります。">
            <Example label="基本">
              <div className="g-form">
                <Field id="g-assignee" label="担当者">
                  <Select placeholder="選んでください" data-testid="assignee">
                    <option value="sato">佐藤 美咲</option>
                    <option value="suzuki">鈴木 健太</option>
                    <option value="takahashi">高橋 陽菜</option>
                  </Select>
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="checkbox" summary="オン・オフを個別に選ぶ。ラベル全体が押せる範囲です。">
            <Example label="基本">
              <div className="g-stack">
                <Checkbox id="g-agree" name="agree" data-testid="agree">
                  利用規約に同意する
                </Checkbox>
                <Checkbox id="g-remind" defaultChecked description="締め切りの 1 日前にお知らせします。">
                  リマインダーを受け取る
                </Checkbox>
                <Checkbox disabled>管理者だけが変更できます</Checkbox>
              </div>
            </Example>
          </Section>

          <Section id="switch" summary="押した瞬間に反映される設定。保存ボタンが必要なら Checkbox を使います。">
            <Example label="基本">
              <div className="g-stack">
                <Switch id="g-notify" defaultChecked description="新しいコメントが付いたときに届きます。" data-testid="notify">
                  メール通知
                </Switch>
                <Switch id="g-weekend">週末も通知する</Switch>
              </div>
            </Example>
          </Section>

          <Section id="radio-group" summary="いくつかの中から 1 つ選ぶ。グループ内は矢印キーで移動します（ブラウザ標準の動き）。">
            <Example label="説明つき">
              <RadioGroup name="visibility" legend="公開範囲" defaultValue="team">
                <RadioGroup.Item id="vis-all" value="all" description="URL を知っている人なら誰でも見られます。">
                  全員
                </RadioGroup.Item>
                <RadioGroup.Item id="vis-team" value="team" description="チームのメンバーだけが見られます。">
                  チーム内
                </RadioGroup.Item>
                <RadioGroup.Item value="me">自分のみ</RadioGroup.Item>
              </RadioGroup>
            </Example>
            <Example label="横並び">
              <RadioGroup name="priority" legend="優先度" orientation="horizontal" defaultValue="mid">
                <RadioGroup.Item value="high">高</RadioGroup.Item>
                <RadioGroup.Item value="mid">中</RadioGroup.Item>
                <RadioGroup.Item value="low">低</RadioGroup.Item>
              </RadioGroup>
            </Example>
          </Section>

          <Section id="slider" summary="だいたいの量を選ぶ。正確な数が大事なら Input を使います。">
            <Example label="音量">
              <div className="g-form">
                <Field id="g-volume" label="通知音の大きさ">
                  <Slider min={0} max={100} defaultValue={60} data-testid="volume" />
                </Field>
                <Field id="g-density" label="表示の密度" description="左ほど詰め、右ほどゆったり表示します。">
                  <Slider min={1} max={3} step={1} defaultValue={2} />
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="date-input" summary="日付や時刻。ブラウザ自身のピッカーが開き、表示の形は利用者の言語設定に従います。">
            <Example label="日付と時刻">
              <div className="g-form">
                <Field id="g-due" label="期限">
                  <DateInput defaultValue="2026-10-30" min="2026-10-01" data-testid="due" />
                </Field>
                <Field id="g-start" label="開始時刻">
                  <DateInput type="time" defaultValue="13:00" />
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="file-input" summary="ファイルの添付。dropzone はファイルを落とせる大きな的になります（スクリプトなし）。">
            <Example label="既定">
              <div className="g-form">
                <Field id="g-photo" label="プロフィール写真" description="PNG か JPEG、5 MB まで。">
                  <FileInput accept="image/png, image/jpeg" data-testid="photo" />
                </Field>
              </div>
            </Example>
            <Example label="dropzone">
              <div className="g-form">
                <Field id="g-files" label="添付ファイル" description="ここにファイルを落とすか、押して選びます。">
                  <FileInput variant="dropzone" multiple />
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="otp-input" summary="ワンタイムコード。1 つの入力欄を桁ごとの枠に描くので、貼り付けや読み上げはふつうの入力欄と同じです。">
            <Example label="6 桁">
              <div className="g-form">
                <Field id="g-otp" label="確認コード" description="メールに届いた 6 桁の数字を入れてください。">
                  <OTPInput data-testid="otp" />
                </Field>
              </div>
            </Example>
          </Section>

          <Section id="card" summary="まとまった内容の入れ物。見出しレベルを指定して、ページの見出し構造を崩さないようにします。">
            <Example label="操作つき">
              <div className="g-card-grid">
                <Card
                  title="秋のオープンキャンパス"
                  description="10 月 26 日（日）13:00〜 本館 3 階"
                  footer={
                    <>
                      <Button variant="ghost" size="sm">
                        あとで
                      </Button>
                      <Button variant="primary" size="sm">
                        参加する
                      </Button>
                    </>
                  }
                >
                  <p>模擬授業と在学生の座談会があります。保護者の方も参加できます。</p>
                </Card>
                <Card title="今週の進み具合" padding="lg">
                  <p className="g-stat">
                    <b>12</b> / 18 件
                  </p>
                </Card>
              </div>
            </Example>
          </Section>

          <Section id="badge" summary="状態や件数を短く示すラベル。色だけに頼らず、言葉で伝えます。">
            <Example label="トーン">
              <div className="g-row">
                <Badge>下書き</Badge>
                <Badge tone="accent">新着</Badge>
                <Badge tone="ok" dot>
                  公開中
                </Badge>
                <Badge tone="danger" dot>
                  期限切れ
                </Badge>
              </div>
            </Example>
          </Section>

          <Section id="avatar" summary="人を示す写真。写真がないときや読み込めないときは、名前の頭文字を出します。">
            <Example label="大きさ">
              <div className="g-row">
                <Avatar name="佐藤 美咲" size="sm" />
                <Avatar name="鈴木 健太" />
                <Avatar name="Hana Takahashi" size="lg" data-testid="avatar-latin" />
                <Avatar name="写真が読めない人" src="/missing-photo.jpg" data-testid="avatar-broken" />
              </div>
            </Example>
          </Section>

          <Section id="kbd" summary="キーやショートカット。組み合わせは Kbd を並べます。">
            <Example label="文中">
              <p className="g-prose">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd> でコマンドを開き、<Kbd>Esc</Kbd> で閉じます。
              </p>
            </Example>
          </Section>

          <Section id="table" summary="同じ列で項目を比べる。caption が表の名前になり、幅が足りないときは表だけが横にスクロールします。">
            <Example label="一覧">
              <Table caption="今週のタスク" data-testid="tasks-table">
                <thead>
                  <tr>
                    <th scope="col">タスク</th>
                    <th scope="col">担当</th>
                    <th scope="col">期限</th>
                    <th scope="col">状態</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>告知メールの文面を確定する</td>
                    <td>佐藤</td>
                    <td>10/24</td>
                    <td>
                      <Badge tone="accent">対応中</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>SNS 広告を入稿する</td>
                    <td>鈴木</td>
                    <td>10/21</td>
                    <td>
                      <Badge tone="danger">期限切れ</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>申し込みページの画像を差し替える</td>
                    <td>高橋</td>
                    <td>10/25</td>
                    <td>
                      <Badge>未着手</Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Example>
            <Example label="詰めて縞">
              <Table caption="参加者" hideCaption density="compact" striped>
                <thead>
                  <tr>
                    <th scope="col">名前</th>
                    <th scope="col">チーム</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">佐藤 美咲</th>
                    <td>広報</td>
                  </tr>
                  <tr>
                    <th scope="row">鈴木 健太</th>
                    <td>営業</td>
                  </tr>
                  <tr>
                    <th scope="row">高橋 陽菜</th>
                    <td>開発</td>
                  </tr>
                </tbody>
              </Table>
            </Example>
          </Section>

          <Section id="chart" summary="棒グラフと折れ線グラフ。見てほしい系列だけがアクセント色で、ほかは灰色です。数字は読み上げ用の表にもなり、列に乗せると値が出ます。">
            <Example label="棒">
              <Chart data-testid="sales-chart" title="月ごとの売上（万円）" unit="万円" labels={["6月", "7月", "8月", "9月", "10月", "11月"]} series={[{ name: "今年", values: [42, 51, 47, 63, 71, 78] }, { name: "去年", values: [38, 40, 45, 49, 52, 58] }]} />
            </Example>
            <Example label="折れ線">
              <Chart type="line" title="週ごとの訪問者（千人）" unit="千人" labels={["1週", "2週", "3週", "4週", "5週"]} series={[{ name: "サイト", values: [12.4, 14.1, 13.2, 17.8, 19.5] }, { name: "アプリ", values: [6.1, 6.8, 8.4, 8.2, 9.9] }]} />
            </Example>
          </Section>

          <Section id="item" summary="一覧の 1 行。アイコン・題・説明と、操作を 1 つ置きます。href を渡すと行全体がリンクになります。">
            <Example label="設定">
              <Item.Group label="アカウントの設定" data-testid="item-group">
                <Item icon={<IconPeople />} title="表示名" description="山田 花子" action={<Button size="sm" variant="secondary">変更</Button>} />
                <Item icon={<IconCalendar />} title="締め切りの前日に知らせる" description="メールとアプリの通知で送ります" action={<Switch aria-label="締め切りの前日に知らせる" defaultChecked />} />
                <Item icon={<IconTasks />} title="完了したタスク" description="128 件" href="#item" data-testid="item-link" />
              </Item.Group>
            </Example>
            <Example label="Card の中（plain）">
              <Card title="メンバー" headingLevel="h3">
                <Item.Group label="メンバー" variant="plain">
                  <Item title="佐藤 美咲" description="管理者" action={<Badge>オーナー</Badge>} />
                  <Item title="鈴木 健太" description="編集者" action={<Button size="sm" variant="ghost">外す</Button>} />
                </Item.Group>
              </Card>
            </Example>
          </Section>

          <Section id="tabs" summary="同じ場所で内容を切り替える。選ばれたタブはサーバーで決まり、切り替えと矢印キーはランタイムが担います。">
            <Example label="基本">
              <Tabs id="project-tabs" label="プロジェクト" defaultValue="overview">
                <Tabs.List>
                  <Tabs.Tab value="overview">概要</Tabs.Tab>
                  <Tabs.Tab value="tasks">タスク</Tabs.Tab>
                  <Tabs.Tab value="members">メンバー</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="overview">
                  <p className="g-prose">秋のキャンペーンの告知から申し込み受付までをまとめたプロジェクトです。</p>
                </Tabs.Panel>
                <Tabs.Panel value="tasks">
                  <p className="g-prose">未完了のタスクが 4 件あります。いちばん近い締め切りは 10 月 24 日です。</p>
                </Tabs.Panel>
                <Tabs.Panel value="members">
                  <p className="g-prose">佐藤・鈴木・高橋の 3 人が参加しています。</p>
                </Tabs.Panel>
              </Tabs>
            </Example>
          </Section>

          <Section id="accordion" summary="見出しを押すと中身が開く。name を渡すと、1 つ開くとほかが閉じます。">
            <Example label="1 つだけ開く">
              <Accordion name="faq" data-testid="faq">
                <Accordion.Item title="JavaScript を切っても動きますか？" defaultOpen>
                  動きます。開閉はブラウザの details 要素がしています。
                </Accordion.Item>
                <Accordion.Item title="1 つだけ開くようにするには？">
                  Accordion に name を渡します。同じ name の項目は、ブラウザが自動で 1 つだけ開いた状態に保ちます。
                </Accordion.Item>
                <Accordion.Item title="開くときに動きはありますか？">
                  対応するブラウザでは高さがなめらかに変わります。動きを減らす設定にしていると、すぐに開きます。
                </Accordion.Item>
              </Accordion>
            </Example>
          </Section>

          <Section id="collapsible" summary="1 つの区画を開け閉めする details。区画がいくつも並ぶなら Accordion を使います。">
            <Example label="詳しい設定">
              <div className="g-wide">
                <Collapsible title="詳細な設定" data-testid="collapsible">
                  <div className="g-stack">
                    <Checkbox>完了したタスクを 30 日後に自動でアーカイブする</Checkbox>
                    <Checkbox>週末も締め切りの通知を送る</Checkbox>
                  </div>
                </Collapsible>
              </div>
            </Example>
          </Section>

          <Section id="separator" summary="内容の区切り。飾りだけのときは decorative にして、読み上げから外します。">
            <Example label="横と縦">
              <div className="g-stack">
                <p className="g-prose">締め切りが近いタスク</p>
                <Separator decorative />
                <div className="g-toolbar" role="group" aria-label="書式">
                  <Tooltip.Trigger tooltip="tip-bold" variant="ghost" size="sm" aria-label="太字">
                    <IconBold />
                  </Tooltip.Trigger>
                  <Tooltip id="tip-bold">⌘B</Tooltip>
                  <Tooltip.Trigger tooltip="tip-list" variant="ghost" size="sm" aria-label="箇条書き">
                    <IconList />
                  </Tooltip.Trigger>
                  <Tooltip id="tip-list">⌘⇧8</Tooltip>
                  <Separator orientation="vertical" />
                  <Button variant="ghost" size="sm">
                    元に戻す
                  </Button>
                </div>
              </div>
            </Example>
          </Section>

          <Section id="aspect-ratio" summary="縦横比を保つ箱。中の画像や動画は箱いっぱいに広がります。">
            <Example label="16:9 と 1:1">
              <div className="g-media">
                <AspectRatio ratio="16 / 9">
                  <svg viewBox="0 0 160 90" role="img" aria-label="会場の写真（見本）">
                    <rect width="160" height="90" fill="var(--ur-color-track)" />
                    <path d="M0 90 52 42l30 28 20-16 58 36z" fill="var(--ur-color-surface)" opacity="0.7" />
                  </svg>
                </AspectRatio>
                <AspectRatio ratio="1 / 1">
                  <svg viewBox="0 0 90 90" role="img" aria-label="正方形の写真（見本）">
                    <rect width="90" height="90" fill="var(--ur-color-skeleton)" />
                    <path d="M0 90 35 45l20 22 12-12 23 35z" fill="var(--ur-color-surface)" opacity="0.7" />
                  </svg>
                </AspectRatio>
              </div>
            </Example>
          </Section>

          <Section id="scroll-area" summary="名前の付いたスクロール領域。フォーカスできるので、キーボードでもスクロールできます。">
            <Example label="長い一覧">
              <ScrollArea label="参加者" style={{ blockSize: 180, maxInlineSize: 320 }} data-testid="people-scroll">
                <ul className="g-people">
                  {["佐藤 美咲", "鈴木 健太", "高橋 陽菜", "田中 大輝", "伊藤 結衣", "渡辺 蓮", "山本 葵", "中村 悠斗"].map((name) => (
                    <li key={name}>
                      <Avatar name={name} size="sm" />
                      {name}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </Example>
          </Section>

          <Section id="resizable" summary="2 つの区画を区切りで分け、区切りをドラッグするか ← → で幅を変えます。JavaScript がないときは最初の幅のままです。">
            <Example label="一覧と本文">
              <div className="g-split" data-testid="split">
                <Resizable defaultSize={38} min={25} max={70}>
                  <Resizable.Panel>
                    <ul className="g-mails">
                      <li aria-current="true"><b>佐藤 美咲</b><span>告知メールの文面</span></li>
                      <li><b>鈴木 健太</b><span>画像の差し替え</span></li>
                      <li><b>高橋 陽子</b><span>来週の打ち合わせ</span></li>
                    </ul>
                  </Resizable.Panel>
                  <Resizable.Handle label="一覧の幅" />
                  <Resizable.Panel>
                    <div className="g-mail-body">
                      <b>告知メールの文面</b>
                      <p>最終版を共有します。件名だけもう一度確認させてください。</p>
                    </div>
                  </Resizable.Panel>
                </Resizable>
              </div>
            </Example>
            <Example label="上下（grip）">
              <div className="g-split g-split-tall">
                <Resizable orientation="vertical" defaultSize={55}>
                  <Resizable.Panel>
                    <div className="g-mail-body"><b>エディター</b><p>ここに本文を書きます。</p></div>
                  </Resizable.Panel>
                  <Resizable.Handle label="エディターの高さ" grip />
                  <Resizable.Panel>
                    <div className="g-mail-body"><b>プレビュー</b><p>書いた内容がここに出ます。</p></div>
                  </Resizable.Panel>
                </Resizable>
              </div>
            </Example>
          </Section>

          <Section id="carousel" summary="横にスクロールして順に見せるスライド。勝手には動かず、対応ブラウザでは前後のボタンと点をブラウザが足します。">
            <Example label="写真">
              <div style={{ maxInlineSize: 440 }}>
                <Carousel label="会場の写真" data-testid="carousel">
                  {["受付", "講演", "交流会", "片付け"].map((title, i) => (
                    <Carousel.Item key={title}>
                      <AspectRatio ratio="16 / 9">
                        <svg viewBox="0 0 160 90" role="img" aria-label={`${title}の様子（見本）`}>
                          <rect width="160" height="90" fill={i % 2 ? "var(--ur-color-skeleton)" : "var(--ur-color-track)"} />
                          <text x="80" y="50" textAnchor="middle" fontSize="12" fill="var(--ur-color-text-muted)">
                            {title}
                          </text>
                        </svg>
                      </AspectRatio>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </Example>
          </Section>

          <Section id="alert" summary="ページに置いておく知らせ。見出しで言い切り、トーンの色とアイコンは補うだけです。">
            <Example label="トーン">
              <div className="g-wide">
                <Alert title="下書きは 30 日後に消えます" />
                <Alert tone="accent" title="10 月 30 日 2:00〜4:00 にメンテナンスを行います">
                  この間は申し込みを受け付けられません。
                </Alert>
                <Alert tone="ok" title="すべてのタスクが完了しました" />
                <Alert
                  tone="warning"
                  title="無料プランの上限まで、あと 3 件です"
                  action={
                    <Link variant="standalone" href="#plans">
                      プランを見る
                    </Link>
                  }
                />
                <Alert tone="danger" title="支払いに失敗しました" data-testid="alert-danger">
                  カードの有効期限を確かめて、もう一度お試しください。
                </Alert>
              </div>
            </Example>
          </Section>

          <Section id="progress" summary="作業がどこまで進んだか。合計がまだわからない間は value を省くと、流れる表示になります。">
            <Example label="割合と不定">
              <div className="g-form">
                <Progress label="写真をアップロード中" value={42} data-testid="upload-progress" />
                <Progress label="データを読み込んでいます" />
              </div>
            </Example>
          </Section>

          <Section id="meter" summary="決まった範囲の中の量。optimum からどれだけ離れているかで、ブラウザが色を決めます。">
            <Example label="容量と上限">
              <div className="g-form">
                <Meter label="使用容量" value={3.2} max={10} high={8} optimum={0} valueText="3.2 GB / 10 GB" data-testid="storage" />
                <Meter label="今月の送信数" value={640} max={1000} low={500} high={800} optimum={0} valueText="640 / 1,000 通" />
                <Meter label="ストレージの空き" value={4} max={100} low={10} high={50} optimum={100} valueText="残り 4%" />
              </div>
            </Example>
          </Section>

          <Section id="spinner" summary="処理中であることを示す。読み上げでは label の文言が伝わります。">
            <Example label="大きさ">
              <div className="g-row">
                <Spinner size="sm" />
                <Spinner />
                <Spinner size="lg" label="アップロード中" data-testid="spinner-lg" />
              </div>
            </Example>
          </Section>

          <Section id="skeleton" summary="読み込み中の場所取り。読み上げからは外れるので、状態は Spinner などで伝えます。">
            <Example label="カードの読み込み">
              <div className="g-skeleton">
                <Skeleton shape="circle" />
                <div className="g-skeleton-text">
                  <Skeleton shape="text" lines={3} />
                </div>
              </div>
            </Example>
          </Section>

          <Section id="empty" summary="一覧にまだ何もないとき。何が空で、どう始めればよいかを示します。">
            <Example label="最初の画面">
              <Empty
                icon={<IconPlus />}
                title="まだタスクがありません"
                description="最初のタスクを追加すると、ここに並びます。"
                action={<Button variant="primary">タスクを追加</Button>}
              />
            </Example>
          </Section>

          <Section id="breadcrumb" summary="今のページがサイトのどこにあるか。区切りの印は CSS で描き、読み上げません。">
            <Example label="3 階層">
              <Breadcrumb data-testid="breadcrumb">
                <Breadcrumb.Item href="#home">ホーム</Breadcrumb.Item>
                <Breadcrumb.Item href="#settings">設定</Breadcrumb.Item>
                <Breadcrumb.Item current>通知</Breadcrumb.Item>
              </Breadcrumb>
            </Example>
          </Section>

          <Section id="pagination" summary="長い一覧のページ送り。すべてふつうのリンクで、href は URL の型から作ります。">
            <Example label="12 ページ">
              <Pagination page={6} total={12} href="#page-{page}" data-testid="pagination" />
            </Example>
            <Example label="3 ページ">
              <Pagination page={1} total={3} href="#page-{page}" label="ページ送り（短い一覧）" />
            </Example>
          </Section>

          <Section id="steps" summary="決まった手順のどこにいるか。今の手順に aria-current が付き、状態は言葉でも読み上げます。">
            <Example label="横">
              <Steps label="申し込みの手順" data-testid="steps">
                <Steps.Item title="アカウント" status="done" />
                <Steps.Item title="お支払い" status="current" />
                <Steps.Item title="確認" />
              </Steps>
            </Example>
            <Example label="縦">
              <Steps label="初期設定" orientation="vertical">
                <Steps.Item title="チームを作る" description="名前とアイコンを決めます。" status="done" />
                <Steps.Item title="メンバーを招待する" description="メールで招待を送ります。" status="current" />
                <Steps.Item title="最初のプロジェクトを作る" />
              </Steps>
            </Example>
          </Section>

          <Section id="sidebar" summary="アプリの主なナビゲーション。グループは details で畳めます（スクリプトなし）。">
            <Example label="グループ">
              <div className="g-sidebar">
                <Sidebar label="メイン" data-testid="sidebar">
                  <Sidebar.Group title="プロジェクト">
                    <Sidebar.Item href="#tasks" icon={<IconTasks />} current>
                      タスク
                    </Sidebar.Item>
                    <Sidebar.Item href="#calendar" icon={<IconCalendar />}>
                      カレンダー
                    </Sidebar.Item>
                    <Sidebar.Item href="#members" icon={<IconPeople />}>
                      メンバー
                    </Sidebar.Item>
                  </Sidebar.Group>
                  <Sidebar.Group title="アーカイブ" collapsible defaultOpen={false}>
                    <Sidebar.Item href="#spring">春のキャンペーン</Sidebar.Item>
                    <Sidebar.Item href="#year-end">年末セール</Sidebar.Item>
                  </Sidebar.Group>
                </Sidebar>
              </div>
            </Example>
          </Section>

          <Section id="dialog" summary="作業を止めて確認や入力を求める。開いている間、背景は操作もスクロールもできません。">
            <Example label="フォーム">
              <div className="g-row">
                <Dialog.Trigger dialog="g-invite" variant="primary" data-testid="open-invite">
                  メンバーを招待
                </Dialog.Trigger>
              </div>
              <Dialog id="g-invite" title="メンバーを招待" description="招待メールが届き、リンクから参加できます。">
                <form method="dialog" className="g-dialog-form">
                  <Field id="g-invite-email" label="メールアドレス" required>
                    <Input type="email" autoComplete="off" placeholder="name@example.jp" />
                  </Field>
                  <Dialog.Actions>
                    <Dialog.Close dialog="g-invite" variant="ghost">
                      キャンセル
                    </Dialog.Close>
                    <Button variant="primary" type="submit">
                      招待を送る
                    </Button>
                  </Dialog.Actions>
                </form>
              </Dialog>
            </Example>
          </Section>

          <Section id="alert-dialog" summary="取り消せない操作の確認。Esc でも外側でも閉じず、最初のフォーカスはキャンセルに置かれます。">
            <Example label="削除の確認">
              <div className="g-row">
                <AlertDialog.Trigger alertDialog="g-delete" variant="danger" data-testid="open-delete">
                  プロジェクトを削除
                </AlertDialog.Trigger>
              </div>
              <AlertDialog
                id="g-delete"
                title="「秋のキャンペーン」を削除しますか？"
                description="タスク 5 件とコメントがすべて消えます。この操作は取り消せません。"
                data-testid="delete-dialog"
              >
                <AlertDialog.Cancel alertDialog="g-delete" data-testid="delete-cancel">
                  キャンセル
                </AlertDialog.Cancel>
                <AlertDialog.Action alertDialog="g-delete">削除する</AlertDialog.Action>
              </AlertDialog>
            </Example>
          </Section>

          <Section id="sheet" summary="画面の端から滑り出るダイアログ。左右は書字方向に従います。">
            <Example label="端">
              <div className="g-row">
                <Sheet.Trigger sheet="g-task-sheet" data-testid="open-sheet">
                  タスクを編集
                </Sheet.Trigger>
                <Sheet.Trigger sheet="g-nav-sheet" variant="ghost" data-testid="open-nav-sheet">
                  メニュー
                </Sheet.Trigger>
              </div>
              <Sheet id="g-task-sheet" title="タスクを編集" description="変更は保存するまで反映されません。" data-testid="task-sheet">
                <form method="dialog" className="g-dialog-form">
                  <Field id="g-sheet-title" label="タスク名" required>
                    <Input defaultValue="告知メールの文面を確定する" />
                  </Field>
                  <Dialog.Actions>
                    <Sheet.Close sheet="g-task-sheet" variant="ghost">
                      キャンセル
                    </Sheet.Close>
                    <Button variant="primary" type="submit">
                      保存
                    </Button>
                  </Dialog.Actions>
                </form>
              </Sheet>
              <Sheet id="g-nav-sheet" title="メニュー" side="start" size="sm" data-testid="nav-sheet">
                <Sidebar label="メニュー">
                  <Sidebar.Group title="プロジェクト">
                    <Sidebar.Item href="#tasks" current>
                      タスク
                    </Sidebar.Item>
                    <Sidebar.Item href="#calendar">カレンダー</Sidebar.Item>
                  </Sidebar.Group>
                </Sidebar>
              </Sheet>
            </Example>
          </Section>

          <Section id="drawer" summary="下から出るシート。つまみか見出しを下に引くと閉じます。Esc・外側・閉じるボタンでも閉じます。">
            <Example label="スマホ向けのフォーム">
              <Drawer.Trigger drawer="g-drawer" variant="primary" data-testid="open-drawer">
                予定を追加
              </Drawer.Trigger>
              <Drawer id="g-drawer" title="予定を追加" description="あとから変更できます。" data-testid="drawer">
                <form method="dialog" className="g-dialog-form">
                  <Field id="g-drawer-event" label="題名" required>
                    <Input defaultValue="デザインの確認" />
                  </Field>
                  <Dialog.Actions>
                    <Drawer.Close drawer="g-drawer" variant="ghost">
                      やめる
                    </Drawer.Close>
                    <Button variant="primary" type="submit">
                      追加する
                    </Button>
                  </Dialog.Actions>
                </form>
              </Drawer>
            </Example>
          </Section>

          <Section id="popover" summary="ボタンの近くに出る小さなパネル。外側を押すか Esc で閉じます。">
            <Example label="設定">
              <div className="g-row">
                <Popover.Trigger popover="g-display" data-testid="open-display">
                  表示設定
                </Popover.Trigger>
                <Popover id="g-display" title="表示設定">
                  <div className="g-stack">
                    <Switch id="g-compact">行を詰めて表示</Switch>
                    <Switch id="g-done" defaultChecked>
                      完了したタスクも表示
                    </Switch>
                  </div>
                </Popover>
              </div>
            </Example>
          </Section>

          <Section id="hover-card" summary="リンクの先をのぞき見るカード。ホバーかキーボードのフォーカスで出て、ポインタをカードに移しても消えません。">
            <Example label="人">
              <p className="g-prose">
                担当は{" "}
                <HoverCard.Trigger hoverCard="g-person" href="#sato" data-testid="hc-trigger">
                  佐藤 美咲
                </HoverCard.Trigger>{" "}
                さんです。
              </p>
              <HoverCard id="g-person" data-testid="hc-card">
                <span className="g-person">
                  <Avatar name="佐藤 美咲" size="lg" />
                  <span className="g-person-text">
                    <b>佐藤 美咲</b>
                    <span>広報チーム・担当タスク 4 件</span>
                    <Link variant="standalone" href="#sato" data-testid="hc-link">
                      プロフィールを見る
                    </Link>
                  </span>
                </span>
              </HoverCard>
            </Example>
          </Section>

          <Section id="tooltip" summary="ボタンの補足。ホバーかキーボードのフォーカスで出ます。名前の代わりにはせず、アイコンだけのボタンには aria-label を付けます。">
            <Example label="アイコンボタン">
              <div className="g-row">
                <Tooltip.Trigger tooltip="tip-copy" variant="ghost" aria-label="リンクをコピー" data-testid="tip-trigger">
                  <IconCopy />
                </Tooltip.Trigger>
                <Tooltip id="tip-copy" data-testid="tip-copy">
                  共有用の URL をクリップボードに入れます
                </Tooltip>
                <Tooltip.Trigger tooltip="tip-share" variant="ghost" aria-label="共有">
                  <IconShare />
                </Tooltip.Trigger>
                <Tooltip id="tip-share" side="bottom">
                  チームの人に送ります
                </Tooltip>
              </div>
            </Example>
          </Section>

          <Section id="toast" summary="操作の結果を短く知らせる。読み上げにも伝わり、開いているダイアログより手前に出ます。">
            <Example label="呼び出し">{toastDemo}</Example>
          </Section>
        </main>
      </div>
    </div>
  );
}

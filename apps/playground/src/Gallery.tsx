import type { ReactNode } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  Input,
  Link,
  Menu,
  Popover,
  RadioGroup,
  Select,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
} from "@yourlib/react";
import { IconBold, IconCopy, IconList, IconMore, IconShare } from "./icons.tsx";

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
      { id: "menu", name: "Menu", base: 'popover="auto"', js: "矢印キーとタイプアヘッドだけ" },
    ],
  },
  {
    label: "入力",
    entries: [
      { id: "field", name: "Field + Input", base: "<label> と aria-describedby", js: "不要" },
      { id: "textarea", name: "Textarea", base: "field-sizing: content", js: "不要" },
      { id: "select", name: "Select", base: "<select> と base-select", js: "不要" },
      { id: "checkbox", name: "Checkbox", base: '<input type="checkbox">', js: "不要" },
      { id: "switch", name: "Switch", base: 'role="switch"', js: "不要" },
      { id: "radio-group", name: "RadioGroup", base: "<fieldset> と radio", js: "不要" },
    ],
  },
  {
    label: "表示",
    entries: [
      { id: "card", name: "Card", base: "見出しレベルを選べる", js: "不要" },
      { id: "badge", name: "Badge", base: "<span>", js: "不要" },
      { id: "tabs", name: "Tabs", base: "ARIA tabs をサーバーで描画", js: "切り替えに必要" },
      { id: "accordion", name: "Accordion", base: "<details name>", js: "不要" },
      { id: "separator", name: "Separator", base: "<hr>", js: "不要" },
      { id: "skeleton", name: "Skeleton", base: "CSS のみ", js: "不要" },
      { id: "spinner", name: "Spinner", base: 'role="status"', js: "不要" },
    ],
  },
  {
    label: "重なり",
    entries: [
      { id: "dialog", name: "Dialog", base: "<dialog> と command", js: "不要" },
      { id: "popover", name: "Popover", base: "popover とアンカー配置", js: "不要" },
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
          yourlib<small>仮称</small>
        </span>
      </header>

      <div className="g-layout wrap">
        <nav className="g-index" aria-label="部品の一覧">
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
            <h1>部品</h1>
            <p className="lede">
              {count} 種類。どれも Server Components のまま描画でき、多くはブラウザ標準の要素だけで動きます。上のバーでパックとテーマを切り替えると、同じ部品がそのまま着せ替わります。
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

          <Section id="spinner" summary="処理中であることを示す。読み上げでは label の文言が伝わります。">
            <Example label="大きさ">
              <div className="g-row">
                <Spinner size="sm" />
                <Spinner />
                <Spinner size="lg" label="アップロード中" data-testid="spinner-lg" />
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

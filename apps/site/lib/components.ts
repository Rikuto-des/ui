/** Every component, as the site groups and describes it. `slug` is the contract name. */
export interface ComponentEntry {
  slug: string;
  name: string;
  /** The design-system guide: design-system/components/<guide>.md */
  guide: string;
  group: string;
  /** The browser feature it is built on. */
  base: string;
  /** What, if anything, needs the optional runtime. */
  js: string;
}

export const groups = ["操作", "入力", "表示", "状態", "ナビゲーション", "重なり"] as const;

export const components: ComponentEntry[] = [
  { slug: "combobox", name: "Combobox", guide: "Combobox", group: "入力", base: "検索可能なリストボックス", js: "必要" },
  { slug: "date-picker", name: "DatePicker", guide: "DatePicker", group: "入力", base: "日付入力とカレンダー", js: "カレンダーに必要" },
  { slug: "data-table", name: "DataTable", guide: "DataTable", group: "表示", base: "並び替えと選択に対応したtable", js: "必要" },
  { slug: "command", name: "Command", guide: "Command", group: "操作", base: "検索ダイアログ", js: "必要" },
  { slug: "button", name: "Button", guide: "Button", group: "操作", base: "<button>", js: "不要" },
  { slug: "link", name: "Link", guide: "Link", group: "操作", base: "<a>", js: "不要" },
  { slug: "button-group", name: "ButtonGroup", guide: "ButtonGroup", group: "操作", base: 'role="group"', js: "不要" },
  { slug: "toggle", name: "Toggle", guide: "Toggle", group: "操作", base: '<input type="checkbox">', js: "不要" },
  { slug: "toggle-group", name: "ToggleGroup", guide: "ToggleGroup", group: "操作", base: "radio と checkbox", js: "追従する選択表示に使用" },
  { slug: "menu", name: "Menu", guide: "Menu", group: "操作", base: 'popover="auto"', js: "矢印キーとタイプアヘッドだけ" },
  { slug: "field", name: "Field", guide: "Field", group: "入力", base: "<label> と aria-describedby", js: "不要" },
  { slug: "input", name: "Input", guide: "Input", group: "入力", base: "<input>", js: "不要" },
  { slug: "input-group", name: "InputGroup", guide: "InputGroup", group: "入力", base: ":has() で 1 つの枠に", js: "不要" },
  { slug: "textarea", name: "Textarea", guide: "Textarea", group: "入力", base: "field-sizing: content", js: "文字数と高さの補助に使用" },
  { slug: "select", name: "Select", guide: "Select", group: "入力", base: "<select> と base-select", js: "不要" },
  { slug: "checkbox", name: "Checkbox", guide: "Checkbox", group: "入力", base: '<input type="checkbox">', js: "不要" },
  { slug: "switch", name: "Switch", guide: "Switch", group: "入力", base: 'role="switch"', js: "不要" },
  { slug: "radio-group", name: "RadioGroup", guide: "RadioGroup", group: "入力", base: "<fieldset> と radio", js: "不要" },
  { slug: "slider", name: "Slider", guide: "Slider", group: "入力", base: '<input type="range">', js: "数値表示と目盛り操作に使用" },
  { slug: "date-input", name: "DateInput", guide: "DateInput", group: "入力", base: '<input type="date">', js: "不要" },
  { slug: "file-input", name: "FileInput", guide: "FileInput", group: "入力", base: '<input type="file">', js: "ファイルの一覧と取消に使用" },
  { slug: "otp-input", name: "OTPInput", guide: "OTPInput", group: "入力", base: "one-time-code", js: "不要" },
  { slug: "card", name: "Card", guide: "Card", group: "表示", base: "見出しレベルを選べる面", js: "不要" },
  { slug: "badge", name: "Badge", guide: "Badge", group: "表示", base: "<span>", js: "不要" },
  { slug: "avatar", name: "Avatar", guide: "Avatar", group: "表示", base: 'role="img" と <img>', js: "不要" },
  { slug: "kbd", name: "Kbd", guide: "Kbd", group: "表示", base: "<kbd>", js: "不要" },
  { slug: "table", name: "Table", guide: "Table", group: "表示", base: "<table> と <caption>", js: "不要" },
  { slug: "tabs", name: "Tabs", guide: "Tabs", group: "表示", base: "ARIA tabs をサーバーで描画", js: "切り替えに必要" },
  { slug: "accordion", name: "Accordion", guide: "Accordion", group: "表示", base: "<details name>", js: "不要" },
  { slug: "collapsible", name: "Collapsible", guide: "Collapsible", group: "表示", base: "<details>", js: "不要" },
  { slug: "separator", name: "Separator", guide: "Separator", group: "表示", base: "<hr>", js: "不要" },
  { slug: "aspect-ratio", name: "AspectRatio", guide: "AspectRatio", group: "表示", base: "aspect-ratio", js: "不要" },
  { slug: "scroll-area", name: "ScrollArea", guide: "ScrollArea", group: "表示", base: 'role="region"', js: "不要" },
  { slug: "carousel", name: "Carousel", guide: "Carousel", group: "表示", base: "scroll-snap", js: "共通の送り操作に使用" },
  { slug: "alert", name: "Alert", guide: "Alert", group: "状態", base: "見出しのある面", js: "不要" },
  { slug: "progress", name: "Progress", guide: "Progress", group: "状態", base: "<progress>", js: "不要" },
  { slug: "meter", name: "Meter", guide: "Meter", group: "状態", base: "<meter>", js: "不要" },
  { slug: "spinner", name: "Spinner", guide: "Spinner", group: "状態", base: 'role="status"', js: "不要" },
  { slug: "skeleton", name: "Skeleton", guide: "Skeleton", group: "状態", base: "CSS のみ", js: "不要" },
  { slug: "empty", name: "Empty", guide: "Empty", group: "状態", base: "CSS のみ", js: "不要" },
  { slug: "breadcrumb", name: "Breadcrumb", guide: "Breadcrumb", group: "ナビゲーション", base: "<nav> と <ol>", js: "不要" },
  { slug: "pagination", name: "Pagination", guide: "Pagination", group: "ナビゲーション", base: "<nav> とリンク", js: "不要" },
  { slug: "steps", name: "Steps", guide: "Steps", group: "ナビゲーション", base: 'aria-current="step"', js: "不要" },
  { slug: "navigation-menu", name: "NavigationMenu", guide: "NavigationMenu", group: "ナビゲーション", base: "<nav> と入れ子の <details>", js: "基本操作は不要" },
  { slug: "sidebar", name: "Sidebar", guide: "Sidebar", group: "ナビゲーション", base: "<nav> と <details>", js: "不要" },
  { slug: "dialog", name: "Dialog", guide: "Dialog", group: "重なり", base: "<dialog> と command", js: "不要" },
  { slug: "alert-dialog", name: "AlertDialog", guide: "AlertDialog", group: "重なり", base: 'role="alertdialog"', js: "不要" },
  { slug: "sheet", name: "Sheet", guide: "Sheet", group: "重なり", base: "<dialog> と command", js: "不要" },
  { slug: "popover", name: "Popover", guide: "Popover", group: "重なり", base: "popover とアンカー配置", js: "不要" },
  { slug: "hover-card", name: "HoverCard", guide: "HoverCard", group: "重なり", base: "popover と interestfor", js: "Chromium 以外で必要" },
  { slug: "tooltip", name: "Tooltip", guide: "Tooltip", group: "重なり", base: 'popover="hint" と interestfor', js: "Chromium 以外で必要" },
  { slug: "toast", name: "Toast", guide: "Toaster", group: "重なり", base: 'popover="manual" と aria-live', js: "表示に必要" },
];

export const bySlug = new Map(components.map((c) => [c.slug, c]));

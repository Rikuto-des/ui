import { components } from "./components";

export interface DocsNavItem {
  href: string;
  label: string;
  keywords?: string;
}
export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export const docsNavGroups: DocsNavGroup[] = [
  {
    label: "Documentation",
    items: [
      { href: "/docs/", label: "はじめかた", keywords: "installation getting started 導入" },
      { href: "/components/", label: "Components", keywords: "一覧 コンポーネント" },
      { href: "/docs/packs/", label: "パック", keywords: "theme graphite lucent テーマ" },
      { href: "/docs/design/", label: "デザインの決まり" },
      { href: "/docs/icons/", label: "Icons", keywords: "phosphor アイコン" },
      { href: "/docs/typesetting/", label: "日本語組版" },
      { href: "/docs/ai/", label: "AI と lint", keywords: "生成 検証 修正" },
      { href: "/docs/comparison/", label: "AIによる実装の比較" },
      { href: "/docs/cli/", label: "CLI", keywords: "コマンド 更新" },
      { href: "/docs/browsers/", label: "ブラウザの対応" },
    ],
  },
  {
    label: "Examples",
    items: [
      { href: "/examples/", label: "Examples", keywords: "サンプル アプリ" },
      { href: "/examples/studio/", label: "Studio", keywords: "プロジェクト 管理 ボード" },
      { href: "/examples/studio/source/", label: "Studioの実装", keywords: "source コード" },
    ],
  },
  {
    label: "Components",
    items: [...components].sort((a, b) => a.name.localeCompare(b.name, "en")).map(c => ({
      href: `/components/${c.slug}/`, label: c.name, keywords: `${c.slug} ${c.group} ${c.base}`,
    })),
  },
];

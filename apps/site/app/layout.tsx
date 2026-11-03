import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@urushi/react";
import { UrushiRuntime } from "@urushi/react/runtime";
import "@urushi/react/styles.css";
import "@urushi/packs/all.css";
import "./site.css";

export const metadata: Metadata = {
  title: { default: "Urushi — AIとUIを作り、仕様に沿って検証する", template: "%s — Urushi" },
  description: "生成した画面の検証と修正に使えるReact UIライブラリです。共通の契約から型・診断・AI向け説明を生成し、ブラウザ標準の動作とパックによる見た目を組み合わせます。",
};

// Restores the chosen pack and theme before the first paint (see PackSwitcher).
const restore = `try{var s=JSON.parse(localStorage.getItem("urushi-site")||"{}"),h=document.documentElement;if(s.pack)h.dataset.pack=s.pack;if(s.theme&&s.theme!=="system")h.dataset.theme=s.theme}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" data-pack="graphite" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: restore }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap" />
      </head>
      <body className="site-docs">
        <a className="skip-link" href="#main">
          本文へ移動
        </a>
        <UrushiRuntime />
        {children}
        <footer className="site-footer wrap">
          <a className="footer-wordmark" href="/">urushi<span aria-hidden="true">.</span></a>
          <div className="footer-bottom"><p>React components. Designed to evolve.</p><nav aria-label="フッター"><a href="/docs/">ドキュメント</a><a href="/docs/comparison/">実測比較</a><span>MIT License</span></nav></div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

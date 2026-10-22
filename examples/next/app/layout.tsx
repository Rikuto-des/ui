import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@yourlib/react/styles.css";
import "@yourlib/packs/all.css";
import "./page.css";
import { YourlibRuntime } from "@yourlib/react/runtime";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = { title: "yourlib × Next.js" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" data-pack="graphite">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" />
      </head>
      <body>
        {/* Optional: menu and tab keyboard models, tooltips outside Chromium,
            and platform gaps such as <dialog closedby> in older Safari. */}
        <YourlibRuntime />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

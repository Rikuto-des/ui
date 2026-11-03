import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap not-found">
        <h1>ページが見つかりません</h1>
        <p>
          URL を確かめるか、<a href="/">トップ</a>・<a href="/components/">コンポーネントの一覧</a>から探してください。
        </p>
      </main>
    </>
  );
}

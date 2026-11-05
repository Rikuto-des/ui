import { NavigationMenu } from "@urushi/react/navigation-menu";

/** A usable component study, not a decorative screenshot. */
export function NavigationStudy() {
  return <div className="navigation-study" data-pack="graphite" data-theme="dark">
    <div className="study-label"><span>Navigation Menu</span><span>Live preview</span></div>
    <NavigationMenu label="Urushiの機能">
      <NavigationMenu.Group title="つくる">
        <NavigationMenu.Link href="/components/" description="60のコンポーネントから必要なものを探せます。">コンポーネント</NavigationMenu.Link>
        <NavigationMenu.Group title="デザインを選ぶ">
          <NavigationMenu.Link href="/docs/packs/" description="GraphiteとLucentの見た目を比較できます。">パック</NavigationMenu.Link>
          <NavigationMenu.Link href="/docs/typesetting/" description="日本語の行間や改行、文字間隔を整えます。">日本語組版</NavigationMenu.Link>
        </NavigationMenu.Group>
      </NavigationMenu.Group>
      <NavigationMenu.Group title="確かめる" columns={2}>
        <NavigationMenu.Link href="/docs/ai/" description="AIによる生成から検証、修正までの手順を説明します。">AIとつくる</NavigationMenu.Link>
        <NavigationMenu.Link href="/docs/comparison/" description="同じ条件で測った結果と限界を確認できます。">実測比較</NavigationMenu.Link>
        <NavigationMenu.Link href="/docs/design/" description="色や余白、文字、動きの基準を確認できます。">デザインの決まり</NavigationMenu.Link>
        <NavigationMenu.Link href="/docs/browsers/" description="ブラウザーごとの対応状況を確認できます。">ブラウザーの対応</NavigationMenu.Link>
      </NavigationMenu.Group>
      <NavigationMenu.Group title="育てる">
        <NavigationMenu.Link href="/docs/cli/" description="手元の変更を残して更新を取り込めます。">CLIで更新する</NavigationMenu.Link>
      </NavigationMenu.Group>
    </NavigationMenu>
    <div className="study-type" aria-hidden="true"><span>Every detail.</span><span>In motion.</span></div>
    <div className="study-caption"><span>項目を切り替えて動きを試せます。</span><a href="/components/navigation-menu/" aria-label="Navigation Menuを詳しく見る">↗</a></div>
  </div>;
}

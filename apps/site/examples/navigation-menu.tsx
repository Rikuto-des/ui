import { NavigationMenu } from "@urushi/react/navigation-menu";

export default function NavigationMenuExample() {
  return <div className="navigation-demo">
    <div className="navigation-demo-bar"><span className="navigation-demo-brand">urushi<span> / studio</span></span><span>DESIGNED TO CONNECT</span></div>
    <NavigationMenu label="製品サイト">
      <NavigationMenu.Group title="プロダクト">
        <NavigationMenu.Link href="/components/navigation-menu/" description="メニューを開き、リンクから各ページに移動できます。" current>Navigation Menu</NavigationMenu.Link>
        <NavigationMenu.Group title="開発者向け">
          <NavigationMenu.Link href="/docs/ai/" description="生成・検証・修正に必要な情報をまとめています。">AIでつくる</NavigationMenu.Link>
          <NavigationMenu.Link href="/docs/comparison/" description="同じ条件で動作と配信サイズを比較しています。">競合との実測比較</NavigationMenu.Link>
        </NavigationMenu.Group>
        <NavigationMenu.Link href="/docs/design/" description="余白や文字、色の基準を確認できます。">デザインの決まり</NavigationMenu.Link>
      </NavigationMenu.Group>
      <NavigationMenu.Group title="コンポーネント" columns={2}>
        <NavigationMenu.Link href="/components/menu/" description="操作をメニューから選べます。">操作用のMenu</NavigationMenu.Link>
        <NavigationMenu.Link href="/components/sidebar/" description="アプリ内の現在地を確認して移動できます。">アプリのSidebar</NavigationMenu.Link>
        <NavigationMenu.Link href="/components/dialog/" description="操作を実行する前に内容を確認できます。">Dialog</NavigationMenu.Link>
        <NavigationMenu.Link href="/components/tabs/" description="目的に合わせて画面の内容を切り替えられます。">Tabs</NavigationMenu.Link>
      </NavigationMenu.Group>
      <NavigationMenu.Link href="/docs/">はじめる</NavigationMenu.Link>
    </NavigationMenu>
    <div className="navigation-demo-body"><span>EXPLORE THE SYSTEM</span><p>メニューから<br />必要な情報を探す</p><span>マウスでもキーボードでも操作できます。<br />プロダクトや開発者向けの資料を開いてみてください。</span><div className="navigation-demo-caption"><span>01 / 03</span><span>HOVER · CLICK · KEYBOARD</span></div></div>
  </div>;
}

"use client";
import { useState } from "react";
import { Switch } from "@urushi/react";
export default function SwitchExample() {
  const [focused, setFocused] = useState(false);
  return <div className="switch-study">
    <div className="experience-caption"><span>MAKE ROOM</span><span>FOCUS</span></div>
    <h3>集中モードを切り替える</h3>
    <p className="experience-muted">切り替えると通知の見本がまとまります。</p>
    <div className="focus-workspace" data-focus={focused || undefined} aria-hidden="true">
      <div className="focus-note"><span>IN PROGRESS</span><strong>次のアイデアを<br />形にする</strong><div className="focus-lines"><i/><i/><i/></div></div>
      <div className="focus-notice"><span>MS</span><div><strong>Mika Sato</strong><small>レビューをお願いします</small></div></div>
      <div className="focus-notice"><span>KI</span><div><strong>Kai Ito</strong><small>新しいコメントがあります</small></div></div>
      <span className="focus-quiet">通知をあとでまとめて確認できます</span>
    </div>
    <div className="focus-setting"><Switch showState checked={focused} onChange={event => setFocused(event.target.checked)} description="この画面内の見本に反映します。">集中モード</Switch><span role="status">{focused ? "オン" : "オフ"}</span></div>
  </div>;
}

"use client";
import { PlusIcon, SquaresFourIcon, ArrowRightIcon, DotsThreeIcon, SparkleIcon } from "@urushi/react/icons";

import { useId, useState } from "react";
import { Avatar, Badge, Button, Card, Checkbox, Dialog, Field, Input, Menu, Progress, Switch, Tabs } from "@urushi/react";

const initialTasks = [
  { id: 1, title: "コンセプトを言葉にする", area: "Strategy", done: true },
  { id: 2, title: "キービジュアルを仕上げる", area: "Design", done: true },
  { id: 3, title: "コンポーネントを整える", area: "Design", done: false },
  { id: 4, title: "公開前のレビュー", area: "Review", done: false },
];

/** A working composition of public components. All changes stay in this example. */
export function ComponentShowcase() {
  const id = useId();
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const completed = tasks.filter(t => t.done).length;
  const toggle = (taskId: number) => setTasks(items => items.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  return <div className="studio" role="region" aria-label="コンポーネントの使用例">
    <div className="studio-bar">
      <a className="studio-brand" href="/components/"><span aria-hidden="true">f.</span> forma<span className="studio-brand-divider" />ワークスペース</a>
      <div className="studio-bar-end"><Badge dot tone="ok">プレビュー</Badge><Avatar name="Misaki Sato" size="sm" /></div>
    </div>
    <div className="studio-body">
      <aside className="studio-rail" aria-label="見本の関連ページ">
        <span className="studio-overline">WORKSPACE</span>
        <a href="/components/" className="studio-rail-active"><SquaresFourIcon size={16} />プロジェクト<span>04</span></a>
        <a href="/components/navigation-menu/">ナビゲーション<ArrowRightIcon size={16} /></a>
        <a href="/docs/design/">デザインの決まり<ArrowRightIcon size={16} /></a>
        <div className="studio-rail-note"><SparkleIcon size={16} /><strong>パックで見た目を揃える</strong><p>形や余白、動きを<br />共通のルールで整えます。</p><a href="/docs/packs/">パックについて →</a></div>
        <div className="studio-person"><Avatar name="Misaki Sato" size="sm" /><div><strong>Misaki Sato</strong><span>Personal workspace</span></div></div>
      </aside>
      <div className="studio-content">
        <div className="studio-heading"><div><p className="studio-overline">PROJECT / 004</p><h2>ブランドサイトの公開</h2><p>サイトの公開までに必要な作業を管理します。</p></div><Dialog.Trigger dialog={`${id}-task`} variant="primary"><PlusIcon size={16} />タスクを追加</Dialog.Trigger></div>
        <div className="studio-grid">
          <div className="studio-work">
            <div className="studio-work-head"><Tabs id={`${id}-view`} label="プロジェクトの表示" defaultValue="tasks">
              <Tabs.List><Tabs.Tab value="tasks">タスク</Tabs.Tab><Tabs.Tab value="about">概要</Tabs.Tab></Tabs.List>
              <Tabs.Panel value="tasks">
                <div className="studio-search"><Input aria-label="見本のタスクを検索" placeholder="タスクを検索…" value={query} onChange={e => setQuery(e.target.value)} /><span>{tasks.length} 件</span></div>
                <ul className="studio-tasks">{tasks.filter(t => t.title.includes(query)).map(task => <li key={task.id} data-complete={task.done || undefined}>
                  <Checkbox checked={task.done} onChange={() => toggle(task.id)} aria-label={`${task.title}の完了状態`} />
                  <div><span className="studio-task-title">{task.title}</span><span className="studio-task-area">{task.area}</span></div>
                  <Badge tone={task.done ? "neutral" : "accent"}>{task.done ? "完了" : "進行中"}</Badge>
                  <Menu.Trigger menu={`${id}-action-${task.id}`} variant="ghost" size="sm" aria-label={`${task.title}の操作`}><DotsThreeIcon size={16} /></Menu.Trigger>
                  <Menu id={`${id}-action-${task.id}`} label="タスクの操作" align="end"><Menu.Item onClick={() => toggle(task.id)}>{task.done ? "未完了に戻す" : "完了にする"}</Menu.Item><Menu.Separator /><Menu.Item variant="danger" onClick={() => { setTasks(items => items.filter(t => t.id !== task.id)); setNotice(`「${task.title}」を削除しました`); }}>削除する</Menu.Item></Menu>
                </li>)}</ul>
                {tasks.filter(t => t.title.includes(query)).length === 0 && <p className="studio-empty">一致するタスクはありません。</p>}
              </Tabs.Panel>
              <Tabs.Panel value="about"><div className="studio-brief"><Badge tone="accent">Website / 2026</Badge><h3>チームで公開までの作業を進める</h3><p>企画から公開までのタスクをまとめた見本です。チェック、検索、追加、削除を試せます。</p><p>変更はこの画面だけに反映されます。</p></div></Tabs.Panel>
            </Tabs></div>
            <div className="studio-work-foot"><span className="studio-live-dot" />{completed} / {tasks.length} 件を完了<span>October 2026</span></div>
          </div>
          <div className="studio-inspector">
            <Card padding="lg"><div className="studio-card-caption"><span>公開までの進捗</span><ArrowRightIcon size={16} /></div><div className="studio-metric">{tasks.length ? Math.round(completed / tasks.length * 100) : 0}<span>%</span></div><Progress label="プロジェクトの進捗" value={completed} max={Math.max(tasks.length, 1)} showValue={false} /><div className="studio-card-divider" /><div className="studio-team"><div className="studio-avatars"><Avatar name="Misaki Sato" size="sm" /><Avatar name="Ken Ito" size="sm" /><Avatar name="Hana Mori" size="sm" /></div><span>3 人のチーム</span></div></Card>
            <Card padding="lg"><div className="studio-card-caption"><span>通知</span><Badge>Personal</Badge></div><Switch defaultChecked description="更新があったときに知らせます。">プロジェクトの更新</Switch></Card>
          </div>
        </div>
        <p className="studio-notice" role="status">{notice || "操作できる見本です。変更はこの画面だけに反映されます。"}</p>
      </div>
    </div>
    <Dialog id={`${id}-task`} title="タスクを追加" description="次に取り組むタスクを入力してください。" size="sm">
      <form className="form" method="dialog" onSubmit={event => {
        event.preventDefault(); const form = event.currentTarget, title = String(new FormData(form).get("title") ?? "").trim();
        if (!title) return;
        setTasks(items => [...items, { id: Math.max(0, ...items.map(t => t.id)) + 1, title, area: "New", done: false }]);
        setQuery(""); setNotice(`「${title}」を追加しました`); form.reset(); form.closest("dialog")?.close();
      }}><Field id={`${id}-title`} label="タスク名" required><Input name="title" autoFocus required placeholder="例：モバイル表示を確認する…" autoComplete="off" /></Field><Dialog.Actions><Dialog.Close dialog={`${id}-task`} variant="ghost">キャンセル</Dialog.Close><Button variant="primary" type="submit">追加する</Button></Dialog.Actions></form>
    </Dialog>
  </div>;
}

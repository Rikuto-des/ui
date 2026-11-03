"use client";
import { NotebookIcon, FolderIcon, ArchiveIcon } from "@urushi/react/icons";
import { useState } from "react";
import { Sidebar } from "@urushi/react";
const pages = [
  {
    id: "notes",
    name: "ノート",
    icon: NotebookIcon,
    text: "思いついたことをその場で記録できます。",
  },
  {
    id: "projects",
    name: "プロジェクト",
    icon: FolderIcon,
    text: "アイデアをプロジェクトごとにまとめます。",
  },
  {
    id: "archive",
    name: "アーカイブ",
    icon: ArchiveIcon,
    text: "終わった仕事もいつでも見返せます。",
  },
];
export default function SidebarExample() {
  const [active, setActive] = useState("notes");
  const page = pages.find((p) => p.id === active)!;
  return (
    <div className="interaction-study">
      <header>
        <small>WORKSPACE</small>
        <h3>現在地を確認しながら移動する</h3>
      </header>
      <div className="study-workspace">
        <Sidebar label="見本のワークスペース">
          <Sidebar.Group title="ライブラリ" collapsible>
            {pages.map((p) => (
              <Sidebar.Item
                key={p.id}
                href={`#workspace-${p.id}`}
                icon={<p.icon size={20} weight={active === p.id ? "fill" : "regular"} />}
                current={active === p.id}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(p.id);
                }}
              >
                {p.name}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>
        </Sidebar>
        <section
          className="study-workspace-page"
          key={active}
          id={`workspace-${active}`}
        >
          <small>LIBRARY</small>
          <h4>{page.name}</h4>
          <p>{page.text}</p>
          <div className="study-page-art" />
        </section>
      </div>
      <p className="study-caption" role="status">
        {page.name}を表示中
      </p>
    </div>
  );
}

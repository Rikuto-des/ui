"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert, AlertDialog, Avatar, Badge, Button, Card, Combobox, Command, DataTable,
  DatePicker, Empty, Field, Input, Menu, Progress, Select, Sheet, Skeleton,
  Switch, Tabs, Textarea, type DataTableColumn,
} from "@urushi/react";
import {
  ArrowLeftIcon, ArrowRightIcon, ArrowUUpLeftIcon, CalendarBlankIcon, CheckCircleIcon,
  DotsThreeIcon, ExportIcon, GearSixIcon, ListChecksIcon, MagnifyingGlassIcon,
  PlusIcon, SquaresFourIcon, UsersIcon,
} from "@urushi/react/icons";
import {
  createStudioWorkspace, owners, parseStudioWorkspace, projectErrors, statusLabels,
  STUDIO_STORAGE_KEY, type Project, type StudioWorkspace,
} from "@/lib/studio-demo";

const statuses = Object.entries(statusLabels) as [Project["status"], string][];
const ownerName = (value: string) => owners.find(owner => owner.value === value)?.label ?? value;
const dueLabel = (value: string) => new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
const tone = (status: Project["status"]) => status === "done" ? "ok" : status === "active" ? "accent" : "neutral";
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function StudioApp() {
  const [workspace, setWorkspace] = useState<StudioWorkspace>(createStudioWorkspace);
  const [ready, setReady] = useState(false);
  const [corrupt, setCorrupt] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState<StudioWorkspace>();
  const baseline = useRef<string | null>(null);
  const [view, setView] = useState<"projects" | "settings">("projects");
  const [workspaceName, setWorkspaceName] = useState("Forma Studio");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [tableVersion, setTableVersion] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [draft, setDraft] = useState<Project>();
  const [errors, setErrors] = useState<ReturnType<typeof projectErrors>>({});
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState<Project>();
  const [shortcut, setShortcut] = useState("Ctrl K");
  const originalDraft = useRef("");
  const invalidField = useRef<string | null>(null);
  const editor = useRef<HTMLDialogElement>(null);
  const discard = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const invoker = useRef<HTMLElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
      baseline.current = raw;
      const next = raw === null ? createStudioWorkspace() : parseStudioWorkspace(raw);
      setWorkspace(next); setWorkspaceName(next.name); setCorrupt(false); setStorageError(""); setUndo(undefined);
    } catch {
      setCorrupt(true);
      setStorageError("保存データを読み込めませんでした。元のデータは残したままサンプルを表示しています。ブラウザの保存設定を確認するか、初期データに戻してください。");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    load();
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K");
    const changed = (event: StorageEvent) => {
      if (event.key === STUDIO_STORAGE_KEY || event.key === null) setStorageError("別のタブでデータが更新されました。編集を閉じて、データを再読み込みしてください。");
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.isComposing || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k" || event.altKey || document.querySelector("dialog[open]")) return;
      event.preventDefault(); setCommandOpen(true);
    };
    window.addEventListener("storage", changed);
    window.addEventListener("keydown", keydown);
    return () => { window.removeEventListener("storage", changed); window.removeEventListener("keydown", keydown); };
  }, [load]);

  const dirty = !!draft && JSON.stringify(draft) !== originalDraft.current;
  const settingsDirty = workspaceName !== workspace.name;
  useEffect(() => {
    if (!dirty && !settingsDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, settingsDirty]);
  useEffect(() => {
    if (!draft) return;
    editor.current?.showModal();
    document.getElementById("demo-project-name")?.focus();
  }, [draft?.id]);
  useEffect(() => { if (deleting) { setSaveError(""); deleteDialog.current?.showModal(); } }, [deleting]);
  useLayoutEffect(() => {
    const id = invalidField.current;
    invalidField.current = null;
    // Apply validation focus with its DOM update, before the next user action.
    if (id) document.getElementById(id)?.focus();
  }, [errors]);

  function commit(next: StudioWorkspace, message: string, options: { reset?: boolean; undoing?: boolean } = {}) {
    try {
      if (corrupt && !options.reset) throw new Error("保存データを読み込めていません。データの再読み込みか初期化を行ってください。");
      const stored = localStorage.getItem(STUDIO_STORAGE_KEY);
      if (!options.reset && stored !== baseline.current) throw new Error("別のタブでデータが更新されました。編集を閉じて、データを再読み込みしてください。");
      const raw = JSON.stringify(next);
      localStorage.setItem(STUDIO_STORAGE_KEY, raw);
      baseline.current = raw;
      setUndo(options.undoing ? undefined : workspace);
      setWorkspace(next); setCorrupt(false); setStorageError(""); setSaveError(""); setNotice(message);
      return true;
    } catch (error) {
      const message = error instanceof Error && error.name === "Error" ? error.message : "ブラウザに保存できませんでした。入力内容は残っています。保存領域やブラウザの設定を確認して、もう一度保存してください。";
      setStorageError(message); setSaveError(message); return false;
    }
  }
  function clearFilters() { setQuery(""); setStatus("all"); setOwner("all"); setSelected([]); }
  function edit(project?: Project) {
    if (!ready || corrupt) return;
    invoker.current = document.activeElement as HTMLElement;
    const next: Project = project ? { ...project } : { id: "new", name: "", description: "", status: "planned", owner: "mika", due: today(), revision: 0 };
    originalDraft.current = JSON.stringify(next); setErrors({}); setSaveError(""); setDraft(next);
  }
  function closeEditor() {
    editor.current?.close(); setDraft(undefined);
    const target = invoker.current?.isConnected && invoker.current.getClientRects().length && !invoker.current.closest("[popover]") ? invoker.current : addButton.current;
    target?.focus({ preventScroll: true });
  }
  function requestClose() { if (dirty) discard.current?.showModal(); else closeEditor(); }
  function patchDraft(patch: Partial<Project>) {
    if (!draft) return;
    const next = { ...draft, ...patch }; setDraft(next);
    if (Object.keys(errors).length) setErrors(projectErrors(next));
  }
  function saveProject() {
    if (!draft) return;
    const nextErrors = projectErrors(draft); setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const ids = { name: "demo-project-name", description: "demo-project-description", owner: "demo-project-owner", due: "demo-project-due" };
      invalidField.current = ids[Object.keys(nextErrors)[0] as keyof typeof ids]; return;
    }
    const isNew = draft.id === "new";
    if (isNew && workspace.projects.length >= 500) { setSaveError("このサンプルで保存できるプロジェクトは500件までです。"); return; }
    const saved = { ...draft, id: isNew ? `PRJ-${crypto.randomUUID().slice(0, 8).toUpperCase()}` : draft.id, name: draft.name.trim(), revision: draft.revision + 1 };
    const projects = isNew ? [saved, ...workspace.projects] : workspace.projects.map(project => project.id === saved.id ? saved : project);
    if (commit({ ...workspace, projects }, isNew ? "プロジェクトを追加しました。" : "変更を保存しました。")) { clearFilters(); if (isNew) setTableVersion(version => version + 1); closeEditor(); }
  }
  function changeStatus(project: Project, next: Project["status"]) {
    const restoreFocus = document.activeElement?.id === `demo-board-status-${project.id}`;
    const success = commit({ ...workspace, projects: workspace.projects.map(row => row.id === project.id ? { ...row, status: next, revision: row.revision + 1 } : row) }, `「${project.name}」を${statusLabels[next]}にしました。`);
    if (success && restoreFocus) requestAnimationFrame(() => {
      (document.getElementById(`demo-board-status-${project.id}`) ?? document.getElementById("demo-project-views-tab-board"))?.focus({ preventScroll: true });
    });
  }
  function completeSelected() {
    if (commit({ ...workspace, projects: workspace.projects.map(row => selected.includes(row.id) ? { ...row, status: "done", revision: row.revision + 1 } : row) }, `${selected.length}件を完了にしました。`)) setSelected([]);
  }
  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "urushi-studio.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("データを書き出しました。");
  }
  const projects = workspace.projects;
  const filtered = projects.filter(row => (workspace.showCompleted || row.status !== "done") && (status === "all" || row.status === status) && (owner === "all" || row.owner === owner) && `${row.name} ${row.description} ${row.id}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const completed = projects.filter(project => project.status === "done").length;
  const upcoming = projects.filter(project => project.status !== "done").sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  const empty = <Empty title="一致するプロジェクトがありません" description="検索語や絞り込み条件を変えてください。" action={<Button onClick={clearFilters}>絞り込みを解除</Button>} />;
  const columns: DataTableColumn<Project>[] = [
    { id: "name", header: "プロジェクト", sortValue: row => row.name, cell: row => <button className="demo-project-link" type="button" onClick={event => { event.currentTarget.focus(); edit(row); }}><span className="demo-project-glyph" aria-hidden="true">{row.name.slice(0, 1).toUpperCase()}</span><span><strong>{row.name}</strong><small>{row.id}</small></span></button> },
    { id: "status", header: "状態", sortValue: row => row.status, cell: row => <Badge tone={tone(row.status)} dot>{statusLabels[row.status]}</Badge> },
    { id: "owner", header: "担当者", sortValue: row => ownerName(row.owner), cell: row => <span className="demo-person"><Avatar name={ownerName(row.owner)} size="sm" /><span>{ownerName(row.owner)}</span></span> },
    { id: "due", header: "期限", sortValue: row => row.due, cell: row => <time dateTime={row.due}>{dueLabel(row.due)}</time> },
    { id: "actions", header: "操作", cell: row => <><Menu.Trigger menu={`demo-actions-${row.id}`} size="sm" variant="ghost" aria-label={`${row.name}の操作`}><DotsThreeIcon size={20} /></Menu.Trigger><Menu id={`demo-actions-${row.id}`} label={`${row.name}の操作`} align="end"><Menu.Item onClick={() => edit(row)}>編集する</Menu.Item><Menu.Item onClick={() => changeStatus(row, row.status === "done" ? "planned" : "done")}>{row.status === "done" ? "予定に戻す" : "完了にする"}</Menu.Item><Menu.Separator /><Menu.Item variant="danger" onClick={() => setDeleting(row)}>削除する</Menu.Item></Menu></> },
  ];

  return <div className="studio-demo" aria-label="Urushi Studio サンプルアプリ" data-ready={ready}>
    <aside className="demo-sidebar">
      <div className="demo-workspace"><span className="demo-workspace-icon" aria-hidden="true"><SquaresFourIcon size={24} /></span><div><strong>{workspace.name}</strong><span>サンプルワークスペース</span></div></div>
      <nav aria-label="ワークスペース">
        <span className="demo-nav-label">Workspace</span>
        <button type="button" aria-current={view === "projects" && owner === "all" ? "page" : undefined} onClick={() => { setView("projects"); clearFilters(); }}><ListChecksIcon size={20} />プロジェクト<span>{projects.length}</span></button>
        <button type="button" aria-current={view === "projects" && owner === "mika" ? "page" : undefined} onClick={() => { setView("projects"); clearFilters(); setOwner("mika"); }}><UsersIcon size={20} />Mikaの担当<span>{projects.filter(row => row.owner === "mika").length}</span></button>
        <button type="button" aria-current={view === "settings" ? "page" : undefined} onClick={() => setView("settings")}><GearSixIcon size={20} />設定</button>
      </nav>
      <div className="demo-sidebar-bottom"><Badge tone="accent" dot>ブラウザ内に保存</Badge><p>サンプルデータを自由に編集できます。</p><a href="/examples/studio/source/">実装コードを見る<ArrowRightIcon size={16} /></a></div>
      <div className="demo-profile"><Avatar name="Mika Sato" size="sm" /><div><strong>Mika Sato</strong><span>Design team · デモ</span></div></div>
    </aside>
    <div className="demo-content">
      <div className="demo-topbar"><span>Workspace <span aria-hidden="true">/</span> {view === "settings" ? "設定" : "Projects"}</span><Button size="sm" variant="ghost" aria-label={`検索・コマンド ${shortcut}`} onClick={() => setCommandOpen(true)} disabled={!ready}><MagnifyingGlassIcon size={16} /><span>検索・コマンド</span><kbd>{shortcut}</kbd></Button></div>
      <div className="demo-main">
        {storageError && <Alert tone="warning" title="保存状態を確認してください" action={<Button size="sm" onClick={load}>データを再読み込み</Button>}>{storageError}</Alert>}
        {view === "projects" ? <>
          <div className="demo-heading"><div><span className="demo-eyebrow">PROJECTS</span><h1>チームのプロジェクト</h1><p>担当と進み具合を確認して、次の作業を決められます。</p></div><Button key={corrupt ? "unavailable" : "available"} ref={addButton} variant="primary" disabled={!ready || corrupt} onClick={() => edit()}><PlusIcon size={16} />新規プロジェクト</Button></div>
          <div className="demo-overview-wrapper"><div className="demo-overview-toggle"><Button size="sm" variant="ghost" aria-expanded={overviewOpen} aria-controls="demo-overview" onClick={() => setOverviewOpen(open => !open)}><CheckCircleIcon size={16} />進捗と期限{overviewOpen ? "を閉じる" : "を見る"}</Button><span>{completed} / {projects.length} 完了</span></div><div className="demo-overview" id="demo-overview" data-expanded={overviewOpen}>
            <Card padding="lg"><div className="demo-progress-head"><span><CheckCircleIcon size={20} />チームの進捗</span><Badge>{projects.length} projects</Badge></div><div className="demo-progress-number">{ready ? Math.round(completed / Math.max(projects.length, 1) * 100) : "—"}<span>%</span><small>{completed}件が完了しました</small></div><Progress label="完了したプロジェクト" value={completed} max={Math.max(projects.length, 1)} showValue={false} /></Card>
            <Card padding="lg"><div className="demo-next-heading"><CalendarBlankIcon size={20} /><span>次の期限</span></div><ul className="demo-upcoming">{upcoming.map(project => <li key={project.id}><button type="button" onClick={() => edit(project)} disabled={!ready || corrupt}>{project.name}</button><time dateTime={project.due}>{dueLabel(project.due)}</time></li>)}{!upcoming.length && <li>未完了のプロジェクトはありません。</li>}</ul></Card>
          </div></div>
          <section className="demo-projects" aria-label="プロジェクトの管理">
            <div className="demo-section-title"><h2>All projects <span>{filtered.length}</span></h2><div className="demo-team"><span>Team</span>{owners.map(person => <Avatar key={person.value} name={person.label} size="sm" />)}</div></div>
            <div className="demo-filters"><div className="demo-search"><MagnifyingGlassIcon size={16} /><Input ref={search} type="search" aria-label="プロジェクトを検索" placeholder="名前や内容で検索…" value={query} onChange={event => { setQuery(event.target.value); setSelected([]); }} /></div><Select aria-label="状態で絞り込み" value={status} onChange={event => { setStatus(event.target.value); setSelected([]); }}><option value="all">すべての状態</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><Select aria-label="担当者で絞り込み" value={owner} onChange={event => { setOwner(event.target.value); setSelected([]); }}><option value="all">すべての担当者</option>{owners.map(person => <option key={person.value} value={person.value}>{person.label}</option>)}</Select>{(query || status !== "all" || owner !== "all") && <Button variant="ghost" size="sm" onClick={clearFilters}>解除</Button>}</div>
            <Tabs id="demo-project-views" label="プロジェクトの表示" defaultValue="table" motion="none">
              <Tabs.List><Tabs.Tab value="table"><ListChecksIcon size={16} />一覧</Tabs.Tab><Tabs.Tab value="board"><SquaresFourIcon size={16} />ボード</Tabs.Tab></Tabs.List>
              <Tabs.Panel value="table">
                {selected.length > 0 && <div className="demo-selection"><span>{selected.length}件を選択中</span><Button size="sm" onClick={completeSelected}>選択した項目を完了にする</Button><Button size="sm" variant="ghost" onClick={() => setSelected([])}>選択解除</Button></div>}
                <DataTable key={`${query}:${status}:${owner}:${workspace.showCompleted}:${tableVersion}`} locale="ja" label="プロジェクト一覧" rows={filtered} columns={columns} getRowId={row => row.id} getRowLabel={row => row.name} selectedIds={selected} onSelectionChange={setSelected} pageSize={6} loading={!ready} empty={empty} renderDetails={row => <div className="demo-row-details"><p>{row.description || "説明はまだありません。"}</p><Button size="sm" onClick={() => edit(row)}>プロジェクトを編集</Button></div>} />
              </Tabs.Panel>
              <Tabs.Panel value="board">
                {!ready ? <Skeleton lines={5} /> : filtered.length ? <div className="demo-board">{statuses.map(([value, label]) => <section key={value} className="demo-board-column" aria-label={`${label}のプロジェクト`}><h3><Badge tone={tone(value)} dot>{label}</Badge><span>{filtered.filter(row => row.status === value).length}</span></h3>{filtered.filter(row => row.status === value).map(row => <Card key={row.id} padding="md"><article className="demo-board-card"><span className="demo-id">{row.id}</span><button type="button" className="demo-board-title" onClick={() => edit(row)}>{row.name}</button><p>{row.description}</p><div className="demo-board-meta"><Avatar name={ownerName(row.owner)} size="sm" /><time dateTime={row.due}>{dueLabel(row.due)}</time></div><Select id={`demo-board-status-${row.id}`} aria-label={`${row.name}の状態`} size="sm" value={row.status} onChange={event => changeStatus(row, event.target.value as Project["status"])}>{statuses.map(([s, text]) => <option key={s} value={s}>{text}</option>)}</Select></article></Card>)}{!filtered.some(row => row.status === value) && <p className="demo-board-empty">この状態の項目はありません。</p>}</section>)}</div> : empty}
              </Tabs.Panel>
            </Tabs>
          </section>
        </> : <>
          <div className="demo-heading"><div><span className="demo-eyebrow">SETTINGS</span><h1>ワークスペース設定</h1><p>名前と一覧の表示を変更できます。</p></div><Button variant="ghost" onClick={() => setView("projects")}><ArrowLeftIcon size={16} />プロジェクトへ</Button></div>
          <div className="demo-settings"><Card padding="lg" title="ワークスペース名" headingLevel="h2"><form className="demo-settings-form" onSubmit={event => { event.preventDefault(); if (!workspaceName.trim()) return; commit({ ...workspace, name: workspaceName.trim() }, "ワークスペース名を保存しました。"); setWorkspaceName(workspaceName.trim()); }}><Field id="demo-workspace-name" label="名前" required><Input required maxLength={60} value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} /></Field><Button type="submit" variant="primary" disabled={!ready || !settingsDirty || !workspaceName.trim()}>名前を保存</Button></form></Card>
            <Card padding="lg" title="表示するプロジェクト" headingLevel="h2"><Switch checked={workspace.showCompleted} onChange={event => { if (commit({ ...workspace, showCompleted: event.target.checked }, "表示設定を保存しました。")) setSelected([]); }} description="オフにすると、一覧とボードから完了した項目を隠します。">完了したプロジェクトも表示</Switch></Card>
            <Card padding="lg" title="サンプルデータ" headingLevel="h2" description="このブラウザだけに保存されます。別の端末との同期や共同編集は行いません。"><div className="demo-data-actions"><Button onClick={exportData}><ExportIcon size={16} />JSONを書き出す</Button><Button onClick={() => { setSaveError(""); resetDialog.current?.showModal(); }} variant="ghost">初期データに戻す</Button></div></Card>
          </div>
        </>}
        <div className="demo-notice"><p role="status">{notice || (ready && !corrupt ? "変更するとこのブラウザに保存されます。" : corrupt ? "保存データを読み込めませんでした。" : "保存データを確認しています。")}</p>{undo && <Button size="sm" variant="ghost" onClick={() => { if (commit(undo, "直前の変更を取り消しました。", { undoing: true })) { setWorkspaceName(undo.name); setSelected([]); } }}><ArrowUUpLeftIcon size={16} />直前の変更を取り消す</Button>}</div>
      </div>
    </div>
    <Sheet ref={editor} id="demo-project-editor" title={draft?.id === "new" ? "新規プロジェクト" : "プロジェクトを編集"} description="保存すると一覧とボードに反映されます。" dismissible="closerequest" onCancel={event => { if (event.target === event.currentTarget) { event.preventDefault(); requestClose(); } }} onClose={event => { if (event.target === event.currentTarget) setDraft(undefined); }}>
      {draft && <form className="demo-editor" noValidate onSubmit={event => { event.preventDefault(); saveProject(); }}>
        <Field id="demo-project-name" label="プロジェクト名" required error={errors.name}><Input required maxLength={100} autoComplete="off" value={draft.name} onChange={event => patchDraft({ name: event.target.value })} placeholder="例：次のリリースを準備する" /></Field>
        <Field id="demo-project-description" label="説明" error={errors.description}><Textarea rows={3} maxLength={2000} value={draft.description} onChange={event => patchDraft({ description: event.target.value })} /></Field>
        <Combobox id="demo-project-owner" label="担当者" options={owners} value={draft.owner} onValueChange={value => patchDraft({ owner: value as Project["owner"] })} required emptyText="該当する担当者がいません。" aria-invalid={!!errors.owner} aria-describedby={errors.owner ? "demo-owner-error" : undefined} />
        {errors.owner && <p id="demo-owner-error" role="alert">{errors.owner}</p>}
        <Field id="demo-project-status" label="状態"><Select value={draft.status} onChange={event => patchDraft({ status: event.target.value as Project["status"] })}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <DatePicker id="demo-project-due" label="期限" value={draft.due} onValueChange={value => patchDraft({ due: value })} locale="ja" required aria-invalid={!!errors.due} aria-describedby={errors.due ? "demo-due-error" : undefined} />
        {errors.due && <p id="demo-due-error" role="alert">{errors.due}</p>}
        {saveError && <Alert title="保存できませんでした" tone="danger">{saveError}</Alert>}
        <div className="demo-editor-actions"><Button variant="ghost" onClick={requestClose}>キャンセル</Button><Button variant="primary" type="submit">{draft.id === "new" ? "追加する" : "変更を保存"}</Button></div>
      </form>}
    </Sheet>
    <AlertDialog ref={discard} id="demo-discard" title="編集内容を破棄しますか？" description="まだ保存していない変更があります。編集を続けることもできます。"><AlertDialog.Cancel alertDialog="demo-discard">編集を続ける</AlertDialog.Cancel><Button variant="danger" onClick={() => { discard.current?.close(); closeEditor(); }}>破棄して閉じる</Button></AlertDialog>
    <AlertDialog ref={deleteDialog} id="demo-delete" title="プロジェクトを削除しますか？" description={`「${deleting?.name ?? ""}」をこのサンプルから削除します。直後なら変更を取り消せます。`} onClose={() => setDeleting(undefined)}><div className="demo-confirm-actions">{saveError && <p role="alert">{saveError}</p>}<div><AlertDialog.Cancel alertDialog="demo-delete">キャンセル</AlertDialog.Cancel><Button variant="danger" onClick={() => { if (deleting && commit({ ...workspace, projects: projects.filter(row => row.id !== deleting.id) }, "プロジェクトを削除しました。")) { setSelected(ids => ids.filter(id => id !== deleting.id)); deleteDialog.current?.close(); } }}>削除する</Button></div></div></AlertDialog>
    <AlertDialog ref={resetDialog} id="demo-reset" title="初期データに戻しますか？" description="このブラウザに保存したサンプルの変更を置き換えます。直後なら変更を取り消せます。"><div className="demo-confirm-actions">{saveError && <p role="alert">{saveError}</p>}<div><AlertDialog.Cancel alertDialog="demo-reset">キャンセル</AlertDialog.Cancel><Button variant="danger" onClick={() => { const next = createStudioWorkspace(); if (commit(next, "初期データに戻しました。", { reset: true })) { setWorkspaceName(next.name); clearFilters(); resetDialog.current?.close(); } }}>初期データに戻す</Button></div></div></AlertDialog>
    <Command label="Studioの検索とコマンド" open={commandOpen} onOpenChange={setCommandOpen} placeholder="プロジェクトや操作を検索…" emptyText="一致する項目がありません。" closeLabel="検索を閉じる" navigationHint="移動" actionHint="開く" items={[
      { id: "new", label: "新規プロジェクト", group: "操作", disabled: corrupt, onSelect: () => edit() },
      { id: "settings", label: "ワークスペース設定", group: "操作", onSelect: () => setView("settings") },
      ...projects.map(project => ({ id: project.id, label: project.name, description: `${statusLabels[project.status]} · ${ownerName(project.owner)}`, group: "プロジェクト", keywords: project.description, disabled: corrupt, onSelect: () => edit(project) })),
    ]} />
  </div>;
}

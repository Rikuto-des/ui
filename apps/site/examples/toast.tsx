"use client";
import { ExportIcon } from "@urushi/react/icons";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, dismiss, toast } from "@urushi/react";

export default function ToastExample() {
  const [pending, setPending] = useState(false);
  const [exported, setExported] = useState(false);
  const [removed, setRemoved] = useState(false);
  const operations = useRef<{ timer?: ReturnType<typeof setInterval>; id?: string }>({});
  useEffect(() => () => { clearInterval(operations.current.timer); if (operations.current.id) dismiss(operations.current.id); }, []);
  function exportFiles(fail = false) {
    setPending(true);
    let percent = 0;
    const operation = new Promise<number>((resolve, reject) => {
      operations.current.timer = setInterval(() => {
        percent += 20;
        if (operations.current.id) toast.update(operations.current.id, { progress: percent, progressLabel: "書き出しの進捗", description: `${Math.min(percent, 100)}% · デザインファイルを準備しています` });
        if (percent >= 100) { clearInterval(operations.current.timer); setPending(false); if (fail) reject(new Error("offline")); else { setExported(true); resolve(3); } }
      }, 450);
    });
    operations.current.id = toast.promise(operation, {
      loading: "ファイルを書き出しています…",
      success: count => ({ message: `${count}件のファイルを書き出しました`, description: "この見本のファイル一覧に反映しました。", action: { label: "元に戻す", onClick: () => setExported(false) } }),
      error: () => ({ message: "書き出せませんでした", description: "接続が途切れました。もう一度試せます。", action: { label: "再試行", onClick: () => exportFiles() } }),
    });
  }
  return <div className="feedback-demo">
    <div className="experience-caption"><span>FEEDBACK</span><span>03 / 03</span></div>
    <h3>進捗と結果を通知する</h3>
    <p className="experience-muted">ひとつの通知で進捗と完了を確認し、操作を取り消せます。</p>
    <div className="export-file"><span className="export-file-icon" aria-hidden="true"><ExportIcon size={24} /></span><div><strong>Design handoff</strong><span>3 files · PDF / SVG / PNG</span></div><Badge tone={exported ? "ok" : "neutral"}>{exported ? "書き出し済み" : "準備完了"}</Badge></div>
    <div className="experience-actions"><Button variant="primary" disabled={pending} onClick={() => exportFiles()}>{pending ? "書き出し中…" : "ファイルを書き出す"}</Button><Button disabled={pending} variant="ghost" onClick={() => exportFiles(true)}>失敗と再試行を試す</Button></div>
    <div className="undo-demo"><p role="status">{removed ? "レビューのタスクを削除しました。" : "公開前のレビュー"}</p><Button size="sm" disabled={removed} onClick={() => { setRemoved(true); toast("タスクを削除しました", { duration: 8000, action: { label: "元に戻す", onClick: () => setRemoved(false) } }); }}>タスクを削除</Button></div>
    <p className="experience-footnote">この画面内の見本です。ファイルの送信や削除は行いません。</p>
  </div>;
}

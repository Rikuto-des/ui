"use client";
import { CloudArrowUpIcon, ArrowUUpLeftIcon } from "@urushi/react/icons";
import { useRef } from "react";
import { Button, Field, FileInput } from "@urushi/react";

export default function FileInputExample() {
  const input = useRef<HTMLInputElement>(null);
  const sample = () => {
    if (!input.current) return;
    const files = new DataTransfer();
    files.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#e3e7dd"/><circle cx="74" cy="50" r="32" fill="#526348"/><path d="M0 100 100 10 120 120H0" fill="#b9c2ae"/></svg>'], 'moodboard.svg', { type: 'image/svg+xml' }));
    files.items.add(new File(['色と余白の検討メモ\n森の緑と紙の白を参考に、色と余白を検討します。'], 'project-notes.txt', { type: 'text/plain' }));
    input.current.files = files.files;
    input.current.dispatchEvent(new Event('change', { bubbles: true }));
  };
  return <form className="workflow-study" onSubmit={e => e.preventDefault()}>
    <header><span className="study-eyebrow">Gather your ideas</span><h3>選んだファイルの内容を確認する</h3><p>画像のプレビューと名前、容量を確認できます。不要なファイルは一つずつ取り除けます。</p></header>
    <Field id="study-attachments" label="参考資料" description="複数選択できます。ファイルは送信されません。"><FileInput ref={input} variant="dropzone" multiple showFiles /></Field>
    <div className="study-actions"><Button onClick={sample}><CloudArrowUpIcon size={20} />見本のファイルで試す</Button><Button type="reset" variant="ghost"><ArrowUUpLeftIcon size={16} />選択をリセット</Button></div>
  </form>;
}

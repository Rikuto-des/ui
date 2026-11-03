"use client";
import { BookmarkSimpleIcon, BellIcon, BellSlashIcon } from "@urushi/react/icons";
import { NotebookIcon } from "@urushi/react/icons";
import { useState } from "react";
import { Tooltip } from "@urushi/react";
export default function TooltipExample() {
  const [saved, setSaved] = useState(false),
    [muted, setMuted] = useState(false);
  return (
    <div className="interaction-study">
      <header>
        <small>QUIET GUIDANCE</small>
        <h3>操作ボタンに補足を表示する</h3>
      </header>
      <div className="study-file">
        <span aria-hidden="true"><NotebookIcon size={24} /></span>
        <div>
          <strong>Field notes</strong>
          <p>
            {muted ? "通知オフ" : "通知オン"} / {saved ? "保存済み" : "未保存"}
          </p>
        </div>
        <div className="study-file-actions" role="group" aria-label="ノートの操作">
        <Tooltip.Trigger
          tooltip="save-note-hint"
          aria-label="ノートを保存"
          aria-pressed={saved}
          variant="ghost"
          onClick={() => setSaved(!saved)}
        >
          <BookmarkSimpleIcon weight={saved ? "fill" : "regular"} />
        </Tooltip.Trigger>
        <Tooltip.Trigger
          tooltip="mute-note-hint"
          aria-label="通知をミュート"
          aria-pressed={muted}
          variant="ghost"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <BellSlashIcon /> : <BellIcon />}
        </Tooltip.Trigger>
        </div>
      </div>
      <Tooltip id="save-note-hint">
        {saved ? "コレクションから解除" : "コレクションに保存"}
      </Tooltip>
      <Tooltip id="mute-note-hint">
        {muted ? "通知を再開" : "このノートの通知をミュート"}
      </Tooltip>
      <p className="study-caption" role="status">
        {saved
          ? "コレクションに保存しました。"
          : "保存と通知を切り替えられます。"}
      </p>
    </div>
  );
}

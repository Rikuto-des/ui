// What a coding agent typically writes against a component library it half
// remembers. `pnpm test` lints this file and checks every problem is caught.
import { Button, Card, CardHeader, Dialog, Field, Input, Menu, Popover, Tabs, TabsTrigger, Tooltip } from "@urushi/react";

export function DangerZone({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="rounded-xl bg-slate-50 p-[18px]">
      <Dialog.Trigger dialog="confrim-delete" className="bg-red-600 hover:bg-red-700 text-white rounded-lg">
        削除
      </Dialog.Trigger>
      <Dialog id="confirm-delete">
        <p style={{ color: "#6b7280" }}>この操作は取り消せません。</p>
        <Dialog.Actions>
          <Button onClick={onDelete} style={{ background: "crimson", borderRadius: 999 }}>
            OK
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Popover id="help">
        <span onClick={() => alert("help")}>?</span>
      </Popover>
      <Popover.Trigger popover="help">
        <svg width="16" height="16" />
      </Popover.Trigger>
    </div>
  );
}

export function ProjectHeader() {
  return (
    <>
      <Tabs id="project" label="プロジェクト" defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="summary">概要</Tabs.Tab>
          <Tabs.Tab value="tasks">タスク</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="summary">…</Tabs.Panel>
      </Tabs>
      <Menu.Trigger menu="project-actions">操作</Menu.Trigger>
      <Popover id="project-actions" title="操作" />
      <Tooltip.Trigger tooltip="copy-tip">
        <svg width="16" height="16" />
      </Tooltip.Trigger>
      <Tooltip id="copy-tip">リンクをコピー</Tooltip>
      <Field id="email">
        <Input type="email" className="border-gray-300 w-full" />
      </Field>
    </>
  );
}

// Names and tokens borrowed from other libraries, and a token inside a Tailwind
// arbitrary value (what an agent writes after reading "use var(--ur-color-…)").
export function PlanPicker({ selected }: { selected: boolean }) {
  return (
    <Card>
      <CardHeader>プラン</CardHeader>
      <div className={["rounded-lg p-4", selected ? "border-[var(--ur-color-brand)]" : "border-gray-200"].join(" ")}>
        <p className="text-[var(--ur-color-text-muted)]">月額 980 円</p>
      </div>
      <Tabs.Trigger value="monthly">月払い</Tabs.Trigger>
    </Card>
  );
}

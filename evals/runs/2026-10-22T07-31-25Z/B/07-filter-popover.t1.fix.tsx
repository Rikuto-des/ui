"use client";

import { useId, useState } from "react";
import { Button, Checkbox, Popover, RadioGroup } from "@yourlib/react";

export type OrderStatus = "unshipped" | "shipped" | "cancelled";
export type OrderSort = "newest" | "oldest" | "amountDesc";

export type OrderFilterValue = {
  statuses: OrderStatus[];
  sort: OrderSort;
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "unshipped", label: "未発送" },
  { value: "shipped", label: "発送済み" },
  { value: "cancelled", label: "キャンセル" },
];

const SORT_OPTIONS: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
  { value: "amountDesc", label: "金額の高い順" },
];

const DEFAULT_VALUE: OrderFilterValue = {
  statuses: [],
  sort: "newest",
};

type OrderFilterProps = {
  value?: OrderFilterValue;
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({ value, onApply }: OrderFilterProps) {
  const popoverId = useId();
  const sortName = useId();

  const [applied, setApplied] = useState<OrderFilterValue>(
    value ?? DEFAULT_VALUE,
  );
  const [draft, setDraft] = useState<OrderFilterValue>(applied);
  // RadioGroup は defaultValue で初期値を決めるので、値を戻すときは作り直す
  const [formKey, setFormKey] = useState(0);

  const current = value ?? applied;
  const activeCount =
    current.statuses.length + (current.sort !== DEFAULT_VALUE.sort ? 1 : 0);

  const handleToggle = (event: { newState: string }) => {
    if (event.newState === "open") {
      // パネルを開くたびに、適用済みの条件から編集を始める
      setDraft(current);
      setFormKey((k) => k + 1);
    }
  };

  const toggleStatus = (status: OrderStatus, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      statuses: checked
        ? prev.statuses.includes(status)
          ? prev.statuses
          : [...prev.statuses, status]
        : prev.statuses.filter((s) => s !== status),
    }));
  };

  const closePanel = () => {
    const el = document.getElementById(popoverId) as
      | (HTMLElement & { hidePopover?: () => void })
      | null;
    el?.hidePopover?.();
  };

  const handleApply = () => {
    setApplied(draft);
    onApply?.(draft);
    closePanel();
  };

  const handleClear = () => {
    setDraft(DEFAULT_VALUE);
    setFormKey((k) => k + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover.Trigger popover={popoverId}>
        絞り込み{activeCount > 0 ? `（${activeCount}）` : ""}
      </Popover.Trigger>

      <Popover
        id={popoverId}
        aria-label="注文の絞り込み"
        side="bottom"
        align="start"
        onToggle={handleToggle}
      >
        <div key={formKey} className="flex w-72 flex-col gap-5 p-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold">状態</legend>
            {STATUS_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                checked={draft.statuses.includes(option.value)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  toggleStatus(option.value, e.currentTarget.checked)
                }
              >
                {option.label}
              </Checkbox>
            ))}
          </fieldset>

          <RadioGroup
            name={sortName}
            legend="並び順"
            defaultValue={draft.sort}
          >
            {SORT_OPTIONS.map((option) => (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = e.currentTarget.value as OrderSort;
                  setDraft((prev) => ({ ...prev, sort: next }));
                }}
              >
                {option.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={handleClear}>
              クリア
            </Button>
            <Button variant="primary" onClick={handleApply}>
              適用
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

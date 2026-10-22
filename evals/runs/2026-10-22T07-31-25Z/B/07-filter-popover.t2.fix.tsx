"use client";

import { useState } from "react";
import { Button, Popover, Checkbox, RadioGroup, Badge } from "@yourlib/react";

export type OrderStatus = "pending" | "shipped" | "cancelled";
export type OrderSort = "newest" | "oldest" | "amount_desc";

export type OrderFilterValue = {
  statuses: OrderStatus[];
  sort: OrderSort;
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "未発送" },
  { value: "shipped", label: "発送済み" },
  { value: "cancelled", label: "キャンセル" },
];

const SORT_OPTIONS: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
  { value: "amount_desc", label: "金額の高い順" },
];

const DEFAULT_FILTER: OrderFilterValue = {
  statuses: [],
  sort: "newest",
};

const POPOVER_ID = "order-filter-panel";

type OrderFilterProps = {
  value?: OrderFilterValue;
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({ value, onApply }: OrderFilterProps) {
  const [applied, setApplied] = useState<OrderFilterValue>(
    value ?? DEFAULT_FILTER,
  );
  const [draft, setDraft] = useState<OrderFilterValue>(applied);
  // RadioGroup は defaultValue で初期値を決めるため、値を戻すときは作り直す
  const [formKey, setFormKey] = useState(0);

  const current = value ?? applied;

  const resetDraft = (next: OrderFilterValue) => {
    setDraft(next);
    setFormKey((k) => k + 1);
  };

  const handleToggle = (event: { newState: string }) => {
    if (event.newState === "open") {
      // 開くたびに適用済みの値から編集を始める
      resetDraft(current);
    }
  };

  const toggleStatus = (status: OrderStatus, checked: boolean) => {
    setDraft((d) => ({
      ...d,
      statuses: checked
        ? [...d.statuses.filter((s) => s !== status), status]
        : d.statuses.filter((s) => s !== status),
    }));
  };

  const handleApply = () => {
    setApplied(draft);
    onApply?.(draft);
    const panel = document.getElementById(POPOVER_ID) as
      | (HTMLElement & { hidePopover?: () => void })
      | null;
    panel?.hidePopover?.();
  };

  const handleClear = () => {
    resetDraft(DEFAULT_FILTER);
  };

  const activeCount =
    current.statuses.length + (current.sort !== DEFAULT_FILTER.sort ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <Popover.Trigger popover={POPOVER_ID}>
        絞り込み
        {activeCount > 0 && (
          <Badge className="ml-2" aria-label={`${activeCount}件の条件を適用中`}>
            {activeCount}
          </Badge>
        )}
      </Popover.Trigger>

      <Popover
        id={POPOVER_ID}
        aria-label="注文の絞り込み"
        side="bottom"
        align="start"
        onToggle={handleToggle}
      >
        <div className="flex w-72 flex-col gap-5 p-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">状態</legend>
            {STATUS_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                value={option.value}
                checked={draft.statuses.includes(option.value)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  toggleStatus(option.value, event.currentTarget.checked)
                }
              >
                {option.label}
              </Checkbox>
            ))}
          </fieldset>

          <RadioGroup
            key={formKey}
            name="order-sort"
            legend="並び順"
            defaultValue={draft.sort}
          >
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((option) => (
                <RadioGroup.Item
                  key={option.value}
                  value={option.value}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const sort = event.currentTarget.value as OrderSort;
                    setDraft((d) => ({ ...d, sort }));
                  }}
                >
                  {option.label}
                </RadioGroup.Item>
              ))}
            </div>
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

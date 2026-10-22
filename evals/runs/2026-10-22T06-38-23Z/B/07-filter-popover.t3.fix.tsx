"use client";

import { useState } from "react";
import { Button, Checkbox, Popover, RadioGroup } from "@yourlib/react";

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

const PANEL_ID = "order-filter-panel";

type OrderFilterProps = {
  value?: OrderFilterValue;
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({ value, onApply }: OrderFilterProps) {
  const [applied, setApplied] = useState<OrderFilterValue>(
    value ?? DEFAULT_FILTER,
  );
  const [draft, setDraft] = useState<OrderFilterValue>(applied);
  const [open, setOpen] = useState(false);

  const current = value ?? applied;

  const handleOpenChange = (next: boolean) => {
    // パネルを開くたびに、現在適用中の条件から編集を始める
    if (next) setDraft(current);
    setOpen(next);
  };

  const toggleStatus = (status: OrderStatus, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      statuses: checked
        ? [...prev.statuses, status]
        : prev.statuses.filter((s) => s !== status),
    }));
  };

  const handleApply = () => {
    setApplied(draft);
    onApply?.(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(DEFAULT_FILTER);
  };

  const activeCount =
    current.statuses.length + (current.sort !== DEFAULT_FILTER.sort ? 1 : 0);

  return (
    <div className="relative inline-block">
      <Popover.Trigger target={PANEL_ID}>
        絞り込み
        {activeCount > 0 && (
          <span
            className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--yl-color-secondary)",
              color: "var(--yl-color-text)",
            }}
          >
            {activeCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover
        id={PANEL_ID}
        aria-label="注文の絞り込み"
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
        className="w-72"
      >
        <div className="flex flex-col gap-5 p-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">状態</legend>
            {STATUS_OPTIONS.map((option) => {
              const id = `order-filter-status-${option.value}`;
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={draft.statuses.includes(option.value)}
                    onCheckedChange={(checked: boolean) =>
                      toggleStatus(option.value, checked === true)
                    }
                  />
                  <label htmlFor={id} className="cursor-pointer text-sm">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </fieldset>

          <RadioGroup
            name="order-filter-sort"
            legend="並び順"
            value={draft.sort}
            onValueChange={(next: string) =>
              setDraft((prev) => ({ ...prev, sort: next as OrderSort }))
            }
          >
            {SORT_OPTIONS.map((option) => {
              const id = `order-filter-sort-${option.value}`;
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroup.Item id={id} value={option.value} />
                  <label htmlFor={id} className="cursor-pointer text-sm">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={handleClear}>
              クリア
            </Button>
            <Button onClick={handleApply}>適用</Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

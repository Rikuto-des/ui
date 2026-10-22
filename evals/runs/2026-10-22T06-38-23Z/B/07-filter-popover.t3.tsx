"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
} from "@yourlib/react";

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
    <div className="flex items-center justify-start">
      <Popover open={open} onOpenChange={handleOpenChange} placement="bottom-start">
        <PopoverTrigger asChild>
          <Button variant="outline" aria-haspopup="dialog" aria-expanded={open}>
            絞り込み
            {activeCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-medium text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4" aria-label="注文の絞り込み">
          <div className="flex flex-col gap-5">
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

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">並び順</legend>
              <RadioGroup
                value={draft.sort}
                onValueChange={(next: string) =>
                  setDraft((prev) => ({ ...prev, sort: next as OrderSort }))
                }
                className="flex flex-col gap-2"
              >
                {SORT_OPTIONS.map((option) => {
                  const id = `order-filter-sort-${option.value}`;
                  return (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem id={id} value={option.value} />
                      <label htmlFor={id} className="cursor-pointer text-sm">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </fieldset>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={handleClear}>
                クリア
              </Button>
              <Button onClick={handleApply}>適用</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

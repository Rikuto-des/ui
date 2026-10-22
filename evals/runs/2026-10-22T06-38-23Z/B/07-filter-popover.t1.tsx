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
export type OrderSort = "newest" | "oldest" | "amountDesc";

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
  { value: "amountDesc", label: "金額の高い順" },
];

const DEFAULT_FILTER: OrderFilterValue = {
  statuses: [],
  sort: "newest",
};

type OrderFilterProps = {
  defaultValue?: OrderFilterValue;
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({
  defaultValue = DEFAULT_FILTER,
  onApply,
}: OrderFilterProps) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<OrderFilterValue>(defaultValue);
  const [draft, setDraft] = useState<OrderFilterValue>(defaultValue);

  const activeCount =
    applied.statuses.length + (applied.sort !== DEFAULT_FILTER.sort ? 1 : 0);

  const handleOpenChange = (next: boolean) => {
    // 開くときは適用済みの条件から編集を始める（未適用の変更は破棄）
    if (next) setDraft(applied);
    setOpen(next);
  };

  const toggleStatus = (status: OrderStatus, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      statuses: checked
        ? STATUS_OPTIONS.map((o) => o.value).filter(
            (v) => v === status || prev.statuses.includes(v),
          )
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
    setApplied(DEFAULT_FILTER);
    onApply?.(DEFAULT_FILTER);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            絞り込み
            {activeCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-xs text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-72 p-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApply();
            }}
            className="flex flex-col gap-4"
          >
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">状態</legend>
              {STATUS_OPTIONS.map((option) => {
                const id = `order-filter-status-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={draft.statuses.includes(option.value)}
                      onCheckedChange={(checked) =>
                        toggleStatus(option.value, checked === true)
                      }
                    />
                    <label htmlFor={id} className="text-sm">
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
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, sort: value as OrderSort }))
                }
                className="flex flex-col gap-2"
              >
                {SORT_OPTIONS.map((option) => {
                  const id = `order-filter-sort-${option.value}`;
                  return (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem id={id} value={option.value} />
                      <label htmlFor={id} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </fieldset>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="ghost" onClick={handleClear}>
                クリア
              </Button>
              <Button type="submit">適用</Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

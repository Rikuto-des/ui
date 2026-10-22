"use client";

import { useId, useState } from "react";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
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

export const DEFAULT_ORDER_FILTER: OrderFilterValue = {
  statuses: [],
  sort: "newest",
};

type OrderFilterProps = {
  value?: OrderFilterValue;
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({
  value: controlledValue,
  onApply,
}: OrderFilterProps) {
  const [appliedValue, setAppliedValue] = useState<OrderFilterValue>(
    controlledValue ?? DEFAULT_ORDER_FILTER,
  );
  const applied = controlledValue ?? appliedValue;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<OrderFilterValue>(applied);

  const statusLegendId = useId();
  const sortLegendId = useId();

  const activeCount =
    applied.statuses.length +
    (applied.sort !== DEFAULT_ORDER_FILTER.sort ? 1 : 0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      // 開くたびに現在適用中の条件から編集を始める
      setDraft(applied);
    }
    setOpen(nextOpen);
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

  const commit = (next: OrderFilterValue) => {
    setAppliedValue(next);
    onApply?.(next);
    setOpen(false);
  };

  const handleApply = () => commit(draft);

  const handleClear = () => {
    setDraft(DEFAULT_ORDER_FILTER);
    commit(DEFAULT_ORDER_FILTER);
  };

  return (
    <div className="flex items-center">
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

        <PopoverContent side="bottom" align="start" sideOffset={4}>
          <form
            className="flex w-64 flex-col gap-4 p-1"
            onSubmit={(e) => {
              e.preventDefault();
              handleApply();
            }}
          >
            <fieldset aria-labelledby={statusLegendId} className="flex flex-col gap-2">
              <legend id={statusLegendId} className="mb-1 text-sm font-semibold">
                状態
              </legend>
              {STATUS_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  checked={draft.statuses.includes(option.value)}
                  onCheckedChange={(checked: boolean) =>
                    toggleStatus(option.value, checked === true)
                  }
                >
                  {option.label}
                </Checkbox>
              ))}
            </fieldset>

            <fieldset aria-labelledby={sortLegendId} className="flex flex-col gap-2">
              <legend id={sortLegendId} className="mb-1 text-sm font-semibold">
                並び順
              </legend>
              <RadioGroup
                aria-labelledby={sortLegendId}
                value={draft.sort}
                onValueChange={(sort: string) =>
                  setDraft((prev) => ({ ...prev, sort: sort as OrderSort }))
                }
                className="flex flex-col gap-2"
              >
                {SORT_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            </fieldset>

            <div className="flex justify-end gap-2 border-t pt-3">
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

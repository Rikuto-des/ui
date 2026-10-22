"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
} from "@yourlib/react";

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
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<OrderFilterValue>(
    value ?? DEFAULT_VALUE,
  );
  const [draft, setDraft] = useState<OrderFilterValue>(applied);

  const current = value ?? applied;
  const activeCount =
    current.statuses.length + (current.sort !== DEFAULT_VALUE.sort ? 1 : 0);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // パネルを開くたびに、適用済みの条件から編集を始める
      setDraft(current);
    }
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
    setDraft(DEFAULT_VALUE);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Button variant="outline">
            絞り込み{activeCount > 0 ? `（${activeCount}）` : ""}
          </Button>
        </PopoverTrigger>

        <PopoverContent aria-label="注文の絞り込み">
          <div className="flex w-72 flex-col gap-5 p-4">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">状態</legend>
              {STATUS_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  checked={draft.statuses.includes(option.value)}
                  onCheckedChange={(checked: boolean) =>
                    toggleStatus(option.value, checked)
                  }
                >
                  {option.label}
                </Checkbox>
              ))}
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">並び順</legend>
              <RadioGroup
                aria-label="並び順"
                value={draft.sort}
                onValueChange={(next: string) =>
                  setDraft((prev) => ({ ...prev, sort: next as OrderSort }))
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            </fieldset>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={handleClear}>
                クリア
              </Button>
              <Button variant="primary" onClick={handleApply}>
                適用
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

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
  const activeCount =
    current.statuses.length + (current.sort !== DEFAULT_FILTER.sort ? 1 : 0);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // 開くたびに、適用済みの条件から編集を始める
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
    setDraft(DEFAULT_FILTER);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        id={PANEL_ID}
        aria-label="注文の絞り込み"
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
      >
        <PopoverTrigger asChild>
          <Button variant="secondary">
            絞り込み
            {activeCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--yl-color-accent)] px-1.5 text-xs font-medium text-[var(--yl-color-on-accent)]">
                <span className="sr-only">適用中の条件 </span>
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApply();
            }}
            className="flex flex-col gap-5"
          >
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">状態</legend>
              {STATUS_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  name="status"
                  value={option.value}
                  checked={draft.statuses.includes(option.value)}
                  onCheckedChange={(checked: boolean) =>
                    toggleStatus(option.value, checked)
                  }
                >
                  {option.label}
                </Checkbox>
              ))}
            </fieldset>

            <RadioGroup
              legend="並び順"
              name="sort"
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

            <div className="flex justify-end gap-2 border-t border-[var(--yl-color-border)] pt-4">
              <Button type="button" variant="ghost" onClick={handleClear}>
                クリア
              </Button>
              <Button type="submit" variant="primary">
                適用
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

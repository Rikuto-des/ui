"use client";

import { useState } from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio,
  Badge,
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
    if (next) {
      // 開くたびに適用済みの値から編集を始める
      setDraft(current);
    }
    setOpen(next);
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
    <div className="flex items-center gap-2">
      <Popover
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Button variant="outline" aria-haspopup="dialog" aria-expanded={open}>
            絞り込み
            {activeCount > 0 && (
              <Badge className="ml-2" aria-label={`${activeCount}件の条件を適用中`}>
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4" aria-label="注文の絞り込み">
          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">状態</legend>
              <CheckboxGroup
                value={draft.statuses}
                onChange={(statuses: string[]) =>
                  setDraft((d) => ({
                    ...d,
                    statuses: statuses as OrderStatus[],
                  }))
                }
                className="flex flex-col gap-2"
              >
                {STATUS_OPTIONS.map((option) => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">並び順</legend>
              <RadioGroup
                name="order-sort"
                value={draft.sort}
                onChange={(sort: string) =>
                  setDraft((d) => ({ ...d, sort: sort as OrderSort }))
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

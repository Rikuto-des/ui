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

export const DEFAULT_ORDER_FILTER: OrderFilterValue = {
  statuses: [],
  sort: "newest",
};

type OrderFilterProps = {
  /** 現在適用されている条件 */
  value?: OrderFilterValue;
  /** 「適用」が押されたときに呼ばれる */
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({
  value = DEFAULT_ORDER_FILTER,
  onApply,
}: OrderFilterProps) {
  const [open, setOpen] = useState(false);
  // パネル内で編集中の条件（「適用」を押すまで反映しない）
  const [draft, setDraft] = useState<OrderFilterValue>(value);

  const handleOpenChange = (next: boolean) => {
    // 開くたびに、現在適用中の条件から編集を始める
    if (next) setDraft(value);
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
    onApply?.(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(DEFAULT_ORDER_FILTER);
  };

  const activeCount =
    value.statuses.length + (value.sort !== DEFAULT_ORDER_FILTER.sort ? 1 : 0);

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={handleOpenChange} placement="bottom-start">
        <PopoverTrigger>
          <Button variant="outline">
            絞り込み
            {activeCount > 0 && (
              <span className="ml-2 rounded-full bg-gray-900 px-2 text-xs text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4">
          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">状態</legend>
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
              <legend className="mb-2 text-sm font-semibold">並び順</legend>
              <RadioGroup
                value={draft.sort}
                onValueChange={(sort: string) =>
                  setDraft((prev) => ({ ...prev, sort: sort as OrderSort }))
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

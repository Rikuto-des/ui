"use client";

import { useId, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
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

export function OrderFilter({ value, onApply }: OrderFilterProps) {
  const baseId = useId();
  const popoverId = `${baseId}-order-filter`;
  const sortName = `${baseId}-order-sort`;

  const [applied, setApplied] = useState<OrderFilterValue>(
    value ?? DEFAULT_ORDER_FILTER,
  );
  const current = value ?? applied;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<OrderFilterValue>(current);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // パネルを開くたびに、現在適用中の条件から編集を始める
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
    setDraft(DEFAULT_ORDER_FILTER);
  };

  const activeCount =
    current.statuses.length +
    (current.sort !== DEFAULT_ORDER_FILTER.sort ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <Popover
        id={popoverId}
        aria-label="注文の絞り込み"
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Button variant="secondary" aria-haspopup="dialog" aria-expanded={open}>
            絞り込み
            {activeCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--yl-color-accent)] px-1.5 text-xs font-semibold text-[var(--yl-color-on-accent)]">
                {activeCount}
                <span className="sr-only">件の条件を適用中</span>
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4">
          <div className="flex flex-col gap-5">
            <CheckboxGroup
              label="状態"
              value={draft.statuses}
              onChange={(statuses: string[]) =>
                setDraft((d) => ({ ...d, statuses: statuses as OrderStatus[] }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </CheckboxGroup>

            <RadioGroup
              name={sortName}
              legend="並び順"
              value={draft.sort}
              onChange={(sort: string) =>
                setDraft((d) => ({ ...d, sort: sort as OrderSort }))
              }
            >
              {SORT_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>

            <div className="flex justify-end gap-2 border-t border-[var(--yl-color-border)] pt-4">
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

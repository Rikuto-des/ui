"use client";

import { useId, useState } from "react";
import {
  Button,
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
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

const DEFAULT_FILTER: OrderFilterValue = {
  statuses: [],
  sort: "newest",
};

type OrderFilterProps = {
  /** 適用中のフィルター（省略時は内部で管理） */
  value?: OrderFilterValue;
  /** 「適用」を押したときに呼ばれる */
  onApply?: (value: OrderFilterValue) => void;
};

export function OrderFilter({ value, onApply }: OrderFilterProps) {
  const baseId = useId();
  const [internalApplied, setInternalApplied] =
    useState<OrderFilterValue>(DEFAULT_FILTER);
  const applied = value ?? internalApplied;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<OrderFilterValue>(applied);

  const handleOpenChange = (next: boolean) => {
    // 開くたびに、適用中の値から編集を始める
    if (next) setDraft(applied);
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
    // 選択肢の並び順に揃えて渡す
    const next: OrderFilterValue = {
      ...draft,
      statuses: STATUS_OPTIONS.map((o) => o.value).filter((v) =>
        draft.statuses.includes(v)
      ),
    };
    if (value === undefined) setInternalApplied(next);
    onApply?.(next);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(DEFAULT_FILTER);
  };

  const activeCount =
    applied.statuses.length + (applied.sort !== DEFAULT_FILTER.sort ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" aria-haspopup="dialog">
            絞り込み
            {activeCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-xs font-medium text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent side="bottom" align="start" sideOffset={4} className="w-72 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApply();
            }}
            className="flex flex-col gap-5"
          >
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">状態</legend>
              {STATUS_OPTIONS.map((option) => {
                const id = `${baseId}-status-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={draft.statuses.includes(option.value)}
                      onCheckedChange={(checked) =>
                        toggleStatus(option.value, checked === true)
                      }
                    />
                    <Label htmlFor={id}>{option.label}</Label>
                  </div>
                );
              })}
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">並び順</legend>
              <RadioGroup
                value={draft.sort}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, sort: v as OrderSort }))
                }
                className="flex flex-col gap-2"
              >
                {SORT_OPTIONS.map((option) => {
                  const id = `${baseId}-sort-${option.value}`;
                  return (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem id={id} value={option.value} />
                      <Label htmlFor={id}>{option.label}</Label>
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

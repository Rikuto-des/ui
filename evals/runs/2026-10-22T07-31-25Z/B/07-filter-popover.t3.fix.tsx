"use client";

import { useId, useState } from "react";
import { Button, Checkbox, Popover, RadioGroup } from "@yourlib/react";

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
  const popoverId = `order-filter-${useId()}`;
  const sortName = `order-sort-${useId()}`;

  // パネル内で編集中の条件（「適用」を押すまで反映しない）
  const [draft, setDraft] = useState<OrderFilterValue>(value);
  // 並び順の RadioGroup は defaultValue で初期値を持つため、
  // 初期値を入れ直したいときは key を変えて作り直す
  const [formKey, setFormKey] = useState(0);

  const resetDraft = (next: OrderFilterValue) => {
    setDraft(next);
    setFormKey((k) => k + 1);
  };

  const handleToggle = (event: { newState: string }) => {
    // 開くたびに、現在適用中の条件から編集を始める
    if (event.newState === "open") resetDraft(value);
  };

  const toggleStatus = (status: OrderStatus, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      statuses: checked
        ? prev.statuses.includes(status)
          ? prev.statuses
          : [...prev.statuses, status]
        : prev.statuses.filter((s) => s !== status),
    }));
  };

  const closePanel = () => {
    const el = document.getElementById(popoverId) as
      | (HTMLElement & { hidePopover?: () => void })
      | null;
    el?.hidePopover?.();
  };

  const handleApply = () => {
    onApply?.(draft);
    closePanel();
  };

  const handleClear = () => {
    resetDraft(DEFAULT_ORDER_FILTER);
  };

  const activeCount =
    value.statuses.length + (value.sort !== DEFAULT_ORDER_FILTER.sort ? 1 : 0);

  return (
    <div className="flex items-center">
      <Popover.Trigger popover={popoverId}>
        絞り込み
        {activeCount > 0 && (
          <span
            className="ml-2 rounded-full px-2 text-xs"
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
        id={popoverId}
        title="絞り込み"
        side="bottom"
        align="start"
        onToggle={handleToggle}
      >
        <div key={formKey} className="flex w-72 flex-col gap-5 p-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">状態</legend>
            {STATUS_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                checked={draft.statuses.includes(option.value)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  toggleStatus(option.value, e.currentTarget.checked)
                }
              >
                {option.label}
              </Checkbox>
            ))}
          </fieldset>

          <RadioGroup name={sortName} legend="並び順" defaultValue={draft.sort}>
            {SORT_OPTIONS.map((option) => (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const sort = e.currentTarget.value as OrderSort;
                  setDraft((prev) => ({ ...prev, sort }));
                }}
              >
                {option.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={handleClear}>
              クリア
            </Button>
            <Button variant="primary" onClick={handleApply}>
              適用
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

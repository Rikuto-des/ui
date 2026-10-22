import { Button, Checkbox, Popover, RadioGroup } from "@yourlib/react";

type OrderStatus = "unshipped" | "shipped" | "cancelled";
type OrderSort = "newest" | "oldest" | "amount-desc";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "unshipped", label: "未発送" },
  { value: "shipped", label: "発送済み" },
  { value: "cancelled", label: "キャンセル" },
];

const SORT_OPTIONS: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
  { value: "amount-desc", label: "金額の高い順" },
];

export type OrderFiltersProps = {
  /** URL to submit the filter form to (GET). Defaults to the current page. */
  action?: string;
  /** Statuses that are currently applied. */
  defaultStatuses?: OrderStatus[];
  /** Sort order that is currently applied. */
  defaultSort?: OrderSort;
};

export function OrderFilters({
  action,
  defaultStatuses = [],
  defaultSort = "newest",
}: OrderFiltersProps) {
  return (
    <div className="flex items-center justify-end">
      <Popover.Trigger popover="order-filters" variant="secondary">
        絞り込み
      </Popover.Trigger>

      <Popover id="order-filters" title="絞り込み" side="bottom" align="start">
        <form method="get" action={action} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-medium">状態</legend>
            {STATUS_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                name="status"
                value={option.value}
                defaultChecked={defaultStatuses.includes(option.value)}
              >
                {option.label}
              </Checkbox>
            ))}
          </fieldset>

          <RadioGroup name="sort" legend="並び順" defaultValue={defaultSort}>
            {SORT_OPTIONS.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                {option.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="reset">
              クリア
            </Button>
            <Button variant="primary" type="submit">
              適用
            </Button>
          </div>
        </form>
      </Popover>
    </div>
  );
}

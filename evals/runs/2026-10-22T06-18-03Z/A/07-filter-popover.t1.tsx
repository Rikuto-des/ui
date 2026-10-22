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

type OrderFiltersProps = {
  /** 現在適用されている状態（URL の検索パラメーターなどから渡す） */
  statuses?: OrderStatus[];
  /** 現在適用されている並び順 */
  sort?: OrderSort;
  /** フォームの送信先（既定は現在のページ） */
  action?: string;
};

export function OrderFilters({
  statuses = [],
  sort = "newest",
  action = "",
}: OrderFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Popover.Trigger popover="order-filters" variant="secondary">
        絞り込み
      </Popover.Trigger>

      <Popover id="order-filters" title="絞り込み" side="bottom" align="start">
        <form method="get" action={action} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2">状態</legend>
            {STATUS_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                name="status"
                value={option.value}
                defaultChecked={statuses.includes(option.value)}
              >
                {option.label}
              </Checkbox>
            ))}
          </fieldset>

          <RadioGroup name="sort" legend="並び順" defaultValue={sort}>
            {SORT_OPTIONS.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                {option.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-2">
            <Button type="reset" variant="ghost">
              クリア
            </Button>
            <Button type="submit" variant="primary">
              適用
            </Button>
          </div>
        </form>
      </Popover>
    </div>
  );
}

import { Button, Checkbox, Popover, RadioGroup } from "@yourlib/react";

const STATUS_OPTIONS = [
  { value: "unshipped", label: "未発送" },
  { value: "shipped", label: "発送済み" },
  { value: "cancelled", label: "キャンセル" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
  { value: "amount-desc", label: "金額の高い順" },
] as const;

export function OrderFilters() {
  return (
    <div className="flex items-center gap-3">
      <Popover.Trigger popover="order-filters" variant="secondary">
        絞り込み
      </Popover.Trigger>

      <Popover id="order-filters" title="絞り込み" side="bottom" align="start">
        <form method="get" className="flex w-72 flex-col gap-5">
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend
              className="mb-2 p-0"
              style={{
                color: "var(--yl-color-text)",
                fontSize: "var(--yl-font-size-control)",
                fontWeight: "var(--yl-font-weight-control)",
              }}
            >
              状態
            </legend>
            {STATUS_OPTIONS.map((option) => (
              <Checkbox key={option.value} name="status" value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </fieldset>

          <RadioGroup name="sort" legend="並び順" defaultValue="newest">
            {SORT_OPTIONS.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                {option.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-3">
            <Button type="reset" variant="secondary">
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

import { Button, Checkbox, Popover, RadioGroup } from "@yourlib/react";

export function OrderFilters() {
  return (
    <div className="flex items-center gap-3">
      <Popover.Trigger popover="order-filters" variant="secondary">
        絞り込み
      </Popover.Trigger>

      <Popover id="order-filters" title="絞り込み" side="bottom" align="start">
        <form method="get" className="flex w-72 flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend
              className="mb-2"
              style={{
                color: "var(--yl-color-text-muted)",
                fontSize: "var(--yl-font-size-small)",
              }}
            >
              状態
            </legend>
            <Checkbox name="status" value="unshipped">
              未発送
            </Checkbox>
            <Checkbox name="status" value="shipped">
              発送済み
            </Checkbox>
            <Checkbox name="status" value="cancelled">
              キャンセル
            </Checkbox>
          </fieldset>

          <RadioGroup name="sort" legend="並び順" defaultValue="newest">
            <RadioGroup.Item value="newest">新しい順</RadioGroup.Item>
            <RadioGroup.Item value="oldest">古い順</RadioGroup.Item>
            <RadioGroup.Item value="amount-desc">金額の高い順</RadioGroup.Item>
          </RadioGroup>

          <div className="flex justify-end gap-3">
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

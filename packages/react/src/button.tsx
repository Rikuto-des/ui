import { renderButton, type ButtonProps } from "./button-base.tsx";
import { buttonSlot } from "./generated/button.ts";

export type { ButtonProps } from "./button-base.tsx";

export function Button(props: ButtonProps) {
  return renderButton(buttonSlot, props);
}

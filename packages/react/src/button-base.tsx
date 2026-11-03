import type * as React from "react";
import { buttonDefaults, type ButtonOwnProps } from "./generated/button.ts";

// Kept apart from button.tsx so that file exports only the Button component:
// a module that also exports a plain function cannot be Fast Refreshed, and
// every hot update to it would reload the whole page.

export type ButtonProps = ButtonOwnProps & Omit<React.ComponentPropsWithRef<"button">, keyof ButtonOwnProps>;

/** Props shared by every part that renders as a Button (triggers, close buttons). */
export type ButtonLikeProps = Omit<ButtonProps, "command" | "commandfor">;

function preventActivation(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

/**
 * Internal renderer shared by Button and the parts built on it. `slot` is a
 * space-separated data-slot list so packs can target `[data-slot~="button"]`
 * and parts keep their own name (e.g. "dialog-trigger button").
 *
 * No hooks and no event handlers unless the caller passes one, so it renders
 * in React Server Components.
 */
export function renderButton(slot: string, props: ButtonProps) {
  const {
    variant = buttonDefaults.variant,
    size = buttonDefaults.size,
    loading = buttonDefaults.loading,
    type = "button",
    command,
    commandfor,
    onClick,
    children,
    ...rest
  } = props;
  return (
    <button
      {...rest}
      // A loading button must never submit or fire its command a second time.
      type={loading && type === "submit" ? "button" : type}
      {...(loading ? {} : { command, commandfor })}
      data-slot={slot}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "" : undefined}
      aria-disabled={loading ? true : rest["aria-disabled"]}
      aria-busy={loading || undefined}
      onClick={loading && onClick ? preventActivation : onClick}
    >
      {loading ? <span data-slot="button-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

declare module "react" {
  // Invoker commands are not in @types/react yet; React passes lowercase attributes through.
  interface ButtonHTMLAttributes<T> {
    command?: string | undefined;
    commandfor?: string | undefined;
    /** Interest invokers (Chromium): show the referenced popover on hover and focus. */
    interestfor?: string | undefined;
  }
  interface AnchorHTMLAttributes<T> {
    /** Interest invokers (Chromium): show the referenced popover on hover and focus. */
    interestfor?: string | undefined;
  }
}

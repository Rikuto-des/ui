import type * as React from "react";
import { otpInputDefaults, otpInputSlot, type OTPInputOwnProps } from "./generated/otp-input.ts";

export type OTPInputProps = OTPInputOwnProps & Omit<React.ComponentPropsWithRef<"input">, keyof OTPInputOwnProps | "type">;

/**
 * One text input drawn as separate boxes by its background. It stays a single
 * field: one-time-code autofill, paste and screen readers work as usual.
 */
export function OTPInput({ length = otpInputDefaults.length, invalid = otpInputDefaults.invalid, style, ...rest }: OTPInputProps) {
  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern={`[0-9]{${length}}`}
      maxLength={length}
      spellCheck={false}
      {...rest}
      type="text"
      data-slot={otpInputSlot}
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
      style={{ "--ur-otp-length": length, ...style } as React.CSSProperties}
    />
  );
}

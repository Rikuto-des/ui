import type * as React from "react";
import { badgeDefaults, badgeSlot, type BadgeOwnProps } from "./generated/badge.ts";

export type BadgeProps = BadgeOwnProps & Omit<React.ComponentPropsWithRef<"span">, keyof BadgeOwnProps>;

export function Badge({ tone = badgeDefaults.tone, dot = badgeDefaults.dot, ...rest }: BadgeProps) {
  return <span {...rest} data-slot={badgeSlot} data-tone={tone} data-dot={dot ? "" : undefined} />;
}

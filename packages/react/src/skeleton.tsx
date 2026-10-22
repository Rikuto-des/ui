import type * as React from "react";
import { skeletonDefaults, skeletonSlot, type SkeletonOwnProps } from "./generated/skeleton.ts";

export type SkeletonProps = SkeletonOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof SkeletonOwnProps>;

export function Skeleton({ shape = skeletonDefaults.shape, lines = skeletonDefaults.lines, ...rest }: SkeletonProps) {
  if (shape === "text" && lines > 1) {
    return (
      <div {...rest} aria-hidden="true" data-slot="skeleton-lines">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} data-slot={skeletonSlot} data-shape="text" />
        ))}
      </div>
    );
  }
  return <div {...rest} aria-hidden="true" data-slot={skeletonSlot} data-shape={shape} />;
}

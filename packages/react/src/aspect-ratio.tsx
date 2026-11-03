import type * as React from "react";
import { aspectRatioDefaults, aspectRatioSlot, type AspectRatioOwnProps } from "./generated/aspect-ratio.ts";

export type AspectRatioProps = AspectRatioOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof AspectRatioOwnProps>;

export function AspectRatio({ ratio = aspectRatioDefaults.ratio, style, ...rest }: AspectRatioProps) {
  return <div {...rest} data-slot={aspectRatioSlot} style={{ aspectRatio: ratio, ...style }} />;
}

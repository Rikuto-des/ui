import type * as React from "react";
import {
  avatarDefaults,
  avatarSlot,
  type AvatarOwnProps,
} from "./generated/avatar.ts";

export type AvatarProps = AvatarOwnProps &
  Omit<React.ComponentPropsWithRef<"span">, keyof AvatarOwnProps | "children">;

/** The first character of a CJK name (佐藤 → 佐), or up to two initials of a Latin one. */
export function initialOf(name: string): string {
  const text = name.trim();
  if (!text) return "?";
  const first = (value: string) =>
    [
      ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
        value,
      ),
    ][0]?.segment ?? "";
  if (/^[぀-ヿ㐀-鿿豈-﫿가-힯]/.test(text)) return first(text);
  const words = text.split(/\s+/);
  return (first(words[0]) + first(words[1] ?? "")).toUpperCase();
}

/**
 * role=img named by `name`. The initial sits behind the picture and shows when
 * there is no src; a picture that fails to load draws the initial over the
 * browser's broken-image icon (data-initial, in CSS). No JavaScript.
 */
export function Avatar({
  name,
  src,
  status,
  statusLabel,
  size = avatarDefaults.size,
  ...rest
}: AvatarProps) {
  const initial = initialOf(name);
  return (
    <span
      {...rest}
      role="img"
      aria-label={[name || "?", statusLabel ?? status]
        .filter(Boolean)
        .join(", ")}
      data-status={status}
      data-slot={avatarSlot}
      data-size={size}
    >
      <span data-slot="avatar-initial" aria-hidden="true">
        {initial}
      </span>
      {src ? (
        <img
          data-slot="avatar-image"
          data-initial={initial}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </span>
  );
}

import type * as React from "react";
import { fileInputDefaults, fileInputSlot, type FileInputOwnProps } from "./generated/file-input.ts";

export type FileInputProps = FileInputOwnProps & Omit<React.ComponentPropsWithRef<"input">, keyof FileInputOwnProps | "type">;

/** Native file selection. Optional feedback never sends a file anywhere. */
export function FileInput({ variant = fileInputDefaults.variant, invalid = fileInputDefaults.invalid,
  showFiles = fileInputDefaults.showFiles, removeLabel = fileInputDefaults.removeLabel, className, style, ...rest
}: FileInputProps) {
  const control = <input {...rest} type="file" data-slot={fileInputSlot} data-variant={variant}
    className={showFiles ? undefined : className} style={showFiles ? undefined : style}
    aria-invalid={invalid || rest["aria-invalid"] || undefined} />;
  if (!showFiles) return control;
  return <div data-slot="file-input-control" data-remove-label={removeLabel} className={className} style={style}>
    {control}
    <ul data-slot="file-input-list" hidden />
    <span data-slot="visually-hidden" role="status" data-file-status />
  </div>;
}

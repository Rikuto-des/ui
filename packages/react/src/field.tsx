import { cloneElement, isValidElement, type ReactElement } from "react";
import type * as React from "react";
import {
  fieldDefaults,
  fieldSlot,
  type FieldOwnProps,
} from "./generated/field.ts";
import { joinIds } from "./util.ts";

export type FieldProps = FieldOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof FieldOwnProps | "children"> & {
    /** Exactly one form control (Input, Textarea, Select or a native control). */
    children: ReactElement;
  };

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  required?: boolean;
};

/**
 * Labels one control and links its hint and error. The control gets `id`,
 * `aria-describedby`, `aria-invalid` and `required` from the field, so the
 * wiring cannot be forgotten. No hooks: renders in Server Components.
 */
export function Field({
  id,
  label,
  description,
  error,
  success,
  required = fieldDefaults.required,
  hideLabel = fieldDefaults.hideLabel,
  children,
  ...rest
}: FieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const successId = !error && success ? `${id}-success` : undefined;
  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children, {
        id,
        "aria-describedby": joinIds(
          children.props["aria-describedby"],
          descriptionId,
          errorId,
          successId,
        ),
        "aria-invalid": error ? true : children.props["aria-invalid"],
        required: required || children.props.required,
      })
    : children;
  return (
    <div {...rest} data-slot={fieldSlot} data-invalid={error ? "" : undefined}>
      <label
        htmlFor={id}
        data-slot="field-label"
        data-hidden={hideLabel ? "" : undefined}
      >
        {label}
        {required ? (
          <span data-slot="field-required" aria-hidden="true">
            必須
          </span>
        ) : null}
      </label>
      {description ? (
        <p id={descriptionId} data-slot="field-description">
          {description}
        </p>
      ) : null}
      {control}
      {successId ? (
        <p id={successId} data-slot="field-success">
          {success}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} data-slot="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

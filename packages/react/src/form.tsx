import { useId, type ComponentPropsWithRef } from "react";
import { formDefaults, formSlot, type FormOwnProps } from "./generated/form.ts";

export type FormProps = FormOwnProps & Omit<ComponentPropsWithRef<"form">, keyof FormOwnProps>;

/**
 * A native form with an error summary. The runtime fills the summary and the
 * Fields' messages on submit; it stops the submit (and onSubmit) while any
 * control is invalid. Renders in Server Components (useId keeps no state).
 */
export function Form({ id, summaryTitle = formDefaults.summaryTitle, children, ...rest }: FormProps) {
  const summaryId = `${id ?? `form${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`}-summary`;
  return (
    <form {...rest} id={id} data-slot={formSlot}>
      <div id={summaryId} data-slot="form-summary" tabIndex={-1} aria-labelledby={`${summaryId}-title`} hidden>
        <div data-slot="alert" data-tone="danger">
          <span data-slot="alert-icon" aria-hidden="true" />
          <div data-slot="alert-body">
            <p id={`${summaryId}-title`} data-slot="alert-title">
              {summaryTitle}
            </p>
            <ul data-slot="form-summary-list" />
          </div>
        </div>
      </div>
      {children}
    </form>
  );
}

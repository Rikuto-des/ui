import * as React from "react";
import {
  resizableDefaults,
  resizableHandleDefaults,
  resizableHandleSlot,
  resizablePanelSlot,
  resizableSlot,
  type ResizableHandleOwnProps,
  type ResizableOwnProps,
} from "./generated/resizable.ts";

export type ResizableProps = ResizableOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof ResizableOwnProps | "defaultValue">;
export type ResizablePanelProps = React.ComponentPropsWithRef<"div">;
export type ResizableHandleProps = ResizableHandleOwnProps & Omit<React.ComponentPropsWithRef<"div">, keyof ResizableHandleOwnProps | "children">;

/** Set by Resizable on its handle: the separator's value has to be in the server HTML. */
interface Split {
  orientation: "horizontal" | "vertical";
  size: number;
  min: number;
  max: number;
}

/**
 * Two panes and a handle. The first pane's share is the custom property
 * --_size (percent); the runtime moves it. No hooks: it renders in Server
 * Components, and the handle gets its value from here through cloneElement.
 */
function ResizableRoot({
  orientation = resizableDefaults.orientation,
  defaultSize = resizableDefaults.defaultSize,
  min = resizableDefaults.min,
  max = resizableDefaults.max,
  style,
  children,
  ...rest
}: ResizableProps) {
  const size = Math.min(max, Math.max(min, defaultSize));
  const split: Split = { orientation, size, min, max };
  return (
    <div {...rest} data-slot={resizableSlot} data-orientation={orientation} style={{ "--_size": size, ...style } as React.CSSProperties}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === ResizableHandle ? React.cloneElement(child as React.ReactElement<{ split?: Split }>, { split }) : child,
      )}
    </div>
  );
}

function ResizablePanel(props: ResizablePanelProps) {
  return <div {...props} data-slot={resizablePanelSlot} />;
}

function ResizableHandle({ label, grip = resizableHandleDefaults.grip, split, ...rest }: ResizableHandleProps & { split?: Split }) {
  const { orientation = "horizontal", size = 50, min = 0, max = 100 } = split ?? {};
  return (
    <div
      {...rest}
      role="separator"
      tabIndex={0}
      aria-label={label}
      // The separator's orientation is the line's: side-by-side panes have a vertical one.
      aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
      aria-valuenow={size}
      aria-valuemin={min}
      aria-valuemax={max}
      data-slot={resizableHandleSlot}
      data-grip={grip ? "" : undefined}
    >
      {grip ? <span data-slot="resizable-grip" aria-hidden="true" /> : null}
    </div>
  );
}

export const Resizable = Object.assign(ResizableRoot, { Panel: ResizablePanel, Handle: ResizableHandle });

"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore, type ComponentType } from "react";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

// Resolve inside the dynamic boundary: the page runtime may finish before a
// demo's chunk. Keep SSR controls disabled until that demo has its handlers.
function withInteractionReady<Props extends object>({ default: Demo }: { default: ComponentType<Props> }) {
  return function ReadyExample(props: Props) {
    const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
    return (
      <fieldset className="demo-interaction-boundary" disabled={!ready} aria-busy={!ready} data-ready={ready}>
        <Demo {...props} />
      </fieldset>
    );
  };
}

// Keep stateful demos in their own chunks. A server-side catalog of static
// imports otherwise sends every demo's component code to every detail page.
// SSR stays enabled so the initial preview is also available without JavaScript.
export const InputExample = dynamic(() => import("@/examples/input").then(withInteractionReady));
export const ButtonExample = dynamic(() => import("@/examples/button").then(withInteractionReady));
export const ComboboxExample = dynamic(() => import("@/examples/combobox").then(withInteractionReady));
export const DatePickerExample = dynamic(
  () => import("@/examples/date-picker").then(withInteractionReady),
);
export const DataTableExample = dynamic(() => import("@/examples/data-table").then(withInteractionReady));
export const CommandExample = dynamic(() => import("@/examples/command").then(withInteractionReady));
export const AccordionExample = dynamic(() => import("@/examples/accordion").then(withInteractionReady));
export const AlertExample = dynamic(() => import("@/examples/alert").then(withInteractionReady));
export const AlertDialogExample = dynamic(
  () => import("@/examples/alert-dialog").then(withInteractionReady),
);
export const AspectRatioExample = dynamic(
  () => import("@/examples/aspect-ratio").then(withInteractionReady),
);
export const AvatarExample = dynamic(() => import("@/examples/avatar").then(withInteractionReady));
export const BadgeExample = dynamic(() => import("@/examples/badge").then(withInteractionReady));
export const BreadcrumbExample = dynamic(() => import("@/examples/breadcrumb").then(withInteractionReady));
export const ButtonGroupExample = dynamic(
  () => import("@/examples/button-group").then(withInteractionReady),
);
export const CardExample = dynamic(() => import("@/examples/card").then(withInteractionReady));
export const CarouselExample = dynamic(() => import("@/examples/carousel").then(withInteractionReady));
export const CheckboxExample = dynamic(() => import("@/examples/checkbox").then(withInteractionReady));
export const CollapsibleExample = dynamic(
  () => import("@/examples/collapsible").then(withInteractionReady),
);
export const DateInputExample = dynamic(() => import("@/examples/date-input").then(withInteractionReady));
export const DialogExample = dynamic(() => import("@/examples/dialog").then(withInteractionReady));
export const EmptyExample = dynamic(() => import("@/examples/empty").then(withInteractionReady));
export const FieldExample = dynamic(() => import("@/examples/field").then(withInteractionReady));
export const FileInputExample = dynamic(() => import("@/examples/file-input").then(withInteractionReady));
export const HoverCardExample = dynamic(() => import("@/examples/hover-card").then(withInteractionReady));
export const InputGroupExample = dynamic(
  () => import("@/examples/input-group").then(withInteractionReady),
);
export const KbdExample = dynamic(() => import("@/examples/kbd").then(withInteractionReady));
export const LinkExample = dynamic(() => import("@/examples/link").then(withInteractionReady));
export const NavigationMenuExample = dynamic(
  () => import("@/examples/navigation-menu").then(withInteractionReady),
);
export const MenuExample = dynamic(() => import("@/examples/menu").then(withInteractionReady));
export const MeterExample = dynamic(() => import("@/examples/meter").then(withInteractionReady));
export const OTPInputExample = dynamic(() => import("@/examples/otp-input").then(withInteractionReady));
export const PaginationExample = dynamic(() => import("@/examples/pagination").then(withInteractionReady));
export const PopoverExample = dynamic(() => import("@/examples/popover").then(withInteractionReady));
export const ProgressExample = dynamic(() => import("@/examples/progress").then(withInteractionReady));
export const RadioGroupExample = dynamic(
  () => import("@/examples/radio-group").then(withInteractionReady),
);
export const ScrollAreaExample = dynamic(
  () => import("@/examples/scroll-area").then(withInteractionReady),
);
export const SelectExample = dynamic(() => import("@/examples/select").then(withInteractionReady));
export const SeparatorExample = dynamic(() => import("@/examples/separator").then(withInteractionReady));
export const SheetExample = dynamic(() => import("@/examples/sheet").then(withInteractionReady));
export const SidebarExample = dynamic(() => import("@/examples/sidebar").then(withInteractionReady));
export const SkeletonExample = dynamic(() => import("@/examples/skeleton").then(withInteractionReady));
export const SliderExample = dynamic(() => import("@/examples/slider").then(withInteractionReady));
export const SpinnerExample = dynamic(() => import("@/examples/spinner").then(withInteractionReady));
export const StepsExample = dynamic(() => import("@/examples/steps").then(withInteractionReady));
export const SwitchExample = dynamic(() => import("@/examples/switch").then(withInteractionReady));
export const TableExample = dynamic(() => import("@/examples/table").then(withInteractionReady));
export const TabsExample = dynamic(() => import("@/examples/tabs").then(withInteractionReady));
export const TextareaExample = dynamic(() => import("@/examples/textarea").then(withInteractionReady));
export const ToastExample = dynamic(() => import("@/examples/toast").then(withInteractionReady));
export const ToggleExample = dynamic(() => import("@/examples/toggle").then(withInteractionReady));
export const ToggleGroupExample = dynamic(
  () => import("@/examples/toggle-group").then(withInteractionReady),
);
export const TooltipExample = dynamic(() => import("@/examples/tooltip").then(withInteractionReady));

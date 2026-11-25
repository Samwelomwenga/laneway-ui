"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { MENU_POPUP_CLASS } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function Select<Value>(props: Readonly<SelectPrimitive.Root.Props<Value>>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectTrigger({ className, ...props }: Readonly<SelectPrimitive.Trigger.Props>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-control w-full min-w-0 items-center justify-between gap-1.5 rounded-control border border-input bg-card ps-control-pad pe-2.5 text-body text-foreground transition-colors duration-(--duration-fast) outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Value className="min-w-0 flex-1 truncate text-start" />
      <SelectPrimitive.Icon render={<Icon icon={UnfoldMoreIcon} className="text-muted-foreground" />} />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ className, children, ...props }: Readonly<SelectPrimitive.Popup.Props>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner alignItemWithTrigger={false} sideOffset={4} className="isolate z-50 outline-none">
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(MENU_POPUP_CLASS, "w-(--anchor-width)", className)}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: Readonly<SelectPrimitive.Item.Props>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-control-sm cursor-default items-center gap-1.5 rounded-[calc(var(--radius-popover)-0.375rem)] ps-2.5 pe-8 text-card-title outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute end-2.5 flex items-center">
        <Icon icon={Tick02Icon} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger }

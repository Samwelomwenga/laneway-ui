"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { useRef } from "react"
import { Icon } from "@/components/icon"
import { MENU_POPUP_CLASS } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const Combobox = ComboboxPrimitive.Root
const ComboboxValue = ComboboxPrimitive.Value

function ComboboxChips({ className, ...props }: Readonly<React.ComponentProps<typeof ComboboxPrimitive.Chips>>) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-control w-full cursor-text flex-wrap items-center gap-1.5 rounded-control border border-input bg-card p-1 transition-colors duration-(--duration-fast) focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  removeLabel,
  ...props
}: Readonly<ComboboxPrimitive.Chip.Props & { removeLabel: string }>) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-control-sm max-w-full items-center gap-0.5 rounded-chip ps-2.5 text-meta outline-none focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring data-highlighted:outline-2 data-highlighted:outline-offset-1 data-highlighted:outline-ring",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ComboboxPrimitive.ChipRemove
        data-slot="combobox-chip-remove"
        aria-label={removeLabel}
        className="flex h-full items-center rounded-e-chip ps-0.5 pe-2 opacity-70 outline-none hover:opacity-100"
      >
        <Icon icon={Cancel01Icon} size="meta" />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({ className, ...props }: Readonly<ComboboxPrimitive.Input.Props>) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("h-control-sm min-w-16 flex-1 bg-transparent px-1.5 text-body outline-none placeholder:text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  anchor,
  ...props
}: Readonly<
  ComboboxPrimitive.Popup.Props
  & Pick<ComboboxPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "anchor">
>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(MENU_POPUP_CLASS, "w-(--anchor-width) max-w-(--available-width)", className)}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: Readonly<ComboboxPrimitive.List.Props>) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("max-h-72 scroll-py-1.5 overflow-y-auto overscroll-contain data-empty:hidden", className)}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }: Readonly<ComboboxPrimitive.Item.Props>) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex min-h-control-sm w-full cursor-default items-center gap-2 rounded-[calc(var(--radius-popover)-0.375rem)] py-1 ps-2.5 pe-8 text-card-title outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator className="absolute end-2.5 flex">
        <Icon icon={Tick02Icon} />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({ className, ...props }: Readonly<ComboboxPrimitive.Empty.Props>) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("px-2.5 py-1 text-meta text-muted-foreground empty:hidden", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
}

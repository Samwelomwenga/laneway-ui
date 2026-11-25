"use client"

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

function Sheet(props: Readonly<SheetPrimitive.Root.Props>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

const SIDES = {
  bottom: [
    "inset-x-0 bottom-0 max-h-[85dvh] gap-form-gap rounded-t-popover bg-popover p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-popover-foreground shadow-dialog",
    "duration-(--duration-fast) data-starting-style:translate-y-6",
  ],
  left: [
    "inset-y-0 start-0 h-dvh",
    "duration-(--duration-base) data-ending-style:-translate-x-full data-starting-style:-translate-x-full motion-reduce:duration-(--duration-fast) motion-reduce:data-ending-style:translate-x-0",
  ],
} as const

function SheetContent({ className, side = "bottom", ...props }: Readonly<SheetPrimitive.Popup.Props & { side?: keyof typeof SIDES }>) {
  const [place, motion] = SIDES[side]
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-(--duration-fast) ease-enter data-ending-style:opacity-0 data-ending-style:ease-exit data-starting-style:opacity-0"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto outline-none",
          place,
          "transition-[opacity,translate] ease-enter data-ending-style:opacity-0 data-ending-style:ease-exit data-starting-style:opacity-0 motion-reduce:data-starting-style:translate-0",
          motion,
          className,
        )}
        {...props}
      />
    </SheetPrimitive.Portal>
  )
}

function SheetTitle({ className, ...props }: Readonly<SheetPrimitive.Title.Props>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-heading", className)}
      {...props}
    />
  )
}

export { Sheet, SheetContent, SheetTitle }

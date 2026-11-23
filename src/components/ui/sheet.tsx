"use client"

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

function Sheet(props: Readonly<SheetPrimitive.Root.Props>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetContent({ className, ...props }: Readonly<SheetPrimitive.Popup.Props>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-(--duration-fast) ease-enter data-ending-style:opacity-0 data-ending-style:ease-exit data-starting-style:opacity-0"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col gap-form-gap overflow-y-auto rounded-t-popover bg-popover p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-popover-foreground shadow-dialog outline-none",
          "transition-[opacity,translate] duration-(--duration-fast) ease-enter data-ending-style:opacity-0 data-ending-style:ease-exit data-starting-style:translate-y-6 data-starting-style:opacity-0 motion-reduce:data-starting-style:translate-y-0",
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

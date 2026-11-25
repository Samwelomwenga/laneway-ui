"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Dialog(props: Readonly<DialogPrimitive.Root.Props>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogContent({ className, closeClassName, children, ...props }: Readonly<DialogPrimitive.Popup.Props & { closeClassName?: string }>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-(--duration-base) ease-linear data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0 motion-reduce:duration-(--duration-fast) motion-reduce:data-ending-style:duration-(--duration-fast)"
      />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center sm:overflow-y-auto sm:p-4">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "relative flex size-full flex-col overflow-y-auto bg-popover p-4 text-popover-foreground outline-none sm:h-auto sm:max-w-140 sm:rounded-popover sm:p-7 sm:shadow-dialog",
            "transition-[opacity,scale] duration-(--duration-base) ease-enter data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-exit data-starting-style:scale-96 data-starting-style:opacity-0",
            "motion-reduce:duration-(--duration-fast) motion-reduce:data-ending-style:scale-100 motion-reduce:data-ending-style:duration-(--duration-fast) motion-reduce:data-starting-style:scale-100",
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" size="icon" className={cn("absolute end-2 top-2 sm:end-4 sm:top-4", closeClassName)} />}
          >
            <Icon icon={Cancel01Icon} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  )
}

function DialogTitle({ className, ...props }: Readonly<DialogPrimitive.Title.Props>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-title", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: Readonly<DialogPrimitive.Description.Props>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-meta text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Dialog, DialogContent, DialogDescription, DialogTitle }

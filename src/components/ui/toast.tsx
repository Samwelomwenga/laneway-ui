"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

const UNDO_WINDOW_MS = 6000

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map(toast => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className={[
        "pointer-events-auto absolute inset-x-0 bottom-0 z-[calc(1000-var(--toast-index))] origin-bottom rounded-card bg-popover text-popover-foreground shadow-popover outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "[--gap:0.5rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--gap)*-1+var(--toast-swipe-movement-y))] [--peek:0.5rem] [--scale:calc(max(0,1-(var(--toast-index)*0.05)))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-var(--toast-index)*var(--peek)))_scale(var(--scale))] [transition:transform_var(--duration-base)_var(--ease-enter),opacity_var(--duration-base)_var(--ease-enter),height_var(--duration-fast)]",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-starting-style:opacity-0 data-starting-style:[transform:translateY(1rem)] data-limited:opacity-0",
        "motion-reduce:[--scale:1] motion-reduce:[transition:opacity_var(--duration-fast)_var(--ease-enter)] motion-reduce:data-starting-style:[transform:none]",
        "data-ending-style:opacity-0 data-ending-style:[transition:opacity_var(--duration-fast)_var(--ease-exit)]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
      ].join(" ")}
    >
      <ToastPrimitive.Content className="flex h-full items-center gap-2 overflow-hidden py-2 ps-4 pe-2 transition-opacity duration-(--duration-base) data-behind:opacity-0 data-expanded:opacity-100">
        <ToastPrimitive.Title className="min-w-0 flex-1 text-card-title" />
        <ToastPrimitive.Action render={<Button variant="secondary" />} />
        <ToastPrimitive.Close render={<Button variant="ghost" size="icon" />} aria-label="Dismiss">
          <Icon icon={Cancel01Icon} />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ))
}

function Toaster({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastPrimitive.Provider timeout={UNDO_WINDOW_MS}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm outline-none"
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

const useToastManager = ToastPrimitive.useToastManager

export { Toaster, useToastManager }

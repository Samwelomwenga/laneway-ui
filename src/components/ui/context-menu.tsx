"use client"

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { useRef } from "react"
import { MENU_POPUP_CLASS } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function ContextMenu(props: Readonly<ContextMenuPrimitive.Root.Props>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/**
 * Opens on right click only. Base UI also opens on a touch long press, which
 * would fight the board's long-press drag, so touch input never reaches it.
 */
function ContextMenuTrigger({ onPointerDown, ...props }: Readonly<Omit<ContextMenuPrimitive.Trigger.Props, "onTouchStart" | "onContextMenu">>) {
  const pointerTypeRef = useRef<string>(undefined)
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      {...props}
      onPointerDown={(event) => {
        pointerTypeRef.current = event.pointerType
        onPointerDown?.(event)
      }}
      onTouchStart={event => event.preventBaseUIHandler()}
      onContextMenu={(event) => {
        if (pointerTypeRef.current === "touch")
          event.preventBaseUIHandler()
      }}
    />
  )
}

function ContextMenuContent({ className, ...props }: Readonly<ContextMenuPrimitive.Popup.Props>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner className="isolate z-50 outline-none">
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(MENU_POPUP_CLASS, className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

export { ContextMenu, ContextMenuContent, ContextMenuTrigger }

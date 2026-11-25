"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: Readonly<AvatarPrimitive.Root.Props>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 rounded-chip select-none", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: Readonly<AvatarPrimitive.Fallback.Props>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-chip", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback }

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 p-6 text-center text-balance",
        className,
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-md flex-col items-center gap-3", className)}
      {...props}
    />
  )
}

function EmptyMedia({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="empty-media"
      className={cn("mb-1 flex shrink-0 items-center justify-center", className)}
      {...props}
    />
  )
}

function EmptyTitle({
  level = 2,
  className,
  ...props
}: Readonly<React.ComponentProps<"h2"> & { level?: 1 | 2 }>) {
  const Heading = level === 1
    ? "h1"
    : "h2"
  return (
    <Heading
      data-slot="empty-title"
      className={cn("text-display text-balance", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: Readonly<React.ComponentProps<"p">>) {
  return (
    <p
      data-slot="empty-description"
      className={cn("max-w-[68ch] text-body text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="empty-content"
      className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-3", className)}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
}

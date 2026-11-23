import { cn } from "@/lib/utils"

function Card({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-card bg-card text-card-foreground shadow-card transition-shadow duration-(--duration-fast) ease-enter hover:shadow-card-hover motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-card-inner p-(--card-pad)", className)}
      {...props}
    />
  )
}

function CardTitle({ className, children, ...props }: Readonly<React.ComponentProps<"h3">>) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-card-title wrap-break-word", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

function CardFooter({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Card, CardContent, CardFooter, CardTitle }

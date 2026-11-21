import type { VariantProps } from "class-variance-authority"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-control-sm w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-chip border border-transparent px-2.5 text-meta whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        secondary: "bg-muted text-muted-foreground",
        outline: "border-input text-foreground",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
)

function Badge({
  className,
  variant = "secondary",
  render,
  ...props
}: Readonly<useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge }

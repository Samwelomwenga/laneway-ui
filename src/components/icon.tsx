import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

const SIZES = {
  meta: { className: "size-4", strokeWidth: 2.25 },
  control: { className: "size-4", strokeWidth: 2.25 },
  nav: { className: "size-5", strokeWidth: 1.8 },
} as const

type IconProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "strokeWidth" | "size"> & {
  size?: keyof typeof SIZES
}

export function Icon({ size = "control", className, ...props }: IconProps) {
  const { className: sizeClass, strokeWidth } = SIZES[size]
  return (
    <HugeiconsIcon
      aria-hidden
      strokeWidth={strokeWidth}
      className={cn(sizeClass, className)}
      {...props}
    />
  )
}

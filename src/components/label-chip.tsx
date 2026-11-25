import type { LabelColor } from "@/lib/label-colors"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LABEL_COLOR_NAMES } from "@/lib/label-colors"
import { cn } from "@/lib/utils"

export type BoardLabel = { id: string } & (
  | { name: string, color?: LabelColor }
  | { name?: undefined, color: LabelColor }
)

export function LabelChip({ label, className }: Readonly<{ label: BoardLabel, className?: string }>) {
  if (label.name === undefined) {
    const colorName = LABEL_COLOR_NAMES[label.color]
    return (
      <Tooltip>
        <TooltipTrigger
          render={(
            <span
              role="img"
              aria-label={colorName}
              data-color={label.color}
              className={cn("inline-block h-3 w-9 rounded-chip bg-label-strong ring-1 ring-label-ring ring-inset", className)}
            />
          )}
        />
        <TooltipContent>{colorName}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <span
      data-color={label.color}
      className={cn(
        "inline-flex h-control-sm max-w-full items-center truncate rounded-chip px-2.5 text-meta",
        label.color ? "bg-label-tint text-label-text" : "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {label.name}
    </span>
  )
}

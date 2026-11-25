"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

const DAY_BUTTON = "inline-flex size-(--cell-size) items-center justify-center rounded-control text-meta text-foreground outline-none select-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
const NAV_BUTTON = "inline-flex size-(--cell-size) items-center justify-center rounded-control text-foreground outline-none select-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:opacity-50"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "[--cell-size:min(var(--size-control),calc((100vw-3rem)/7))]",
        className,
      )}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col", defaults.months),
        month: cn("flex w-full flex-col gap-2", defaults.month),
        nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", defaults.nav),
        button_previous: cn(NAV_BUTTON, defaults.button_previous),
        button_next: cn(NAV_BUTTON, defaults.button_next),
        month_caption: cn("flex h-(--cell-size) items-center justify-center px-(--cell-size)", defaults.month_caption),
        caption_label: cn("text-heading select-none", defaults.caption_label),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn("w-(--cell-size) text-meta text-muted-foreground select-none", defaults.weekday),
        week: cn("mt-0.5 flex w-full", defaults.week),
        day: cn("size-(--cell-size) p-0 text-center select-none", defaults.day),
        day_button: cn(DAY_BUTTON, defaults.day_button),
        selected: cn("[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary", defaults.selected),
        today: cn("[&>button]:underline [&>button]:decoration-2 [&>button]:underline-offset-4", defaults.today),
        outside: cn("[&>button]:text-muted-foreground", defaults.outside),
        disabled: cn("opacity-50", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarChevron({ orientation }: Readonly<{ orientation?: "up" | "down" | "left" | "right" }>) {
  return (
    <Icon icon={orientation === "left"
      ? ArrowLeft01Icon
      : ArrowRight01Icon}
    />
  )
}

export { Calendar }

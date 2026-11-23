"use client"

import type { CardFaceData } from "@/components/card-face"
import type { CalendarDay } from "@/lib/card-fields"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { useId, useState } from "react"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { fromCalendarDay, toCalendarDay } from "@/lib/card-fields"
import { cn } from "@/lib/utils"

const longFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function dueText(due: NonNullable<CardFaceData["due"]>) {
  const date = longFormat.format(new Date(due.date))
  if (due.complete === true)
    return `${date}, complete`
  if (due.overdue === true)
    return `${date}, overdue`
  return date
}

export function DueDateField({
  due,
  onChange,
}: Readonly<{
  due: CardFaceData["due"]
  onChange: (date: CalendarDay | undefined) => void
}>) {
  const [open, setOpen] = useState(false)
  const headingId = useId()

  function choose(date: CalendarDay | undefined) {
    onChange(date)
    setOpen(false)
  }

  return (
    <div role="group" aria-labelledby={headingId} className="flex flex-col gap-field-gap">
      <h3 id={headingId} className="text-heading">Due date</h3>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={(
            <Button
              variant="secondary"
              className={cn(
                "self-start",
                due?.complete === true && "text-success",
                due?.overdue === true && "text-destructive",
              )}
            />
          )}
        >
          <Icon icon={Calendar03Icon} />
          {due
            ? dueText(due)
            : "Set a due date"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <PopoverTitle className="sr-only">Due date</PopoverTitle>
          <Calendar
            mode="single"
            selected={due && fromCalendarDay(due.date)}
            defaultMonth={due && fromCalendarDay(due.date)}
            onSelect={date => choose(date && toCalendarDay(date))}
          />
          {due && (
            <Button variant="ghost" className="self-end" onClick={() => choose(undefined)}>
              Remove due date
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

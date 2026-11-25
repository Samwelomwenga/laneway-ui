import type { BoardCardData, CheckItem } from "@/components/board/board-types"

export function withCheckItems(card: BoardCardData, checkItems: CheckItem[]): BoardCardData {
  const { checklist: _, checkItems: __, ...rest } = card
  if (checkItems.length === 0)
    return rest
  return {
    ...rest,
    checkItems,
    checklist: { checked: checkItems.filter(item => item.checked).length, total: checkItems.length },
  }
}

export function withDueDate(card: BoardCardData, date: CalendarDay | undefined, today: CalendarDay): BoardCardData {
  const { due, ...rest } = card
  if (date === undefined)
    return rest
  const complete = due?.complete === true
  return {
    ...rest,
    due: { date, complete, overdue: !complete && date < today },
  }
}

export type CalendarDay = `${number}-${number}-${number}`

export function toCalendarDay(date: Date): CalendarDay {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}` as CalendarDay
}

export function fromCalendarDay(day: CalendarDay) {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number)
  return new Date(year, month - 1, date)
}

const longFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

export function dueText(due: NonNullable<BoardCardData["due"]>) {
  const date = longFormat.format(new Date(due.date))
  if (due.complete === true)
    return `${date}, complete`
  if (due.overdue === true)
    return `${date}, overdue`
  return date
}

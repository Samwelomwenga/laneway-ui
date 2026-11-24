"use client"

import { Add01Icon } from "@hugeicons/core-free-icons"
import { cardCount } from "@/components/board/board-list"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

type ListStripItem = { id: string, name: string, count: number }

export function ListStrip({
  lists,
  current,
  readOnly,
  onJump,
}: Readonly<{
  lists: ListStripItem[]
  current: number
  readOnly: boolean
  onJump: (slot: number) => void
}>) {
  return (
    <nav
      aria-label="Lists"
      className="sticky top-0 z-10 flex h-(--strip-h) shrink-0 items-center gap-1 bg-background ps-list-gap pe-1 sm:hidden"
    >
      <ul className="relative flex min-w-0 flex-1 [scrollbar-width:none] gap-1 overflow-x-auto">
        {lists.map((list, index) => (
          <li key={list.id} className="shrink-0">
            <Button
              ref={index === current
                ? revealInStrip
                : undefined}
              variant="ghost"
              aria-current={index === current || undefined}
              className="gap-2 px-3 text-muted-foreground aria-current:bg-secondary aria-current:text-secondary-foreground"
              onClick={() => onJump(index)}
            >
              <span className="max-w-32 truncate">{list.name}</span>
              <span aria-hidden className="text-meta">{list.count}</span>
              <span className="sr-only">{`, ${cardCount(list.count)}`}</span>
            </Button>
          </li>
        ))}
      </ul>
      {!readOnly && (
        <Button
          variant="ghost"
          aria-current={current === lists.length || undefined}
          className="w-control shrink-0 px-0 aria-current:bg-secondary"
          onClick={() => onJump(lists.length)}
        >
          <Icon icon={Add01Icon} />
          <span className="sr-only">Go to Add a list</span>
        </Button>
      )}
    </nav>
  )
}

function revealInStrip(item: HTMLElement | null) {
  const strip = item?.closest("ul")
  if (!item || !strip)
    return
  const itemBox = item.getBoundingClientRect()
  const stripBox = strip.getBoundingClientRect()
  if (itemBox.left < stripBox.left)
    strip.scrollBy({ left: itemBox.left - stripBox.left })
  else if (itemBox.right > stripBox.right)
    strip.scrollBy({ left: itemBox.right - stripBox.right })
}

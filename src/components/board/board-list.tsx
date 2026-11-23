"use client"

import type { BoardCardData, BoardListMeta } from "@/components/board/board-types"
import { Add01Icon, DragDropIcon } from "@hugeicons/core-free-icons"
import { useId, useRef, useState } from "react"
import { BoardCard } from "@/components/board/board-card"
import { InlineComposer } from "@/components/board/inline-composer"
import { CardFace } from "@/components/card-face"
import { Icon } from "@/components/icon"
import { KanbanColumn, KanbanColumnContent, KanbanColumnHandle } from "@/components/reui/kanban"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LIST_SURFACE = "flex max-h-full w-list-w shrink-0 flex-col gap-card-gap rounded-list p-list-pad max-sm:w-list-w-phone max-sm:snap-start"

export function BoardList({
  list,
  cards,
  onAddCard,
  onOpenCard,
  onMoveCard,
}: Readonly<{
  list: BoardListMeta
  cards: BoardCardData[]
  onAddCard: (listId: string, title: string) => void
  onOpenCard: (card: BoardCardData) => void
  onMoveCard: (card: BoardCardData, anchor: HTMLElement | null) => void
}>) {
  const headingId = useId()
  const scrollerRef = useRef<HTMLDivElement>(null)

  return (
    <KanbanColumn
      value={list.id}
      data-color={list.color}
      aria-labelledby={headingId}
      data-board-slot
      render={<section />}
      className={cn(
        LIST_SURFACE,
        "group/list",
        list.color ? "bg-label-list" : "bg-list",
        "data-[dragging=true]:bg-foreground/9 data-[dragging=true]:*:opacity-0",
      )}
    >
      <ListHeader list={list} count={cards.length} headingId={headingId} grip={<ListGrip listName={list.name} />} />
      <KanbanColumnContent
        ref={scrollerRef}
        value={list.id}
        className="relative -m-1 min-h-0 scroll-py-1 overflow-y-auto p-1"
      >
        {cards.map(card => (
          <BoardCard key={card.id} card={card} onOpen={onOpenCard} onMove={onMoveCard} />
        ))}
      </KanbanColumnContent>
      <AddCard
        listName={list.name}
        onAdd={(title) => {
          onAddCard(list.id, title)
          requestAnimationFrame(() => scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight }))
        }}
      />
    </KanbanColumn>
  )
}

export function BoardListOverlay({ list, cards }: Readonly<{ list: BoardListMeta, cards: BoardCardData[] }>) {
  return (
    <div
      data-color={list.color}
      className={cn(LIST_SURFACE, "max-h-[80dvh] overflow-hidden shadow-lift", list.color ? "bg-label-list" : "bg-list")}
    >
      <ListHeader list={list} count={cards.length} />
      <div className="flex flex-col gap-card-gap">
        {cards.map(card => <CardFace key={card.id} card={card} />)}
      </div>
    </div>
  )
}

function ListHeader({
  list,
  count,
  headingId,
  grip,
}: Readonly<{
  list: BoardListMeta
  count: number
  headingId?: string
  grip?: React.ReactNode
}>) {
  return (
    <header className="flex min-h-control items-center gap-2 rounded-card ps-2 pe-1 text-foreground group-focus-within/list:bg-primary group-focus-within/list:text-primary-foreground">
      <h2 id={headingId} className="min-w-0 flex-1 truncate text-heading">
        {list.name}
        <span className="sr-only">{`, ${cardCount(count)}`}</span>
      </h2>
      <span aria-hidden className="text-meta text-muted-foreground group-focus-within/list:text-primary-foreground">{count}</span>
      {grip}
    </header>
  )
}

export function cardCount(count: number) {
  return `${count} ${count === 1
    ? "card"
    : "cards"}`
}

function ListGrip({ listName }: Readonly<{ listName: string }>) {
  return (
    <KanbanColumnHandle
      cursor={false}
      render={<button type="button" />}
      className="flex size-control-sm cursor-grab items-center justify-center rounded-control outline-none focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Icon icon={DragDropIcon} />
      <span className="sr-only">{`Drag list ${listName}`}</span>
    </KanbanColumnHandle>
  )
}

function useComposerToggle() {
  const [composing, setComposing] = useState(false)
  const returnFocusRef = useRef(false)

  function focusTriggerRef(trigger: HTMLButtonElement | null) {
    if (trigger && returnFocusRef.current) {
      returnFocusRef.current = false
      trigger.focus()
    }
  }

  return {
    composing,
    open: () => setComposing(true),
    cancel: () => {
      returnFocusRef.current = true
      setComposing(false)
    },
    triggerRef: focusTriggerRef,
  }
}

function AddCard({ listName, onAdd }: Readonly<{ listName: string, onAdd: (title: string) => void }>) {
  const { composing, open, cancel, triggerRef } = useComposerToggle()

  if (composing) {
    return (
      <InlineComposer
        label={`New card title for ${listName}`}
        placeholder="Enter a title"
        submitLabel="Add card"
        onSubmit={onAdd}
        onCancel={cancel}
      />
    )
  }

  return (
    <Button
      ref={triggerRef}
      variant="ghost"
      className="w-full justify-start px-2 text-muted-foreground hover:text-accent-foreground"
      onClick={open}
    >
      <Icon icon={Add01Icon} />
      Add a card
    </Button>
  )
}

export function AddList({ onAdd }: Readonly<{ onAdd: (name: string) => void }>) {
  const { composing, open, cancel, triggerRef } = useComposerToggle()

  if (composing) {
    return (
      <div data-board-slot className={cn(LIST_SURFACE, "self-start bg-list")}>
        <InlineComposer
          label="New list name"
          placeholder="Enter a list name"
          submitLabel="Add list"
          onSubmit={onAdd}
          onCancel={cancel}
        />
      </div>
    )
  }

  return (
    <Button
      ref={triggerRef}
      data-board-slot
      variant="ghost"
      className={cn(LIST_SURFACE, "h-auto min-h-[calc(var(--size-control)+var(--spacing-list-pad)*2)] flex-row items-center justify-start self-start px-4 text-muted-foreground outline-offset-0 hover:text-accent-foreground")}
      onClick={open}
    >
      <Icon icon={Add01Icon} />
      Add a list
    </Button>
  )
}

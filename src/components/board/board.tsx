"use client"

import type { Announcements, DragStartEvent, DropAnimation, DropAnimationKeyframeResolver, ScreenReaderInstructions } from "@dnd-kit/core"
import type { BoardCardData, BoardListData, BoardListMeta } from "@/components/board/board-types"
import type { Placement } from "@/lib/board-placement"
import { defaultDropAnimationSideEffects } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useRef, useState } from "react"
import { AddList, BoardList, BoardListOverlay } from "@/components/board/board-list"
import { CardFace } from "@/components/card-face"
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/reui/kanban"
import { findPlacement, landingPlacement } from "@/lib/board-placement"
import { cn } from "@/lib/utils"

type CardsByList = Record<string, BoardCardData[]>
type DragKind = "card" | "list"

const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable: "Press Space to pick up. While dragging, use the arrow keys to move, Space or Enter to drop, and Escape to cancel.",
}

const cardId = (card: BoardCardData) => card.id

export function Board({ initialLists }: Readonly<{ initialLists: BoardListData[] }>) {
  const [cardsByList, setCardsByList] = useState<CardsByList>(() =>
    Object.fromEntries(initialLists.map(list => [list.id, list.cards])),
  )
  const [lists, setLists] = useState<Record<string, BoardListMeta>>(() =>
    Object.fromEntries(initialLists.map(({ cards: _, ...list }) => [list.id, list])),
  )
  const [dragKind, setDragKind] = useState<DragKind>("card")
  const [dropAnimation, setDropAnimation] = useState<DropAnimation | null>(null)
  const [openedCard, setOpenedCard] = useState<BoardCardData>()
  const originRef = useRef<Placement>(undefined)

  const isList = (id: string) => id in cardsByList
  const cardTitle = (id: string) => findCard(cardsByList, id)?.title ?? ""
  const listName = (id: string) => listMeta(lists, id).name

  function describe({ listId, index, total }: Placement) {
    return `${listName(listId)}, position ${index + 1} of ${total}`
  }

  function listPosition(id: string) {
    const ids = Object.keys(cardsByList)
    return `position ${ids.indexOf(id) + 1} of ${ids.length}`
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      const id = String(active.id)
      if (isList(id))
        return `Picked up list ${listName(id)}, ${listPosition(id)}.`
      const from = findPlacement(cardsByList, cardId, id)
      return from && `Picked up ${cardTitle(id)} in ${describe(from)}.`
    },
    onDragOver({ active, over }) {
      if (!over || over.id === active.id)
        return undefined
      const id = String(active.id)
      if (isList(id))
        return `List ${listName(id)} is over ${listPosition(String(over.id))}.`
      const to = landingPlacement(cardsByList, cardId, id, String(over.id))
      return to && `${cardTitle(id)} is over ${describe(to)}.`
    },
    onDragEnd({ active, over }) {
      const id = String(active.id)
      if (isList(id)) {
        return `Moved list ${listName(id)} to ${listPosition(over
          ? String(over.id)
          : id)}.`
      }
      const to = landingPlacement(cardsByList, cardId, id, over
        ? String(over.id)
        : undefined)
      return to && `Moved ${cardTitle(id)} to ${describe(to)}.`
    },
    onDragCancel({ active }) {
      const id = String(active.id)
      if (isList(id))
        return `Put list ${listName(id)} back.`
      const origin = originRef.current
      return origin && `Put ${cardTitle(id)} back in ${describe(origin)}.`
    },
  }

  function handleDragStart({ active }: DragStartEvent) {
    const id = String(active.id)
    originRef.current = findPlacement(cardsByList, cardId, id)
    const kind = isList(id)
      ? "list"
      : "card"
    setDragKind(kind)
    setDropAnimation(readDropAnimation(kind))
  }

  function addCard(listId: string, title: string) {
    setCardsByList(current => ({
      ...current,
      [listId]: [
        ...(current[listId] ?? []),
        {
          id: crypto.randomUUID(),
          title,
        },
      ],
    }))
  }

  function addList(name: string) {
    const id = crypto.randomUUID()
    setLists(current => ({
      ...current,
      [id]: { id, name },
    }))
    setCardsByList(current => ({ ...current, [id]: [] }))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p role="status" className="min-h-5 px-list-gap text-meta text-muted-foreground">
        {openedCard && `Opened ${openedCard.title}. Card detail isn't built yet.`}
      </p>
      <Kanban
        value={cardsByList}
        onValueChange={setCardsByList}
        getItemValue={cardId}
        restoreOnCancel
        onDragStart={handleDragStart}
        accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <KanbanBoard className="flex min-h-0 flex-1 scroll-px-list-gap items-start gap-list-gap overflow-x-auto px-list-gap pt-2 pb-list-gap">
          {Object.entries(cardsByList).map(([listId, cards]) => (
            <BoardList
              key={listId}
              list={listMeta(lists, listId)}
              cards={cards}
              onAddCard={addCard}
              onOpenCard={setOpenedCard}
            />
          ))}
          <AddList onAdd={addList} />
        </KanbanBoard>
        <KanbanOverlay
          dropAnimation={dropAnimation}
          className={cn(dragKind === "card" && "scale-[1.02] -rotate-[1.5deg] animate-lift rounded-card shadow-lift motion-reduce:animate-none")}
        >
          {({ value, variant }) => {
            const id = String(value)
            if (variant === "column")
              return <BoardListOverlay list={listMeta(lists, id)} cards={cardsByList[id] ?? []} />
            const card = findCard(cardsByList, id)
            return card && <CardFace card={card} />
          }}
        </KanbanOverlay>
      </Kanban>
    </div>
  )
}

function listMeta(lists: Record<string, BoardListMeta>, id: string) {
  const meta = lists[id]
  if (!meta)
    throw new Error(`Board has cards for list ${id} but no list with that id`)
  return meta
}

function findCard(cardsByList: CardsByList, id: string) {
  for (const cards of Object.values(cardsByList)) {
    const card = cards.find(item => item.id === id)
    if (card)
      return card
  }
  return undefined
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const cardDropKeyframes: DropAnimationKeyframeResolver = ({ transform }) => [
  {
    transform: CSS.Transform.toString(transform.initial),
    rotate: "-1.5deg",
    scale: "1.02",
    boxShadow: cssVar("--shadow-lift"),
  },
  {
    transform: CSS.Transform.toString(transform.final),
    rotate: "0deg",
    scale: "1",
    boxShadow: cssVar("--shadow-card"),
  },
]

function milliseconds(duration: string) {
  const value = Number.parseFloat(duration)
  return duration.endsWith("ms")
    ? value
    : value * 1000
}

function readDropAnimation(kind: DragKind): DropAnimation | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    return null
  return {
    duration: milliseconds(cssVar("--duration-base")),
    easing: cssVar("--ease-enter"),
    ...(kind === "card" && { keyframes: cardDropKeyframes }),
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0" },
      },
    }),
  }
}

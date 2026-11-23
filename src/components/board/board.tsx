"use client"

import type { Announcements, DragStartEvent, DropAnimation, DropAnimationKeyframeResolver, ScreenReaderInstructions } from "@dnd-kit/core"
import type { BoardCardData, BoardListData, BoardListMeta } from "@/components/board/board-types"
import type { MoveDestination } from "@/components/board/move-card-panel"
import type { CardSnapshot } from "@/components/board/move-motion"
import type { Placement } from "@/lib/board-placement"
import { defaultDropAnimationSideEffects } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useLayoutEffect, useRef, useState } from "react"
import { AddList, BoardList, BoardListOverlay } from "@/components/board/board-list"
import { MoveCardPanel } from "@/components/board/move-card-panel"
import { focusCardMenu, milliseconds, playMove, snapshotCards } from "@/components/board/move-motion"
import { CardFace } from "@/components/card-face"
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/reui/kanban"
import { useToastManager } from "@/components/ui/toast"
import { findPlacement, landingPlacement, moveItem } from "@/lib/board-placement"
import { cn } from "@/lib/utils"

type CardsByList = Record<string, BoardCardData[]>
type DragKind = "card" | "list"
type MoveTarget = { card: BoardCardData, from: Placement, anchor: HTMLElement | null }

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
  const [status, setStatus] = useState("")
  const [moveTarget, setMoveTarget] = useState<MoveTarget>()
  const [moveOpen, setMoveOpen] = useState(false)
  const pendingMoveRef = useRef<MoveDestination>(undefined)
  const originRef = useRef<Placement>(undefined)
  const boardRef = useRef<HTMLDivElement>(null)
  const toastManager = useToastManager()
  const motionRef = useRef<{ before: CardSnapshot, id: string }>(undefined)

  useLayoutEffect(() => {
    const motion = motionRef.current
    const root = boardRef.current
    if (!motion || !root)
      return
    motionRef.current = undefined
    playMove(root, motion.before, motion.id)
    focusCardMenu(root, motion.id)
  }, [cardsByList])

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

  function openCard(card: BoardCardData) {
    setStatus(`Opened ${card.title}. Card detail isn't built yet.`)
  }

  function startMove(card: BoardCardData, anchor: HTMLElement | null) {
    const from = findPlacement(cardsByList, cardId, card.id)
    if (!from)
      return
    setMoveTarget({ card, from, anchor })
    setMoveOpen(true)
  }

  function submitMove(to: MoveDestination) {
    pendingMoveRef.current = to
    setMoveOpen(false)
  }

  function relocate(id: string, to: MoveDestination) {
    const root = boardRef.current
    if (!root)
      return
    motionRef.current = {
      before: snapshotCards(root),
      id,
    }
    setCardsByList(current => moveItem(current, cardId, id, to.listId, to.index))
  }

  function focusAfterMovePanel() {
    const moving = pendingMoveRef.current !== undefined
    return !moving && (moveTarget?.anchor ?? true)
  }

  function finishMove() {
    const to = pendingMoveRef.current
    pendingMoveRef.current = undefined
    setMoveTarget(undefined)
    if (!moveTarget || !to)
      return
    const { card, from } = moveTarget
    if (to.listId === from.listId && to.index === from.index) {
      if (boardRef.current)
        focusCardMenu(boardRef.current, card.id)
      return
    }
    const total = to.listId === from.listId
      ? from.total
      : (cardsByList[to.listId]?.length ?? 0) + 1
    relocate(card.id, to)
    const toastId = toastManager.add({
      title: `Moved ${card.title} to ${describe({ ...to, total })}.`,
      actionProps: {
        children: "Undo",
        onClick() {
          toastManager.close(toastId)
          relocate(card.id, from)
          setStatus(`Moved ${card.title} back to ${describe(from)}.`)
        },
      },
    })
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
    <div ref={boardRef} className="flex min-h-0 flex-1 flex-col">
      <p role="status" className="min-h-5 px-list-gap text-meta text-muted-foreground">
        {status}
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
              onOpenCard={openCard}
              onMoveCard={startMove}
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
      {moveTarget && (
        <MoveCardPanel
          open={moveOpen}
          cardTitle={moveTarget.card.title}
          from={moveTarget.from}
          lists={Object.entries(cardsByList).map(([id, cards]) => ({
            id,
            name: listName(id),
            count: cards.length,
          }))}
          anchor={moveTarget.anchor}
          onSubmit={submitMove}
          onOpenChange={setMoveOpen}
          onClosed={finishMove}
          finalFocus={focusAfterMovePanel}
        />
      )}
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

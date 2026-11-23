"use client"

import type { BoardCardData } from "@/components/board/board-types"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"
import { useRef } from "react"
import { CardFace, CardMenuButton } from "@/components/card-face"
import { Icon } from "@/components/icon"
import { KanbanItem, KanbanItemHandle } from "@/components/reui/kanban"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type BoardCardProps = Readonly<{
  card: BoardCardData
  onOpen: (card: BoardCardData) => void
  onMove: (card: BoardCardData, anchor: HTMLElement | null) => void
}>

export function BoardCard({ card, onOpen, onMove }: BoardCardProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pendingMoveRef = useRef(false)

  function requestMove() {
    pendingMoveRef.current = true
  }

  function openMoveOnceClosed(open: boolean) {
    if (open || !pendingMoveRef.current)
      return
    pendingMoveRef.current = false
    onMove(card, menuButtonRef.current)
  }

  const menuItems = <CardMenuItems onOpen={() => onOpen(card)} onMove={requestMove} />

  return (
    <KanbanItem
      value={card.id}
      className="rounded-card data-[dragging=true]:bg-foreground/9 data-[dragging=true]:*:opacity-0"
    >
      <ContextMenu onOpenChangeComplete={openMoveOnceClosed}>
        <ContextMenuTrigger>
          <KanbanItemHandle input="pointer" cursor={false}>
            <CardFace
              card={card}
              onOpen={() => onOpen(card)}
              grip={<CardGrip title={card.title} />}
              menu={(
                <DropdownMenu onOpenChangeComplete={openMoveOnceClosed}>
                  <DropdownMenuTrigger
                    ref={menuButtonRef}
                    render={<CardMenuButton title={card.title} hasCover={card.cover !== undefined} />}
                  />
                  <DropdownMenuContent align="end">{menuItems}</DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </KanbanItemHandle>
        </ContextMenuTrigger>
        <ContextMenuContent>{menuItems}</ContextMenuContent>
      </ContextMenu>
    </KanbanItem>
  )
}

function CardMenuItems({ onOpen, onMove }: Readonly<{ onOpen: () => void, onMove: () => void }>) {
  return (
    <>
      <DropdownMenuItem onClick={onOpen}>Open card</DropdownMenuItem>
      <DropdownMenuItem onClick={onMove}>Move…</DropdownMenuItem>
    </>
  )
}

function CardGrip({ title }: Readonly<{ title: string }>) {
  return (
    <KanbanItemHandle
      input="keyboard"
      cursor={false}
      render={<button type="button" />}
      className="absolute inset-y-0 start-0 flex w-3.5 cursor-grab items-center justify-center text-muted-foreground outline-none focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring pointer-coarse:w-control-sm pointer-coarse:bg-card pointer-coarse:opacity-0 pointer-fine:opacity-0 pointer-fine:group-hover/card:opacity-100"
    >
      <Icon icon={DragDropVerticalIcon} />
      <span className="sr-only">{`Drag ${title}`}</span>
    </KanbanItemHandle>
  )
}

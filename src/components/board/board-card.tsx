"use client"

import type { BoardCardData } from "@/components/board/board-types"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"
import { useRef } from "react"
import { CardFace, CardMenuButton } from "@/components/card-face"
import { Icon } from "@/components/icon"
import { KanbanItem, KanbanItemHandle } from "@/components/reui/kanban"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToastManager } from "@/components/ui/toast"

type BoardCardProps = Readonly<{
  card: BoardCardData
  readOnly: boolean
  onOpen: (card: BoardCardData) => void
  onMove: (card: BoardCardData, anchor: HTMLElement | null) => void
}>

export function BoardCard({ card, readOnly, onOpen, onMove }: BoardCardProps) {
  const toastManager = useToastManager()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pendingActionRef = useRef<"open" | "move">(undefined)

  function runActionOnceClosed(open: boolean) {
    const action = pendingActionRef.current
    if (open || !action)
      return
    pendingActionRef.current = undefined
    if (action === "open")
      onOpen(card)
    else
      onMove(card, menuButtonRef.current)
  }

  async function copyLink() {
    const link = new URL(location.pathname, location.origin)
    link.searchParams.set("card", card.id)
    try {
      await navigator.clipboard.writeText(link.href)
      toastManager.add({ title: `Copied the link to ${card.title}.` })
    }
    catch {
      toastManager.add({ title: `Couldn't copy the link to ${card.title}.` })
    }
  }

  const menuItems = (
    <>
      <DropdownMenuItem
        onClick={() => {
          pendingActionRef.current = "open"
        }}
      >
        Open card
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => void copyLink()}>Copy link</DropdownMenuItem>
      {!readOnly && (
        <DropdownMenuItem
          onClick={() => {
            pendingActionRef.current = "move"
          }}
        >
          Move…
        </DropdownMenuItem>
      )}
    </>
  )

  return (
    <KanbanItem
      value={card.id}
      disabled={readOnly}
      className="rounded-card data-[dragging=true]:bg-foreground/9 data-[dragging=true]:*:opacity-0"
    >
      <ContextMenu onOpenChangeComplete={runActionOnceClosed}>
        <ContextMenuTrigger>
          <KanbanItemHandle input="pointer" cursor={false}>
            <CardFace
              card={card}
              onOpen={() => onOpen(card)}
              grip={!readOnly && <CardGrip title={card.title} />}
              menu={(
                <DropdownMenu onOpenChangeComplete={runActionOnceClosed}>
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

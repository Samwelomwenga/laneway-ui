"use client"

import type { BoardCardData } from "@/components/board/board-types"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"
import { CardFace } from "@/components/card-face"
import { Icon } from "@/components/icon"
import { KanbanItem, KanbanItemHandle } from "@/components/reui/kanban"

export function BoardCard({
  card,
  onOpen,
}: Readonly<{
  card: BoardCardData
  onOpen: (card: BoardCardData) => void
}>) {
  return (
    <KanbanItem
      value={card.id}
      className="rounded-card data-[dragging=true]:bg-foreground/9 data-[dragging=true]:*:opacity-0"
    >
      <KanbanItemHandle input="pointer" cursor={false}>
        <CardFace
          card={card}
          onOpen={() => onOpen(card)}
          grip={(
            <KanbanItemHandle
              input="keyboard"
              cursor={false}
              render={<button type="button" />}
              className="absolute inset-y-0 start-0 flex w-3.5 cursor-grab items-center justify-center text-muted-foreground outline-none focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring pointer-coarse:w-control-sm pointer-coarse:bg-card pointer-coarse:opacity-0 pointer-fine:opacity-0 pointer-fine:group-hover/card:opacity-100"
            >
              <Icon icon={DragDropVerticalIcon} />
              <span className="sr-only">{`Drag ${card.title}`}</span>
            </KanbanItemHandle>
          )}
        />
      </KanbanItemHandle>
    </KanbanItem>
  )
}

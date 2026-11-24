"use client"

import type { BoardCardData } from "@/components/board/board-types"
import type { MoveDestination, MoveList } from "@/components/board/move-card-panel"
import type { BoardLabel } from "@/components/label-chip"
import type { Placement } from "@/lib/board-placement"
import Image from "next/image"
import { useRef, useState } from "react"
import { MoveCardPanel } from "@/components/board/move-card-panel"
import { Checklist } from "@/components/card-detail/checklist"
import { DueDateField } from "@/components/card-detail/due-date-field"
import { LabelPicker } from "@/components/card-detail/label-picker"
import { ReadOnlyCardFields } from "@/components/card-detail/read-only-fields"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { toCalendarDay, withCheckItems, withDueDate } from "@/lib/card-fields"
import { cn } from "@/lib/utils"

type CardDetailProps = Readonly<{
  open: boolean
  card: BoardCardData | undefined
  placement: Placement | undefined
  lists: MoveList[]
  boardLabels: BoardLabel[]
  readOnly: boolean
  onChange: (card: BoardCardData) => void
  onMove: (card: BoardCardData, from: Placement, to: MoveDestination) => void
  onOpenChange: (open: boolean) => void
  onClosed: () => void
  finalFocus: () => HTMLElement | null
}>

export function CardDetail({ open, card, placement, lists, boardLabels, readOnly, onChange, onMove, onOpenChange, onClosed, finalFocus }: CardDetailProps) {
  const checklistDraggingRef = useRef(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const moveButtonRef = useRef<HTMLButtonElement>(null)
  const pendingMoveRef = useRef<MoveDestination>(undefined)
  const [moveOpen, setMoveOpen] = useState(false)
  const listName = lists.find(list => list.id === placement?.listId)?.name

  function finishMove() {
    const to = pendingMoveRef.current
    pendingMoveRef.current = undefined
    if (card && placement && to && (to.listId !== placement.listId || to.index !== placement.index))
      onMove(card, placement, to)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        // Base UI closes on an Escape that a field already handled, and hears Escape before dnd-kit cancels a checklist drag.
        const escapeHandledInside = details.reason === "escape-key" && (details.event.defaultPrevented || checklistDraggingRef.current)
        const pressOnToast = details.reason === "outside-press" && details.event.target instanceof Element && details.event.target.closest("[data-slot=toast]") !== null
        if (!next && (escapeHandledInside || pressOnToast)) {
          details.cancel()
          return
        }
        onOpenChange(next)
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen)
          onClosed()
      }}
    >
      {card && (
        <DialogContent
          ref={popupRef}
          initialFocus={popupRef}
          finalFocus={finalFocus}
          onKeyDown={(event) => {
            // Base UI's popup stops arrow keys from propagating, and dnd-kit reads them on the document.
            if (checklistDraggingRef.current)
              event.preventBaseUIHandler()
          }}
          className="gap-section-gap"
          closeClassName={cn(card.cover && "bg-popover shadow-card")}
        >
          {card.cover && <DetailCover cover={card.cover} />}
          <header className="flex flex-col items-start gap-1 pe-8">
            <DialogTitle>{card.title}</DialogTitle>
            <DialogDescription>{`In the ${listName} list`}</DialogDescription>
            {!readOnly && (
              <Button ref={moveButtonRef} variant="secondary" className="mt-2" onClick={() => setMoveOpen(true)}>
                Move…
              </Button>
            )}
          </header>
          {readOnly
            ? <ReadOnlyCardFields card={card} />
            : (
                <>
                  {placement && (
                    <MoveCardPanel
                      open={moveOpen}
                      cardTitle={card.title}
                      from={placement}
                      lists={lists}
                      anchor={moveButtonRef.current}
                      onSubmit={(to) => {
                        pendingMoveRef.current = to
                        setMoveOpen(false)
                      }}
                      onOpenChange={setMoveOpen}
                      onClosed={finishMove}
                      finalFocus={() => moveButtonRef.current}
                    />
                  )}
                  <LabelPicker
                    labels={boardLabels}
                    picked={card.labels ?? []}
                    onChange={labels => onChange({ ...card, labels })}
                  />
                  <DueDateField
                    due={card.due}
                    onChange={date => onChange(withDueDate(card, date, toCalendarDay(new Date())))}
                  />
                  <Checklist
                    items={card.checkItems ?? []}
                    onChange={items => onChange(withCheckItems(card, items))}
                    onDraggingChange={(dragging) => {
                      checklistDraggingRef.current = dragging
                    }}
                  />
                </>
              )}
        </DialogContent>
      )}
    </Dialog>
  )
}

function DetailCover({ cover }: Readonly<{ cover: NonNullable<BoardCardData["cover"]> }>) {
  const bleed = "-mx-4 -mt-4 shrink-0 overflow-hidden sm:-mx-7 sm:-mt-7 sm:rounded-t-popover"
  if (cover.kind === "color") {
    return (
      <div
        data-color={cover.color}
        className={cn(bleed, "h-10 bg-label-strong shadow-[inset_0_-1px_0_var(--label-ring)]")}
      />
    )
  }
  return (
    <div className={cn(bleed, "relative aspect-video max-h-48")}>
      <Image src={cover.src} alt="" fill sizes="35rem" className="object-cover object-center" />
    </div>
  )
}

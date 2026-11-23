"use client"

import type { BoardCardData } from "@/components/board/board-types"
import type { BoardLabel } from "@/components/label-chip"
import Image from "next/image"
import { useRef } from "react"
import { Checklist } from "@/components/card-detail/checklist"
import { DueDateField } from "@/components/card-detail/due-date-field"
import { LabelPicker } from "@/components/card-detail/label-picker"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { toCalendarDay, withCheckItems, withDueDate } from "@/lib/card-fields"
import { cn } from "@/lib/utils"

type CardDetailProps = Readonly<{
  open: boolean
  card: BoardCardData | undefined
  listName: string
  boardLabels: BoardLabel[]
  onChange: (card: BoardCardData) => void
  onOpenChange: (open: boolean) => void
  onClosed: () => void
  finalFocus: () => HTMLElement | null
}>

export function CardDetail({ open, card, listName, boardLabels, onChange, onOpenChange, onClosed, finalFocus }: CardDetailProps) {
  const checklistDraggingRef = useRef(false)
  const popupRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        // Base UI closes on an Escape that a field already handled, and hears Escape before dnd-kit cancels a checklist drag.
        const escapeHandledInside = details.reason === "escape-key" && (details.event.defaultPrevented || checklistDraggingRef.current)
        if (!next && escapeHandledInside) {
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
          <header className="flex flex-col gap-1 pe-8">
            <DialogTitle>{card.title}</DialogTitle>
            <DialogDescription>{`In the ${listName} list`}</DialogDescription>
          </header>
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

"use client"

import type { Placement } from "@/lib/board-placement"
import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTitle } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useCoarsePointer } from "@/hooks/use-coarse-pointer"

export type MoveDestination = Omit<Placement, "total">
type MoveList = { id: string, name: string, count: number }

type MoveCardPanelProps = Readonly<{
  open: boolean
  cardTitle: string
  from: Placement
  lists: MoveList[]
  anchor: HTMLElement | null
  onSubmit: (to: MoveDestination) => void
  onOpenChange: (open: boolean) => void
  onClosed: () => void
  finalFocus: () => HTMLElement | boolean | null
}>

export function MoveCardPanel({ open, cardTitle, from, lists, anchor, onSubmit, onOpenChange, onClosed, finalFocus }: MoveCardPanelProps) {
  const coarse = useCoarsePointer()
  const title = `Move ${cardTitle}`
  const form = <MoveCardForm from={from} lists={lists} onSubmit={onSubmit} />
  const onOpenChangeComplete = (isOpen: boolean) => {
    if (!isOpen)
      onClosed()
  }

  if (coarse) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
        <SheetContent finalFocus={finalFocus}>
          <SheetTitle>{title}</SheetTitle>
          {form}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
      <PopoverContent anchor={anchor} finalFocus={finalFocus}>
        <PopoverTitle>{title}</PopoverTitle>
        {form}
      </PopoverContent>
    </Popover>
  )
}

function positionCount(from: Placement, lists: MoveList[], listId: string) {
  const count = lists.find(list => list.id === listId)?.count ?? 0
  return listId === from.listId
    ? count
    : count + 1
}

function MoveCardForm({ from, lists, onSubmit }: Readonly<{ from: Placement, lists: MoveList[], onSubmit: (to: MoveDestination) => void }>) {
  const [listId, setListId] = useState(from.listId)
  const [index, setIndex] = useState(from.index)
  const listFieldId = useId()
  const positionFieldId = useId()

  const listItems = lists.map(list => ({ value: list.id, label: list.name }))
  const positions = Array.from({
    length: positionCount(from, lists, listId),
  }, (_, position) => ({
    value: position,
    label: listId === from.listId && position === from.index
      ? `${position + 1} (current)`
      : String(position + 1),
  }))

  function chooseList(next: string | null) {
    if (next === null)
      return
    setListId(next)
    setIndex(next === from.listId
      ? from.index
      : positionCount(from, lists, next) - 1)
  }

  return (
    <form
      className="flex flex-col gap-form-gap"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ listId, index })
      }}
    >
      <Field>
        <FieldLabel htmlFor={listFieldId}>List</FieldLabel>
        <Select items={listItems} value={listId} onValueChange={chooseList}>
          <SelectTrigger id={listFieldId} />
          <SelectContent>
            {listItems.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor={positionFieldId}>Position</FieldLabel>
        <Select items={positions} value={index} onValueChange={next => next !== null && setIndex(next)}>
          <SelectTrigger id={positionFieldId} />
          <SelectContent>
            {positions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Button type="submit" className="self-end">Move</Button>
    </form>
  )
}

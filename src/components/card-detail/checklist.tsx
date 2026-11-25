"use client"

import type { Announcements, DropAnimation, ScreenReaderInstructions, UniqueIdentifier } from "@dnd-kit/core"
import type { CheckItem } from "@/components/board/board-types"
import { arrayMove } from "@dnd-kit/sortable"
import { Add01Icon, DragDropVerticalIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { useId, useRef, useState } from "react"
import { InlineComposer } from "@/components/board/inline-composer"
import { cssVar, milliseconds, prefersReducedMotion } from "@/components/board/move-motion"
import { Icon } from "@/components/icon"
import { Sortable, SortableItem, SortableItemHandle, SortableOverlay } from "@/components/reui/sortable"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable: "Press Space to pick up. While dragging, use the arrow keys to move, Space or Enter to drop, and Escape to cancel.",
}

const checkItemId = (item: CheckItem) => item.id

export function Checklist({
  items,
  onChange,
  onDraggingChange,
}: Readonly<{
  items: CheckItem[]
  onChange: (items: CheckItem[]) => void
  onDraggingChange: (dragging: boolean) => void
}>) {
  const headingId = useId()
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null)
  const [status, setStatus] = useState("")
  const [adding, setAdding] = useState(false)
  const [dropAnimation, setDropAnimation] = useState<DropAnimation | null>(null)
  const originRef = useRef(0)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const focusAddButtonRef = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)

  function attachAddButton(button: HTMLButtonElement | null) {
    addButtonRef.current = button
    if (button && focusAddButtonRef.current) {
      focusAddButtonRef.current = false
      button.focus()
    }
  }

  const checked = items.filter(item => item.checked).length
  const nameOf = (id: UniqueIdentifier) => items.find(item => item.id === id)?.name ?? ""
  const indexOf = (id: UniqueIdentifier) => items.findIndex(item => item.id === id)
  const position = (index: number) => `position ${index + 1} of ${items.length}`

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}, ${position(indexOf(active.id))}.`,
    onDragOver: ({ active, over }) => over && over.id !== active.id
      ? `${nameOf(active.id)} is over ${position(indexOf(over.id))}.`
      : undefined,
    onDragEnd: ({ active, over }) => `Moved ${nameOf(active.id)} to ${position(indexOf(over?.id ?? active.id))}.`,
    onDragCancel: ({ active }) => `Put ${nameOf(active.id)} back in ${position(originRef.current)}.`,
  }

  function update(id: string, patch: Partial<CheckItem>) {
    onChange(items.map(item => item.id === id
      ? {
          ...item,
          ...patch,
        }
      : item))
  }

  function step(item: CheckItem, by: -1 | 1) {
    const from = indexOf(item.id)
    const to = from + by
    onChange(arrayMove(items, from, to))
    setStatus(`Moved ${item.name} to ${position(to)}.`)
  }

  function remove(item: CheckItem) {
    onChange(items.filter(other => other.id !== item.id))
    setStatus(`Deleted ${item.name}.`)
    const composer = sectionRef.current?.querySelector("textarea")
    ;(addButtonRef.current ?? composer)?.focus()
  }

  return (
    <section ref={sectionRef} aria-labelledby={headingId} className="flex flex-col gap-field-gap">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="text-heading">Checklist</h3>
        {items.length > 0 && (
          <p className={cn("text-meta text-muted-foreground", checked === items.length && "text-success")}>
            {`${checked} of ${items.length} checked`}
          </p>
        )}
      </div>
      <Sortable
        value={items}
        onValueChange={onChange}
        getItemValue={checkItemId}
        accessibility={{
          announcements,
          screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
          container: announcer ?? undefined,
        }}
        onDragStart={({ active }) => {
          originRef.current = indexOf(active.id)
          setDropAnimation(readDropAnimation())
          onDraggingChange(true)
        }}
        onDragEnd={() => onDraggingChange(false)}
        onDragCancel={() => onDraggingChange(false)}
        render={<ul />}
        className="flex flex-col"
      >
        {items.map((item, index) => (
          <ChecklistRow
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onCheckedChange={next => update(item.id, { checked: next })}
            onStep={by => step(item, by)}
            onDelete={() => remove(item)}
          />
        ))}
        <SortableOverlay dropAnimation={dropAnimation}>
          {({ value }) => {
            const item = items.find(other => other.id === value)
            return item && <CheckItemBody item={item} className="rounded-control bg-popover shadow-lift" />
          }}
        </SortableOverlay>
      </Sortable>
      {adding
        ? (
            <InlineComposer
              label="Check item name"
              placeholder="Add a check item"
              submitLabel="Add"
              onSubmit={name => onChange([
                ...items,
                {
                  id: crypto.randomUUID(),
                  name,
                  checked: false,
                },
              ])}
              onCancel={() => {
                focusAddButtonRef.current = true
                setAdding(false)
              }}
            />
          )
        : (
            <Button ref={attachAddButton} variant="ghost" className="self-start" onClick={() => setAdding(true)}>
              <Icon icon={Add01Icon} />
              Add a check item
            </Button>
          )}
      <p role="status" className="sr-only">{status}</p>
      <div ref={setAnnouncer} />
    </section>
  )
}

function ChecklistRow({
  item,
  isFirst,
  isLast,
  onCheckedChange,
  onStep,
  onDelete,
}: Readonly<{
  item: CheckItem
  isFirst: boolean
  isLast: boolean
  onCheckedChange: (checked: boolean) => void
  onStep: (by: -1 | 1) => void
  onDelete: () => void
}>) {
  const deletePendingRef = useRef(false)

  return (
    <SortableItem
      value={item.id}
      render={<li />}
      className="group/item relative rounded-control data-[dragging=true]:bg-foreground/9 data-[dragging=true]:*:opacity-0"
    >
      <CheckItemBody
        item={item}
        onCheckedChange={onCheckedChange}
        grip={(
          <SortableItemHandle
            cursor={false}
            render={<button type="button" />}
            className="flex w-6 shrink-0 cursor-grab items-center justify-center self-stretch rounded-control text-muted-foreground outline-none focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring pointer-coarse:w-control-sm pointer-fine:opacity-0 pointer-fine:group-hover/item:opacity-100"
          >
            <Icon icon={DragDropVerticalIcon} />
            <span className="sr-only">{`Drag ${item.name}`}</span>
          </SortableItemHandle>
        )}
        menu={(
          <DropdownMenu
            onOpenChangeComplete={(open) => {
              if (!open && deletePendingRef.current)
                onDelete()
            }}
          >
            <DropdownMenuTrigger
              render={(
                <Button
                  variant="ghost"
                  size="icon"
                  className="pointer-fine:opacity-0 pointer-fine:group-focus-within/item:opacity-100 pointer-fine:group-hover/item:opacity-100 pointer-fine:aria-expanded:opacity-100"
                />
              )}
            >
              <Icon icon={MoreHorizontalIcon} />
              <span className="sr-only">{`Actions for ${item.name}`}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={isFirst} onClick={() => onStep(-1)}>Move up</DropdownMenuItem>
              <DropdownMenuItem disabled={isLast} onClick={() => onStep(1)}>Move down</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  deletePendingRef.current = true
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </SortableItem>
  )
}

function CheckItemBody({
  item,
  onCheckedChange,
  grip,
  menu,
  className,
}: Readonly<{
  item: CheckItem
  onCheckedChange?: (checked: boolean) => void
  grip?: React.ReactNode
  menu?: React.ReactNode
  className?: string
}>) {
  return (
    <div className={cn("flex min-h-control items-center gap-1 pe-1", className)}>
      {grip ?? <span className="w-6 shrink-0" />}
      <label className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5">
        <Checkbox checked={item.checked} onCheckedChange={onCheckedChange} />
        <span className={cn("min-w-0 text-card-title wrap-break-word", item.checked && "text-muted-foreground line-through")}>
          {item.name}
        </span>
      </label>
      {menu}
    </div>
  )
}

function readDropAnimation(): DropAnimation | null {
  if (prefersReducedMotion())
    return null
  return {
    duration: milliseconds(cssVar("--duration-base")),
    easing: cssVar("--ease-enter"),
  }
}

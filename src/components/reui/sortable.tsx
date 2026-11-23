"use client"

import type {
  DragCancelEvent,
  DragEndEvent,
  DraggableAttributes,
  DraggableSyntheticListeners,
  DragStartEvent,
  Modifiers,
  UniqueIdentifier,
} from "@dnd-kit/core"
import type { AnimateLayoutChanges } from "@dnd-kit/sortable"
import type { CSSProperties, ReactNode } from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import {
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import { createContext, use, useCallback, useId, useMemo, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

const SortableItemContext = createContext<{
  attributes: DraggableAttributes | undefined
  listeners: DraggableSyntheticListeners | undefined
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  isDragging?: boolean
  disabled?: boolean
}>({
  attributes: undefined,
  listeners: undefined,
  isDragging: false,
  disabled: false,
})

const IsOverlayContext = createContext(false)

const SortableInternalContext = createContext<{
  activeId: UniqueIdentifier | null
  modifiers?: Modifiers
}>({
  activeId: null,
  modifiers: undefined,
})

const animateLayoutChanges: AnimateLayoutChanges = args =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

const subscribeToNothing = () => () => {}
const getIsMounted = () => true
const getIsMountedOnServer = () => false

const MOUSE_SENSOR_OPTIONS = {
  activationConstraint: { distance: 10 },
}
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 250, tolerance: 5 },
}
const KEYBOARD_SENSOR_OPTIONS = {
  keyboardCodes: {
    start: [KeyboardCode.Space],
    cancel: [KeyboardCode.Esc],
    end: [KeyboardCode.Space, KeyboardCode.Enter],
  },
  coordinateGetter: sortableKeyboardCoordinates,
}
const MEASURING_CONFIG = {
  droppable: { strategy: MeasuringStrategy.Always },
}

type SortableCommitMeta<T> = {
  event: DragEndEvent
  activeIndex: number
  overIndex: number
  previousValue: T[]
}

type SortableRootProps<T> = {
  value: T[]
  onValueChange: (value: T[]) => void
  getItemValue: (item: T) => string
  children: ReactNode
  onValueCommit?: (value: T[], meta: SortableCommitMeta<T>) => void
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragCancel?: (event: DragCancelEvent) => void
  accessibility?: React.ComponentProps<typeof DndContext>["accessibility"]
  modifiers?: Modifiers
} & Omit<
  useRender.ComponentProps<"div">,
  "onDragStart" | "onDragEnd" | "children"
>

function Sortable<T>({
  value,
  onValueChange,
  getItemValue,
  className,
  render,
  onValueCommit,
  onDragStart,
  onDragEnd,
  onDragCancel,
  accessibility,
  modifiers,
  children,
  ...props
}: SortableRootProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const dndContextId = useId()

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id)
      onDragStart?.(event)
    },
    [onDragStart],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      onDragEnd?.(event)

      if (!over)
        return

      const activeIndex = value.findIndex(item => getItemValue(item) === active.id)
      const overIndex = value.findIndex(item => getItemValue(item) === over.id)

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
        return

      const newValue = arrayMove(value, activeIndex, overIndex)
      onValueChange(newValue)
      onValueCommit?.(newValue, {
        event,
        activeIndex,
        overIndex,
        previousValue: value,
      })
    },
    [
      value,
      getItemValue,
      onValueChange,
      onDragEnd,
      onValueCommit,
    ],
  )

  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      setActiveId(null)
      onDragCancel?.(event)
    },
    [onDragCancel],
  )

  const itemIds = useMemo(() => value.map(getItemValue), [value, getItemValue])

  const contextValue = useMemo(
    () => ({ activeId, modifiers }),
    [activeId, modifiers],
  )

  const defaultProps = {
    "data-slot": "sortable",
    "data-dragging": activeId !== null,
    "className": cn(activeId !== null && "cursor-grabbing!", className),
    children,
  }

  return (
    <SortableInternalContext value={contextValue}>
      <DndContext
        id={dndContextId}
        sensors={sensors}
        modifiers={modifiers}
        accessibility={accessibility}
        measuring={MEASURING_CONFIG}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {useRender({
            defaultTagName: "div",
            render,
            props: mergeProps<"div">(defaultProps, props),
          })}
        </SortableContext>
      </DndContext>
    </SortableInternalContext>
  )
}

type SortableItemProps = {
  value: string
  disabled?: boolean
} & useRender.ComponentProps<"div">

function SortableItem({
  value,
  className,
  render,
  disabled,
  ...props
}: SortableItemProps) {
  const isOverlay = use(IsOverlayContext)

  const {
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({
    id: value,
    disabled: disabled === true || isOverlay,
    animateLayoutChanges,
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  } as CSSProperties

  const defaultProps = isOverlay
    ? {
        "data-slot": "sortable-item",
        "data-value": value,
        "data-dragging": true,
        "className": cn(className),
        "children": props.children,
      }
    : {
        "data-slot": "sortable-item",
        "data-value": value,
        "data-dragging": isDragging,
        "data-disabled": disabled,
        "ref": setNodeRef,
        style,
        "className": cn(isDragging && "z-50", className),
        "children": props.children,
      }

  return (
    <SortableItemContext
      value={
        isOverlay
          ? {
              attributes: undefined,
              listeners: undefined,
              isDragging: true,
              disabled: false,
            }
          : {
              attributes,
              listeners,
              setActivatorNodeRef,
              isDragging,
              disabled,
            }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </SortableItemContext>
  )
}

type SortableItemHandleProps = {
  cursor?: boolean
} & useRender.ComponentProps<"div">

/**
 * Carries the sortable attributes and every sensor, and is the node focus
 * returns to after a keyboard drag. Render it as a button so it can take focus.
 */
function SortableItemHandle({
  className,
  render,
  cursor = true,
  ...props
}: SortableItemHandleProps) {
  const { attributes, listeners, setActivatorNodeRef, isDragging, disabled } = use(SortableItemContext)

  const defaultProps = {
    "data-slot": "sortable-item-handle",
    "data-dragging": isDragging,
    "data-disabled": disabled,
    ...attributes,
    "ref": setActivatorNodeRef,
    ...listeners,
    "className": cn(
      cursor && (isDragging
        ? "cursor-grabbing!"
        : "cursor-grab!"),
      className,
    ),
    "children": props.children,
  }

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  })
}

type SortableOverlayProps = {
  children?: ReactNode | ((params: { value: UniqueIdentifier }) => ReactNode)
} & Omit<
  React.ComponentProps<typeof DragOverlay>,
  "children"
>

function SortableOverlay({
  children,
  className,
  ...props
}: SortableOverlayProps) {
  const { activeId, modifiers } = use(SortableInternalContext)
  const mounted = useSyncExternalStore(subscribeToNothing, getIsMounted, getIsMountedOnServer)

  let content: ReactNode = null
  if (activeId !== null && children !== undefined) {
    content = typeof children === "function"
      ? children({ value: activeId })
      : children
  }

  if (!mounted)
    return null

  return createPortal(
    <DragOverlay
      modifiers={modifiers}
      className={cn("z-60", activeId !== null && "cursor-grabbing", className)}
      {...props}
    >
      <IsOverlayContext value={true}>
        {content}
      </IsOverlayContext>
    </DragOverlay>,
    document.body,
  )
}

export { Sortable, SortableItem, SortableItemHandle, SortableOverlay }

"use client"

import type {
  CollisionDetection,
  DragCancelEvent,
  DragEndEvent,
  DraggableAttributes,
  DraggableSyntheticListeners,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  KeyboardCoordinateGetter,
  Modifiers,
  UniqueIdentifier,
} from "@dnd-kit/core"
import type { AnimateLayoutChanges } from "@dnd-kit/sortable"
import type { CSSProperties, ReactNode } from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { closestCenter, defaultDropAnimationSideEffects, DndContext, DragOverlay, getFirstCollision, KeyboardCode, KeyboardSensor, MeasuringStrategy, MouseSensor, pointerWithin, rectIntersection, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import {

  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import * as React from "react"
import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { createPortal } from "react-dom"

type KanbanContextProps<T> = {
  columns: Record<string, T[]>
  setColumns: (columns: Record<string, T[]>) => void
  getItemId: (item: T) => string
  columnIds: string[]
  activeId: UniqueIdentifier | null
  setActiveId: (id: UniqueIdentifier | null) => void
  findContainer: (id: UniqueIdentifier) => string | undefined
  isColumn: (id: UniqueIdentifier) => boolean
  modifiers?: Modifiers
}

const KanbanContext = createContext<KanbanContextProps<any>>({
  columns: {},
  setColumns: () => {},
  getItemId: () => "",
  columnIds: [],
  activeId: null,
  setActiveId: () => {},
  findContainer: () => undefined,
  isColumn: () => false,
  modifiers: undefined,
})

const ColumnContext = createContext<{
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners | undefined
  isDragging?: boolean
  disabled?: boolean
}>({
  attributes: {} as DraggableAttributes,
  listeners: undefined,
  isDragging: false,
  disabled: false,
})

const ItemContext = createContext<{
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

function itemsOf<T>(columns: Record<string, T[]>, key: string): T[] {
  return columns[key] ?? []
}

const IsOverlayContext = createContext(false)

const animateLayoutChanges: AnimateLayoutChanges = args =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
}

const subscribeToNothing = () => () => {}
const getIsClient = () => true
const getIsClientOnServer = () => false

function useIsClient() {
  return useSyncExternalStore(subscribeToNothing, getIsClient, getIsClientOnServer)
}

function useLatest<V>(value: V) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}

const MOUSE_SENSOR_OPTIONS = {
  activationConstraint: { distance: 10 },
}
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 250, tolerance: 5 },
}
const KEYBOARD_CODES = {
  start: [KeyboardCode.Space],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter],
}

/**
 * Arrow keys step a dragged column to the next column and keep it level. The
 * stock getter also stops on every card in between, so a column took two
 * presses per step, and it bottom-aligns columns of different heights.
 */
function columnAwareCoordinates(isColumn: (id: UniqueIdentifier) => boolean): KeyboardCoordinateGetter {
  return (event, args) => {
    const { active, droppableContainers } = args.context
    if (active === null || !isColumn(active.id))
      return sortableKeyboardCoordinates(event, args)
    const columnsOnly: typeof droppableContainers = Object.assign(Object.create(droppableContainers) as typeof droppableContainers, {
      get: (id: UniqueIdentifier | null | undefined) => droppableContainers.get(id),
      getEnabled: () => droppableContainers.getEnabled().filter(container => isColumn(container.id)),
    })
    const next = sortableKeyboardCoordinates(event, {
      ...args,
      context: { ...args.context, droppableContainers: columnsOnly },
    })
    return next && { x: next.x, y: args.currentCoordinates.y }
  }
}

const SHOW_ON_HOVER_OR_KEYBOARD_FOCUS
  = "opacity-0 transition-opacity group-hover/kanban-column:opacity-100 focus-visible:opacity-100 has-focus-visible:opacity-100"

const MEASURING_CONFIG = {
  droppable: { strategy: MeasuringStrategy.Always },
}

type KanbanCommitMeta<T> = {
  kind: "item" | "column"
  event: DragEndEvent
  activeContainer: string
  activeIndex: number
  overContainer: string
  overIndex: number
  previousValue: Record<string, T[]>
}

type KanbanRootProps<T> = {
  value: Record<string, T[]>
  onValueChange: (value: Record<string, T[]>) => void
  getItemValue: (item: T) => string
  children: ReactNode
  onValueCommit?: (
    value: Record<string, T[]>,
    meta: KanbanCommitMeta<T>,
  ) => void
  restoreOnCancel?: boolean
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragCancel?: (event: DragCancelEvent) => void
  accessibility?: React.ComponentProps<typeof DndContext>["accessibility"]
  modifiers?: Modifiers
} & Omit<
  useRender.ComponentProps<"div">,
  "children" | "onDragStart" | "onDragEnd"
>

function Kanban<T>({
  value,
  onValueChange,
  getItemValue,
  children,
  className,
  render,
  onValueCommit,
  restoreOnCancel = false,
  onDragStart,
  onDragEnd,
  onDragCancel,
  accessibility,
  modifiers,
  ...props
}: KanbanRootProps<T>) {
  const columns = value
  const setColumns = onValueChange
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const dndContextId = useId()

  const valueRef = useLatest(value)
  const getItemValueRef = useLatest(getItemValue)
  const dragOriginRef = useRef<{
    value: Record<string, T[]>
    container: string | undefined
    index: number
  } | null>(null)

  const columnIds = useMemo(() => Object.keys(columns), [columns])

  const isColumn = useCallback(
    (id: UniqueIdentifier) => columnIds.includes(id as string),
    [columnIds],
  )

  const keyboardSensorOptions = useMemo(
    () => ({
      keyboardCodes: KEYBOARD_CODES,
      coordinateGetter: columnAwareCoordinates(isColumn),
    }),
    [isColumn],
  )
  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, keyboardSensorOptions),
  )

  const findContainer = useCallback(
    (id: UniqueIdentifier) => {
      if (isColumn(id))
        return id as string
      return columnIds.find(key =>
        itemsOf(columns, key).some(item => getItemValue(item) === id),
      )
    },
    [
      columns,
      columnIds,
      getItemValue,
      isColumn,
    ],
  )

  // The droppable under the pointer, not the one the dragged rect overlaps
  // most: in the gap between columns that overlap flips with every live-preview
  // move, and each flip re-runs dragOver until React bails out.
  const lastOverIdRef = useRef<UniqueIdentifier | null>(null)
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      if (isColumn(args.active.id)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container =>
            isColumn(container.id),
          ),
        })
      }

      if (!args.pointerCoordinates)
        return rectIntersection(args)

      let overId = getFirstCollision(pointerWithin(args), "id")
      if (overId != null) {
        if (isColumn(overId)) {
          const itemIds = new Set(itemsOf(columns, overId as string).map(getItemValue))
          overId
            = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                container => itemIds.has(container.id as string),
              ),
            })[0]?.id ?? overId
        }
        lastOverIdRef.current = overId
        return [
          { id: overId },
        ]
      }

      return lastOverIdRef.current != null
        ? [
            { id: lastOverIdRef.current },
          ]
        : rectIntersection(args)
    },
    [columns, getItemValue, isColumn],
  )

  const commitChange = useCallback(
    (
      finalValue: Record<string, T[]>,
      event: DragEndEvent,
      kind: "item" | "column",
    ) => {
      if (!onValueCommit)
        return
      const origin = dragOriginRef.current
      if (!origin)
        return

      const id = event.active.id

      if (kind === "column") {
        const keys = Object.keys(finalValue)
        const overIndex = keys.indexOf(id as string)
        if (overIndex === -1 || overIndex === origin.index)
          return
        onValueCommit(finalValue, {
          kind: "column",
          event,
          activeContainer: id as string,
          activeIndex: origin.index,
          overContainer: String(event.over?.id ?? id),
          overIndex,
          previousValue: origin.value,
        })
        return
      }

      const getId = getItemValueRef.current
      let overContainer: string | undefined
      let overIndex = -1
      for (const key of Object.keys(finalValue)) {
        const found = itemsOf(finalValue, key).findIndex(item => getId(item) === id)
        if (found !== -1) {
          overContainer = key
          overIndex = found
          break
        }
      }
      if (overContainer === undefined)
        return
      if (overContainer === origin.container && overIndex === origin.index) {
        return
      }
      onValueCommit(finalValue, {
        kind: "item",
        event,
        activeContainer: origin.container ?? overContainer,
        activeIndex: origin.index,
        overContainer,
        overIndex,
        previousValue: origin.value,
      })
    },
    [onValueCommit, getItemValueRef],
  )

  const commitLivePreview = useCallback(
    (event: DragEndEvent) => commitChange(valueRef.current, event, "item"),
    [commitChange, valueRef],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      lastOverIdRef.current = null
      setActiveId(event.active.id)
      onDragStart?.(event)

      if (onValueCommit || restoreOnCancel) {
        const snapshot = valueRef.current
        const id = event.active.id
        const keys = Object.keys(snapshot)
        if (keys.includes(id as string)) {
          dragOriginRef.current = {
            value: snapshot,
            container: id as string,
            index: keys.indexOf(id as string),
          }
        }
        else {
          const getId = getItemValueRef.current
          let container: string | undefined
          let index = -1
          for (const key of keys) {
            const found = itemsOf(snapshot, key).findIndex(item => getId(item) === id)
            if (found !== -1) {
              container = key
              index = found
              break
            }
          }
          dragOriginRef.current = { value: snapshot, container, index }
        }
      }
    },
    [
      onDragStart,
      onValueCommit,
      restoreOnCancel,
      valueRef,
      getItemValueRef,
    ],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over)
        return

      if (isColumn(active.id))
        return

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over.id)

      if (activeContainer === undefined || overContainer === undefined) {
        return
      }

      if (activeContainer !== overContainer) {
        const activeItems = itemsOf(columns, activeContainer)
        const overItems = itemsOf(columns, overContainer)

        const activeIndex = activeItems.findIndex(
          (item: T) => getItemValue(item) === active.id,
        )
        let overIndex = overItems.findIndex(
          (item: T) => getItemValue(item) === over.id,
        )

        if (isColumn(over.id)) {
          overIndex = overItems.length
        }

        const newActiveItems = [...activeItems]
        const newOverItems = [...overItems]
        const moved = newActiveItems.splice(activeIndex, 1)
        newOverItems.splice(overIndex, 0, ...moved)

        setColumns({
          ...columns,
          [activeContainer]: newActiveItems,
          [overContainer]: newOverItems,
        })
      }
      else {
        const container = activeContainer
        const activeIndex = itemsOf(columns, container).findIndex(
          (item: T) => getItemValue(item) === active.id,
        )
        const overIndex = itemsOf(columns, container).findIndex(
          (item: T) => getItemValue(item) === over.id,
        )

        if (activeIndex !== overIndex) {
          setColumns({
            ...columns,
            [container]: arrayMove(itemsOf(columns, container), activeIndex, overIndex),
          })
        }
      }
    },
    [
      findContainer,
      getItemValue,
      isColumn,
      setColumns,
      columns,
    ],
  )

  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      const origin = dragOriginRef.current

      if (restoreOnCancel && origin) {
        setColumns(origin.value)
      }
      else if (onValueCommit && origin) {
        commitLivePreview(event)
      }

      dragOriginRef.current = null
      lastOverIdRef.current = null
      setActiveId(null)
      onDragCancel?.(event)
    },
    [
      restoreOnCancel,
      onValueCommit,
      setColumns,
      onDragCancel,
      commitLivePreview,
    ],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      lastOverIdRef.current = null
      setActiveId(null)
      onDragEnd?.(event)

      if (!over) {
        commitLivePreview(event)
        dragOriginRef.current = null
        return
      }

      if (isColumn(active.id) && isColumn(over.id)) {
        const activeIndex = columnIds.indexOf(active.id as string)
        const overIndex = columnIds.indexOf(over.id as string)
        if (activeIndex !== overIndex) {
          const newOrder = arrayMove(
            Object.keys(columns),
            activeIndex,
            overIndex,
          )
          const newColumns: Record<string, T[]> = {}
          newOrder.forEach((key) => {
            newColumns[key] = itemsOf(columns, key)
          })
          setColumns(newColumns)
          commitChange(newColumns, event, "column")
        }
        dragOriginRef.current = null
        return
      }

      if (isColumn(active.id)) {
        dragOriginRef.current = null
        return
      }

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over.id)

      if (
        activeContainer !== undefined
        && activeContainer === overContainer
      ) {
        const container = activeContainer
        const activeIndex = itemsOf(columns, container).findIndex(
          (item: T) => getItemValue(item) === active.id,
        )
        const overIndex = itemsOf(columns, container).findIndex(
          (item: T) => getItemValue(item) === over.id,
        )

        if (activeIndex !== overIndex) {
          const newColumns = {
            ...columns,
            [container]: arrayMove(itemsOf(columns, container), activeIndex, overIndex),
          }
          setColumns(newColumns)
          commitChange(newColumns, event, "item")
        }
        else {
          commitLivePreview(event)
        }
      }
      else {
        commitLivePreview(event)
      }
      dragOriginRef.current = null
    },
    [
      columnIds,
      columns,
      findContainer,
      getItemValue,
      isColumn,
      setColumns,
      onDragEnd,
      commitChange,
      commitLivePreview,
    ],
  )

  const contextValue = useMemo(
    () => ({
      columns,
      setColumns,
      getItemId: getItemValue,
      columnIds,
      activeId,
      setActiveId,
      findContainer,
      isColumn,
      modifiers,
    }),
    [
      columns,
      setColumns,
      getItemValue,
      columnIds,
      activeId,
      findContainer,
      isColumn,
      modifiers,
    ],
  )

  const defaultProps = {
    "data-slot": "kanban",
    "data-dragging": activeId !== null,
    "className": cn(activeId !== null && "cursor-grabbing!", className),
    children,
  }

  return (
    <KanbanContext value={contextValue}>
      <DndContext
        id={dndContextId}
        sensors={sensors}
        modifiers={modifiers}
        accessibility={accessibility}
        measuring={MEASURING_CONFIG}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {useRender({
          defaultTagName: "div",
          render,
          props: mergeProps<"div">(defaultProps, props),
        })}
      </DndContext>
    </KanbanContext>
  )
}

type KanbanBoardProps = useRender.ComponentProps<"div">

function KanbanBoard({ className, render, ...props }: KanbanBoardProps) {
  const { columnIds } = use(KanbanContext)

  const defaultProps = {
    "data-slot": "kanban-board",
    "className": cn("grid auto-rows-fr gap-4 sm:grid-cols-3", className),
    "children": props.children,
  }

  return (
    <SortableContext items={columnIds} strategy={rectSortingStrategy}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </SortableContext>
  )
}

type KanbanColumnProps = {
  value: string
  disabled?: boolean
} & useRender.ComponentProps<"div">

function KanbanColumn({
  value,
  className,
  render,
  disabled,
  ...props
}: KanbanColumnProps) {
  const isOverlay = use(IsOverlayContext)

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled: disabled || isOverlay,
    animateLayoutChanges,
  })

  const { activeId, isColumn } = use(KanbanContext)
  const isColumnDragging = activeId !== null && isColumn(activeId)

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  } as CSSProperties

  const defaultProps = isOverlay
    ? {
        "data-slot": "kanban-column",
        "data-value": value,
        "data-dragging": true,
        "className": cn("group/kanban-column flex flex-col", className),
        "children": props.children,
      }
    : {
        "data-slot": "kanban-column",
        "data-value": value,
        "data-dragging": isSortableDragging,
        "data-disabled": disabled,
        "ref": setNodeRef,
        style,
        "className": cn(
          "group/kanban-column flex flex-col",
          isSortableDragging && "z-50",
          className,
        ),
        "children": props.children,
      }

  return (
    <ColumnContext
      value={
        isOverlay
          ? {
              attributes: {} as DraggableAttributes,
              listeners: undefined,
              isDragging: true,
              disabled: false,
            }
          : {
              attributes,
              listeners,
              isDragging: isColumnDragging,
              disabled,
            }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </ColumnContext>
  )
}

type KanbanColumnHandleProps = {
  cursor?: boolean
} & useRender.ComponentProps<"div">

function KanbanColumnHandle({
  className,
  render,
  cursor = true,
  ...props
}: KanbanColumnHandleProps) {
  const { attributes, listeners, isDragging, disabled }
    = use(ColumnContext)

  const defaultProps = {
    "data-slot": "kanban-column-handle",
    "data-dragging": isDragging,
    "data-disabled": disabled,
    ...attributes,
    ...listeners,
    "className": cn(
      SHOW_ON_HOVER_OR_KEYBOARD_FOCUS,
      cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
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

type KanbanItemProps = {
  value: string
  disabled?: boolean
} & useRender.ComponentProps<"div">

function KanbanItem({
  value,
  className,
  render,
  disabled,
  ...props
}: KanbanItemProps) {
  const isOverlay = use(IsOverlayContext)

  const {
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled: disabled || isOverlay,
    animateLayoutChanges,
  })

  const { activeId, isColumn } = use(KanbanContext)
  const isItemDragging = activeId !== null && !isColumn(activeId)

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  } as CSSProperties

  const defaultProps = isOverlay
    ? {
        "data-slot": "kanban-item",
        "data-value": value,
        "data-dragging": true,
        "className": cn(className),
        "children": props.children,
      }
    : {
        "data-slot": "kanban-item",
        "data-value": value,
        "data-dragging": isSortableDragging,
        "data-disabled": disabled,
        "ref": setNodeRef,
        style,
        "className": cn(
          isSortableDragging && "z-50",
          className,
        ),
        "children": props.children,
      }

  return (
    <ItemContext
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
              isDragging: isItemDragging,
              disabled,
            }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </ItemContext>
  )
}

type KanbanItemHandleProps = {
  cursor?: boolean
  /**
   * Which sensors start a drag from this handle. A "keyboard" handle also
   * takes the sortable attributes and becomes the node focus returns to, so
   * a card can drag by mouse and touch anywhere but by keyboard only from its
   * grip.
   */
  input?: "all" | "pointer" | "keyboard"
} & useRender.ComponentProps<"div">

function pickListeners(
  listeners: DraggableSyntheticListeners,
  input: "all" | "pointer" | "keyboard",
): DraggableSyntheticListeners {
  if (listeners === undefined || input === "all")
    return listeners
  return Object.fromEntries(
    Object.entries(listeners).filter(([event]) => (event === "onKeyDown") === (input === "keyboard")),
  )
}

function KanbanItemHandle({
  className,
  render,
  cursor = true,
  input = "all",
  ...props
}: KanbanItemHandleProps) {
  const { attributes, listeners, setActivatorNodeRef, isDragging, disabled }
    = use(ItemContext)
  const takesKeyboard = input !== "pointer"

  const defaultProps = {
    "data-slot": "kanban-item-handle",
    "data-dragging": isDragging,
    "data-disabled": disabled,
    ...(takesKeyboard && attributes),
    ...(takesKeyboard && { ref: setActivatorNodeRef }),
    ...pickListeners(listeners, input),
    "className": cn(
      cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
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

type KanbanColumnContentProps = {
  value: string
} & useRender.ComponentProps<"div">

function KanbanColumnContent({
  value,
  className,
  render,
  ...props
}: KanbanColumnContentProps) {
  const { columns, getItemId } = use(KanbanContext)

  const itemIds = useMemo(() => {
    const items = columns[value]
    if (!items) {
      throw new Error(
        `KanbanColumnContent: column "${value}" was not found in the Kanban value. `
        + `Available columns: ${Object.keys(columns).join(", ") || "(none)"}.`,
      )
    }
    return items.map(getItemId)
  }, [columns, getItemId, value])

  const defaultProps = {
    "data-slot": "kanban-column-content",
    "className": cn("flex flex-col gap-2", className),
    "children": props.children,
  }

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </SortableContext>
  )
}

type KanbanOverlayProps = {
  children?:
    | ReactNode
    | ((params: {
      value: UniqueIdentifier
      variant: "column" | "item"
    }) => ReactNode)
} & Omit<
  React.ComponentProps<typeof DragOverlay>,
  "children"
>

function KanbanOverlay({ children, className, ...props }: KanbanOverlayProps) {
  const { activeId, isColumn, modifiers } = use(KanbanContext)
  const mounted = useIsClient()

  const variant = activeId !== null && isColumn(activeId)
    ? "column"
    : "item"

  let content: ReactNode = null
  if (activeId !== null) {
    content = typeof children === "function"
      ? children({ value: activeId, variant })
      : children
  }

  if (!mounted)
    return null

  return createPortal(
    <DragOverlay
      dropAnimation={dropAnimationConfig}
      modifiers={modifiers}
      className={cn("z-50", activeId !== null && "cursor-grabbing", className)}
      {...props}
    >
      <IsOverlayContext value={true}>
        {content}
      </IsOverlayContext>
    </DragOverlay>,
    document.body,
  )
}

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
}

export type Placement = { listId: string, index: number, total: number }

type ItemsByList<T> = Record<string, T[]>

export function findPlacement<T>(itemsByList: ItemsByList<T>, getId: (item: T) => string, itemId: string): Placement | undefined {
  for (const [listId, items] of Object.entries(itemsByList)) {
    const index = items.findIndex(item => getId(item) === itemId)
    if (index !== -1)
      return { listId, index, total: items.length }
  }
  return undefined
}

/**
 * Where a dragged card lands if dropped on `overId`, read from the lists as
 * they were before the kanban applied that move. It mirrors the kanban's own
 * live preview: a card over another list goes in front of the card it is over,
 * or to the end when it is over the list itself.
 */
export function landingPlacement<T>(
  itemsByList: ItemsByList<T>,
  getId: (item: T) => string,
  activeId: string,
  overId: string | undefined,
): Placement | undefined {
  const from = findPlacement(itemsByList, getId, activeId)
  if (!from || overId === undefined || overId === activeId)
    return from

  const overList = itemsByList[overId]
  if (overList) {
    if (overId === from.listId)
      return from
    const total = overList.length + 1
    return { listId: overId, index: total - 1, total }
  }

  const to = findPlacement(itemsByList, getId, overId)
  if (!to)
    return from
  if (to.listId === from.listId)
    return { ...to, total: from.total }
  return { ...to, total: to.total + 1 }
}

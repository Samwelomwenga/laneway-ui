type CardBox = { listId: string | undefined, offsetTop: number, rect: DOMRect }
export type CardSnapshot = Map<string, CardBox>

const runningAnimations = new Set<Animation>()
const pendingLandings = new Set<() => void>()

function cardElements(root: HTMLElement) {
  return root.querySelectorAll<HTMLElement>("[data-slot=\"kanban-item\"]")
}

function listIdOf(element: HTMLElement) {
  return element.closest<HTMLElement>("[data-slot=\"kanban-column\"]")?.dataset.value
}

function findCard(root: HTMLElement, cardId: string) {
  return [
    ...cardElements(root),
  ].find(element => element.dataset.value === cardId)
}

/**
 * dnd-kit's sortable puts its own transform on an item whose index changed, so
 * this reads the box without that transform to find the card's slot.
 */
function layoutRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const { e, f } = new DOMMatrixReadOnly(getComputedStyle(element).transform)
  return new DOMRect(rect.x - e, rect.y - f, rect.width, rect.height)
}

export function snapshotCards(root: HTMLElement): CardSnapshot {
  for (const animation of runningAnimations)
    animation.finish()
  for (const land of pendingLandings)
    land()
  const snapshot: CardSnapshot = new Map()
  for (const element of cardElements(root)) {
    if (element.dataset.value === undefined)
      continue
    snapshot.set(element.dataset.value, {
      listId: listIdOf(element),
      offsetTop: element.offsetTop,
      rect: layoutRect(element),
    })
  }
  return snapshot
}

function cssVar(element: Element, name: string) {
  return getComputedStyle(element).getPropertyValue(name).trim()
}

export function milliseconds(duration: string) {
  const value = Number.parseFloat(duration)
  return duration.endsWith("ms")
    ? value
    : value * 1000
}

function track(animation: Animation) {
  runningAnimations.add(animation)
  void animation.finished.catch(() => {}).finally(() => runningAnimations.delete(animation))
  return animation
}

function wash(card: HTMLElement) {
  const face = card.querySelector<HTMLElement>("[data-slot=\"card\"]")
  if (!face)
    return
  const surface = cssVar(face, "--card")
  track(face.animate(
    [
      { backgroundColor: `color-mix(in oklch, ${cssVar(face, "--primary")} 50%, ${surface})` },
      { backgroundColor: surface },
    ],
    {
      duration: 1000,
      easing: cssVar(face, "--ease-exit"),
    },
  ))
}

function closeGaps(root: HTMLElement, before: CardSnapshot, movedId: string) {
  const timing = {
    duration: milliseconds(cssVar(root, "--duration-base")),
    easing: cssVar(root, "--ease-enter"),
  }
  for (const element of cardElements(root)) {
    const id = element.dataset.value
    const was = id === undefined
      ? undefined
      : before.get(id)
    if (!was || id === movedId)
      continue
    const shift = was.offsetTop - element.offsetTop
    if (listIdOf(element) === was.listId && shift !== 0) {
      track(element.animate([
        { transform: `translateY(${shift}px)` },
        { transform: "none" },
      ], timing))
    }
  }
}

function flyGhostOverListScrollers(card: HTMLElement, from: DOMRect, onLand: () => void) {
  const to = layoutRect(card)
  const ghost = card.cloneNode(true) as HTMLElement
  ghost.removeAttribute("data-value")
  ghost.setAttribute("aria-hidden", "true")
  ghost.inert = true
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${to.width}px`,
    margin: "0",
    zIndex: "50",
    pointerEvents: "none",
    transform: "none",
    transition: "none",
  })
  document.body.append(ghost)
  card.style.opacity = "0"

  const flight = track(ghost.animate(
    [
      { translate: "0 0" },
      { translate: `${to.left - from.left}px ${to.top - from.top}px` },
    ],
    {
      duration: milliseconds(cssVar(card, "--duration-slow")),
      easing: cssVar(card, "--ease-enter"),
    },
  ))
  function land() {
    if (!pendingLandings.delete(land))
      return
    ghost.remove()
    card.style.opacity = ""
    onLand()
  }
  pendingLandings.add(land)
  void flight.finished.catch(() => {}).finally(land)
}

export function playMove(root: HTMLElement, before: CardSnapshot, movedId: string) {
  const card = findCard(root, movedId)
  if (!card)
    return
  card.scrollIntoView({ block: "nearest", inline: "nearest" })
  const from = before.get(movedId)?.rect
  if (!from || prefersReducedMotion()) {
    wash(card)
    return
  }
  closeGaps(root, before, movedId)
  flyGhostOverListScrollers(card, from, () => wash(card))
}

export function prefersReducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function focusCardMenu(root: HTMLElement, cardId: string) {
  findCard(root, cardId)?.querySelector<HTMLElement>("[data-card-menu]")?.focus({ preventScroll: true })
}

import type { BoardCardData, BoardListData } from "@/components/board/board-types"
import type { BoardLabel } from "@/components/label-chip"
import { withCheckItems } from "@/lib/card-fields"

const LABELS = {
  copy: { id: "label-1", name: "Copy", color: "purple" },
  onboarding: { id: "label-2", name: "Onboarding", color: "lime" },
  sky: { id: "label-3", color: "sky" },
  yellow: { id: "label-4", color: "yellow" },
  black: { id: "label-5", color: "black" },
  accessibility: { id: "label-6", name: "Accessibility", color: "green" },
  red: { id: "label-7", color: "red" },
  design: { id: "label-8", name: "Design", color: "pink" },
  research: { id: "label-9", name: "Research", color: "blue" },
  orange: { id: "label-10", color: "orange" },
  later: { id: "label-11", name: "Later" },
} satisfies Record<string, BoardLabel>

export const FIXTURE_LABELS: BoardLabel[] = Object.values(LABELS)

function checklist(card: BoardCardData, items: [name: string, checked: boolean][]) {
  return withCheckItems(card, items.map(([name, checked], index) => ({ id: `${card.id}-item-${index + 1}`, name, checked })))
}

export const FIXTURE_LISTS: BoardListData[] = [
  {
    id: "list-backlog",
    name: "Backlog",
    cards: [
      { id: "card-1", title: "Sketch the empty board" },
      {
        id: "card-2",
        title: "Write the onboarding copy",
        labels: [LABELS.copy, LABELS.onboarding],
        due: { date: "2026-11-18", overdue: true },
        comments: 4,
      },
      { id: "card-3", title: "Decide on the invite flow", hasDescription: true },
      { id: "card-4", title: "Pick the toast duration" },
      checklist({ id: "card-5", title: "List the keyboard shortcuts" }, [
        ["Board navigation", true],
        ["Card detail", true],
        ["Moving cards", false],
        ["Command palette", false],
        ["Members panel", false],
      ]),
      { id: "card-6", title: "Draft the observer note strip" },
      {
        id: "card-7",
        title: "Review the label picker sketch",
        labels: [LABELS.sky],
      },
      { id: "card-8", title: "Collect phone board feedback", comments: 2 },
    ],
  },
  {
    id: "list-todo",
    name: "To do",
    color: "yellow",
    cards: [
      { id: "card-9", title: "Fix login" },
      checklist({
        id: "card-10",
        title: "Ship the dark theme",
        cover: { kind: "color", color: "yellow" },
        labels: [LABELS.yellow, LABELS.black],
      }, [
        ["Dark tokens", true],
        ["Dark shadows", true],
        ["Theme switcher", true],
        ["Contrast pass", true],
      ]),
      {
        id: "card-11",
        title: "Pick a cover photo for the launch post",
        cover: { kind: "image", src: "/specimen/cover.svg" },
        attachments: 2,
      },
    ],
  },
  {
    id: "list-doing",
    name: "In progress",
    color: "blue",
    cards: [
      checklist({
        id: "card-12",
        title: "Audit every label color for contrast in both themes",
        cover: { kind: "color", color: "black" },
        labels: [LABELS.accessibility, LABELS.red],
        due: { date: "2026-12-02" },
      }, [
        ["Light tints", true],
        ["Dark tints", true],
        ["Swatch edges", true],
        ["List counts", false],
        ["Cover rings", false],
        ["Label picker swatches", false],
      ]),
    ],
  },
  {
    id: "list-review",
    name: "Review",
    color: "black",
    cards: [],
  },
  {
    id: "list-done",
    name: "Done",
    color: "green",
    cards: [
      {
        id: "card-13",
        title: "Set up the theme tokens",
        due: { date: "2026-11-12", complete: true },
      },
      {
        id: "card-14",
        title: "Add the card face",
        labels: [LABELS.design],
      },
    ],
  },
]

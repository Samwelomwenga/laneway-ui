import type { BoardListData } from "@/components/board/board-types"

export const FIXTURE_LISTS: BoardListData[] = [
  {
    id: "list-backlog",
    name: "Backlog",
    cards: [
      { id: "card-1", title: "Sketch the empty board" },
      {
        id: "card-2",
        title: "Write the onboarding copy",
        labels: [
          { id: "label-1", name: "Copy", color: "purple" },
          { id: "label-2", name: "Onboarding", color: "lime" },
        ],
        due: { date: "2026-11-18", overdue: true },
        comments: 4,
      },
      { id: "card-3", title: "Decide on the invite flow", hasDescription: true },
      { id: "card-4", title: "Pick the toast duration" },
      {
        id: "card-5",
        title: "List the keyboard shortcuts",
        checklist: { checked: 2, total: 7 },
      },
      { id: "card-6", title: "Draft the observer note strip" },
      {
        id: "card-7",
        title: "Review the label picker sketch",
        labels: [
          { id: "label-3", color: "sky" },
        ],
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
      {
        id: "card-10",
        title: "Ship the dark theme",
        cover: { kind: "color", color: "yellow" },
        labels: [
          { id: "label-4", color: "yellow" },
          { id: "label-5", color: "black" },
        ],
        checklist: { checked: 12, total: 12 },
      },
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
      {
        id: "card-12",
        title: "Audit every label color for contrast in both themes",
        cover: { kind: "color", color: "black" },
        labels: [
          { id: "label-6", name: "Accessibility", color: "green" },
          { id: "label-7", color: "red" },
        ],
        due: { date: "2026-12-02" },
        checklist: { checked: 3, total: 12 },
      },
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
        labels: [
          { id: "label-8", name: "Design", color: "pink" },
        ],
      },
    ],
  },
]

# Drag and drop comes from ReUI's Kanban and Sortable

shadcn/ui has no drag and drop, so boards, lists, and checklists use ReUI's `kanban` and `sortable`. Both wrap dnd-kit core 6 with mouse, long-press touch, and keyboard sensors, and ship a Base UI build that matches ADR 0001. `onValueCommit` reports the from and to list and index, which maps onto the move-card API call. Swapping the library later means rewriting every board, list, and checklist, which is why this gets an ADR.

ReUI ships four gaps we close ourselves. Its drag handle isn't focusable, Esc keeps the move unless `restoreOnCancel` is set, screen readers hear raw ids until we write announcements, and nothing in it satisfies WCAG 2.5.7.

## Consequences

- A separate grip button inside the card carries the keyboard drag. Enter on the card opens card detail, and Space on the grip picks the card up.
- `restoreOnCancel` is always true.
- Announcements name the card and the list, never ids.
- Every draggable thing also has a non-drag way to move: "Move…" for cards and lists, "Move up" and "Move down" for check items.
- Touch starts a drag after a 250ms long press, so the context menu opens on right click only.

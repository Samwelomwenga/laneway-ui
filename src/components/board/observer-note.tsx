"use client"

import type { BoardMember } from "@/lib/members"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

const anyOf = new Intl.ListFormat("en-US", { type: "disjunction" })

function observerNoteText(admins: readonly BoardMember[], mayComment: boolean) {
  const reach = mayComment
    ? "You can read this board and comment on cards, but you can't change it."
    : "You can read this board, but you can't change it."
  return `You're an observer. ${reach} To edit, ask an admin to change your role: ${anyOf.format(admins.map(admin => admin.fullName))}.`
}

export function ObserverNote({
  admins,
  mayComment,
  onDismiss,
}: Readonly<{
  admins: readonly BoardMember[]
  mayComment: boolean
  onDismiss: () => void
}>) {
  return (
    <div
      role="note"
      className="mx-list-gap flex items-start gap-2 rounded-card bg-secondary py-2 ps-4 pe-2 text-secondary-foreground"
    >
      <p className="min-w-0 flex-1 py-1 text-pretty">{observerNoteText(admins, mayComment)}</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
      >
        <Icon icon={Cancel01Icon} />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  )
}

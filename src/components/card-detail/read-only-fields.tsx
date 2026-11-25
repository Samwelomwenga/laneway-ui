import type { BoardCardData, CheckItem } from "@/components/board/board-types"
import type { CardFaceData } from "@/components/card-face"
import type { BoardLabel } from "@/components/label-chip"
import { Calendar03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { useId } from "react"
import { Icon } from "@/components/icon"
import { LabelChip } from "@/components/label-chip"
import { dueText } from "@/lib/card-fields"
import { cn } from "@/lib/utils"

function ReadOnlySection({ heading, aside, children }: Readonly<{ heading: string, aside?: React.ReactNode, children: React.ReactNode }>) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-field-gap">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="text-heading">{heading}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function ReadOnlyCardFields({ card }: Readonly<{ card: BoardCardData }>) {
  return (
    <>
      <ReadOnlyLabels labels={card.labels ?? []} />
      <ReadOnlyDueDate due={card.due} />
      <ReadOnlyChecklist items={card.checkItems ?? []} />
    </>
  )
}

function ReadOnlyLabels({ labels }: Readonly<{ labels: BoardLabel[] }>) {
  if (labels.length === 0)
    return null
  return (
    <ReadOnlySection heading="Labels">
      <ul className="flex flex-wrap items-center gap-1.5">
        {labels.map(label => (
          <li key={label.id} className="flex max-w-full">
            <LabelChip label={label} />
          </li>
        ))}
      </ul>
    </ReadOnlySection>
  )
}

function ReadOnlyDueDate({ due }: Readonly<{ due: CardFaceData["due"] }>) {
  if (!due)
    return null
  return (
    <ReadOnlySection heading="Due date">
      <p
        className={cn(
          "flex items-center gap-1.5",
          due.complete === true && "text-success",
          due.overdue === true && "text-destructive",
        )}
      >
        <Icon icon={Calendar03Icon} />
        {dueText(due)}
      </p>
    </ReadOnlySection>
  )
}

function ReadOnlyChecklist({ items }: Readonly<{ items: CheckItem[] }>) {
  if (items.length === 0)
    return null
  const checked = items.filter(item => item.checked).length
  return (
    <ReadOnlySection
      heading="Checklist"
      aside={(
        <p className={cn("text-meta text-muted-foreground", checked === items.length && "text-success")}>
          {`${checked} of ${items.length} checked`}
        </p>
      )}
    >
      <ul className="flex flex-col">
        {items.map(item => (
          <li key={item.id} className="flex min-h-control items-center gap-2.5 py-1.5">
            <span className="flex size-4 shrink-0 items-center justify-center text-success">
              {item.checked && <Icon icon={Tick02Icon} size="meta" />}
            </span>
            <span className={cn("min-w-0 text-card-title wrap-break-word", item.checked && "text-muted-foreground line-through")}>
              {item.name}
              <span className="sr-only">{item.checked ? ", checked" : ", not checked"}</span>
            </span>
          </li>
        ))}
      </ul>
    </ReadOnlySection>
  )
}

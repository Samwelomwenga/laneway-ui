import type { BoardLabel } from "@/components/label-chip"
import type { LabelColor } from "@/lib/label-colors"
import {
  Attachment01Icon,
  Calendar03Icon,
  CheckListIcon,
  Comment01Icon,
  MoreHorizontalIcon,
  TextAlignLeftIcon,
} from "@hugeicons/core-free-icons"
import Image from "next/image"
import { Icon } from "@/components/icon"
import { LabelChip } from "@/components/label-chip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Cover
  = | { kind: "color", color: LabelColor }
    | { kind: "image", src: string }

export type CardFaceData = {
  title: string
  cover?: Cover
  labels?: BoardLabel[]
  due?: { date: string, complete?: boolean, overdue?: boolean }
  checklist?: { checked: number, total: number }
  hasDescription?: boolean
  comments?: number
  attachments?: number
}

const dueFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export function CardFace({
  card,
  onOpen,
  grip,
}: Readonly<{
  card: CardFaceData
  onOpen?: () => void
  grip?: React.ReactNode
}>) {
  const { title, cover, labels = [] } = card
  return (
    <Card>
      {cover && <CardCover cover={cover} />}
      <CardContent className={cn(cover && "pt-card-inner", cover?.kind !== "image" && "*:first:pe-control-sm")}>
        {labels.length > 0 && (
          <ul aria-label="Labels" className="relative z-1 flex flex-wrap items-center gap-1.5">
            {labels.map(label => (
              <li key={label.id} className="flex max-w-full">
                <LabelChip label={label} />
              </li>
            ))}
          </ul>
        )}
        <CardTitle>
          {onOpen
            ? (
                <button
                  type="button"
                  onClick={onOpen}
                  className="text-start outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
                >
                  {title}
                </button>
              )
            : title}
        </CardTitle>
        <CardMeta card={card} />
      </CardContent>
      {grip}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute end-1.5 top-1.5 pointer-coarse:end-0 pointer-coarse:top-0 pointer-fine:opacity-0 pointer-fine:group-focus-within/card:opacity-100 pointer-fine:group-hover/card:opacity-100",
          cover && "bg-card shadow-card",
        )}
      >
        <Icon icon={MoreHorizontalIcon} />
        <span className="sr-only">{`Actions for ${title}`}</span>
      </Button>
    </Card>
  )
}

function CardCover({ cover }: Readonly<{ cover: Cover }>) {
  if (cover.kind === "color") {
    return (
      <div
        data-color={cover.color}
        className="h-7 bg-label-strong shadow-[inset_0_-1px_0_var(--label-ring)]"
      />
    )
  }
  return (
    <div className="relative aspect-video">
      <Image src={cover.src} alt="" fill sizes="18rem" className="object-cover object-center" />
    </div>
  )
}

function CardMeta({ card }: Readonly<{ card: CardFaceData }>) {
  const { due, checklist, hasDescription = false, comments = 0, attachments = 0 } = card
  if (!due && !checklist && !hasDescription && comments === 0 && attachments === 0)
    return null

  return (
    <CardFooter>
      {due && <DueDate due={due} />}
      {checklist && (
        <MetaItem
          icon={CheckListIcon}
          className={cn(checklist.total > 0 && checklist.checked === checklist.total && "text-success")}
          label={`Checklist, ${checklist.checked} of ${checklist.total} checked`}
          visible={`${checklist.checked}/${checklist.total}`}
        />
      )}
      {hasDescription && <MetaItem icon={TextAlignLeftIcon} label="Has a description" />}
      {comments > 0 && <MetaItem icon={Comment01Icon} label={plural(comments, "comment")} visible={String(comments)} />}
      {attachments > 0 && <MetaItem icon={Attachment01Icon} label={plural(attachments, "attachment")} visible={String(attachments)} />}
    </CardFooter>
  )
}

function DueDate({ due }: Readonly<{ due: NonNullable<CardFaceData["due"]> }>) {
  const date = dueFormat.format(new Date(due.date))
  if (due.complete === true)
    return <MetaItem icon={Calendar03Icon} className="text-success" label={`Due ${date}, complete`} visible={date} />
  if (due.overdue === true)
    return <MetaItem icon={Calendar03Icon} className="text-destructive" label={`Due ${date}, overdue`} visible={`${date}, overdue`} />
  return <MetaItem icon={Calendar03Icon} label={`Due ${date}`} visible={date} />
}

function plural(count: number, noun: string) {
  const suffix = count === 1
    ? ""
    : "s"
  return `${count} ${noun}${suffix}`
}

function MetaItem({
  icon,
  className,
  label,
  visible,
}: Readonly<{
  icon: React.ComponentProps<typeof Icon>["icon"]
  className?: string
  label: string
  visible?: string
}>) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Icon icon={icon} size="meta" />
      <span className="sr-only">{label}</span>
      {visible !== undefined && <span aria-hidden>{visible}</span>}
    </span>
  )
}

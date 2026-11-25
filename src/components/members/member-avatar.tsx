import type { BoardMember } from "@/lib/members"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { avatarStep, initials } from "@/lib/members"
import { cn } from "@/lib/utils"

const INITIALS = "text-[0.8rem] font-semibold"

export function MemberAvatar({ member, className }: Readonly<{ member: Pick<BoardMember, "id" | "fullName">, className?: string }>) {
  return (
    <Avatar aria-hidden data-avatar={avatarStep(member.id)} className={className}>
      <AvatarFallback className={cn(INITIALS, "bg-avatar-disc text-avatar-initials")}>
        {initials(member.fullName)}
      </AvatarFallback>
    </Avatar>
  )
}

export function OverflowDisc({ count, className }: Readonly<{ count: number, className?: string }>) {
  return (
    <Avatar aria-hidden className={className}>
      <AvatarFallback className={cn(INITIALS, "bg-muted text-muted-foreground tabular-nums")}>
        {`+${count}`}
      </AvatarFallback>
    </Avatar>
  )
}

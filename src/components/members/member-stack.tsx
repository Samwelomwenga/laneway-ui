import type { BoardMember } from "@/lib/members"
import { MemberAvatar, OverflowDisc } from "@/components/members/member-avatar"
import { Button } from "@/components/ui/button"
import { stackFaces } from "@/lib/members"

const RING = "ring-2 ring-background"

export function MemberStack({ members, expanded, onOpen }: Readonly<{ members: BoardMember[], expanded: boolean, onOpen: () => void }>) {
  const { faces, overflow } = stackFaces(members)

  return (
    <Button
      variant="ghost"
      aria-label={`Board members, ${members.length}`}
      aria-expanded={expanded}
      className="px-1"
      onClick={onOpen}
    >
      <span className="flex -space-x-1.5">
        {faces.map(member => <MemberAvatar key={member.id} member={member} className={RING} />)}
        {overflow > 0 && <OverflowDisc count={overflow} className={RING} />}
      </span>
    </Button>
  )
}

import { Mascot } from "@/components/mascot"
import { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function EmptyBoardIntro({ readOnly }: Readonly<{ readOnly: boolean }>) {
  return (
    <EmptyHeader>
      {!readOnly && (
        <EmptyMedia>
          <Mascot expression="inviting" size="small" />
        </EmptyMedia>
      )}
      <EmptyTitle>Nothing here yet</EmptyTitle>
      <EmptyDescription>
        {readOnly
          ? "No one has added a list to this board yet."
          : "Lists hold your cards. Add the first one to get started."}
      </EmptyDescription>
    </EmptyHeader>
  )
}

import { Suspense } from "react"
import { Mascot } from "@/components/mascot"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { requireSession } from "@/lib/auth/session"

export default function Home() {
  return (
    <SidebarInset>
      <header className="flex items-center gap-2 px-list-gap py-3">
        <SidebarTrigger label="Boards" />
      </header>
      <Suspense>
        <BoardsPlaceholder />
      </Suspense>
    </SidebarInset>
  )
}

async function BoardsPlaceholder() {
  await requireSession("/")
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Mascot expression="welcoming" size="hero" />
        </EmptyMedia>
        <EmptyTitle level={1}>You're in.</EmptyTitle>
        <EmptyDescription>Your boards will live here. They're on the way.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

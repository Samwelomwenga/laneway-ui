import type { Metadata } from "next"
import {
  FIXTURE_BOARD_ID,
  FIXTURE_BOARDS,
  FIXTURE_LABELS,
  FIXTURE_LISTS,
  FIXTURE_MEMBERS,
  FIXTURE_VIEWER_ID,
} from "@/app/specimen/board/fixture"
import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { BoardScreen } from "@/components/board/board-screen"
import { SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Fixture board · Laneway",
}

export default function FixtureBoardPage() {
  return (
    <SidebarProvider>
      <AppSidebar boards={FIXTURE_BOARDS} currentBoardId={FIXTURE_BOARD_ID} />
      <BoardScreen
        name="Fixture board"
        lists={FIXTURE_LISTS}
        labels={FIXTURE_LABELS}
        initialMembers={FIXTURE_MEMBERS}
        viewerId={FIXTURE_VIEWER_ID}
        addMembers="admins"
      />
    </SidebarProvider>
  )
}

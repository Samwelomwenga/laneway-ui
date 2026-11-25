import type { BoardListData } from "@/components/board/board-types"
import {
  FIXTURE_BOARD_ID,
  FIXTURE_BOARDS,
  FIXTURE_LABELS,
  FIXTURE_LISTS,
  FIXTURE_MEMBERS,
} from "@/app/specimen/board/fixture"
import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { BoardScreen } from "@/components/board/board-screen"
import { SidebarProvider } from "@/components/ui/sidebar"

export function FixtureBoard({ viewerId, lists = FIXTURE_LISTS }: Readonly<{ viewerId: string, lists?: BoardListData[] }>) {
  return (
    <SidebarProvider>
      <AppSidebar boards={FIXTURE_BOARDS} currentBoardId={FIXTURE_BOARD_ID} />
      <BoardScreen
        name="Fixture board"
        lists={lists}
        labels={FIXTURE_LABELS}
        initialMembers={FIXTURE_MEMBERS}
        viewerId={viewerId}
        addMembers="admins"
        observersMayComment
      />
    </SidebarProvider>
  )
}

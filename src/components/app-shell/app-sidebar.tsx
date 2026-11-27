"use client"

import { DashboardSquare01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Icon } from "@/components/icon"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type SidebarBoard = { id: string, name: string, href: string }

export function AppSidebar({ boards, currentBoardId }: Readonly<{ boards: SidebarBoard[], currentBoardId?: string }>) {
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar label="Boards">
      <SidebarHeader>
        <p className="px-2.5 text-heading">Laneway</p>
      </SidebarHeader>
      <SidebarContent>
        {boards.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Boards</SidebarGroupLabel>
            <SidebarMenu>
              {boards.map((board) => {
                const current = board.id === currentBoardId
                return (
                  <SidebarMenuItem key={board.id}>
                    <SidebarMenuButton
                      isActive={current}
                      render={<Link href={board.href} aria-current={current ? "page" : undefined} onClick={() => setOpenMobile(false)} />}
                    >
                      <Icon icon={DashboardSquare01Icon} size="nav" />
                      <span>{board.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}

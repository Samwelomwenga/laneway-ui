"use client"

import type { BoardListData } from "@/components/board/board-types"
import type { BoardLabel } from "@/components/label-chip"
import type { AddMembersSetting, BoardMember, BoardRole } from "@/lib/members"
import { Share08Icon } from "@hugeicons/core-free-icons"
import { useRef, useState } from "react"
import { Board } from "@/components/board/board"
import { Icon } from "@/components/icon"
import { MemberStack } from "@/components/members/member-stack"
import { MembersPanel } from "@/components/members/members-panel"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { mayAddMembers, roleOf } from "@/lib/members"

type BoardScreenProps = Readonly<{
  name: string
  lists: BoardListData[]
  labels: BoardLabel[]
  initialMembers: BoardMember[]
  viewerId: string
  addMembers: AddMembersSetting
}>

export function BoardScreen({ name, lists, labels, initialMembers, viewerId, addMembers }: BoardScreenProps) {
  const [members, setMembers] = useState(initialMembers)
  const [panelOpen, setPanelOpen] = useState(false)
  const panelSlotRef = useRef<HTMLDivElement>(null)
  const viewerRole = roleOf(members, viewerId)

  function changeRole(memberId: string, role: BoardRole) {
    setMembers(current => current.map(member => member.id === memberId
      ? { ...member, role }
      : member))
  }

  return (
    <SidebarInset>
      <header className="flex items-center gap-2 px-list-gap py-3">
        <SidebarTrigger label="Boards" />
        <h1 className="min-w-0 flex-1 truncate text-title">{name}</h1>
        <MemberStack members={members} expanded={panelOpen} onOpen={() => setPanelOpen(true)} />
        {mayAddMembers(viewerRole, addMembers) && (
          <Button variant="secondary" className="max-sm:w-control max-sm:px-0" onClick={() => setPanelOpen(true)}>
            <Icon icon={Share08Icon} />
            <span className="max-sm:sr-only">Share</span>
          </Button>
        )}
      </header>
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Board initialLists={lists} labels={labels} />
        </div>
        <div ref={panelSlotRef} className="flex shrink-0 max-lg:hidden" />
      </div>
      <MembersPanel
        open={panelOpen}
        members={members}
        viewerId={viewerId}
        panelSlot={panelSlotRef}
        onOpenChange={setPanelOpen}
        onChangeRole={changeRole}
      />
    </SidebarInset>
  )
}

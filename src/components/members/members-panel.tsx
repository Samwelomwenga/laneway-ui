"use client"

import type { BoardMember, BoardRole } from "@/lib/members"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { useId, useRef, useState } from "react"
import { Icon } from "@/components/icon"
import { MemberAvatar } from "@/components/members/member-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { BOARD_ROLES, groupByRole, isLastAdmin, roleOf, ROLES } from "@/lib/members"
import { cn } from "@/lib/utils"

type MembersPanelProps = Readonly<{
  open: boolean
  members: BoardMember[]
  viewerId: string
  panelSlot: React.RefObject<HTMLDivElement | null>
  onOpenChange: (open: boolean) => void
  onChangeRole: (memberId: string, role: BoardRole) => void
}>

export function MembersPanel({ open, members, viewerId, panelSlot, onOpenChange, onChangeRole }: MembersPanelProps) {
  const isMobile = useIsMobile()
  const popupRef = useRef<HTMLDivElement>(null)
  const refocusRef = useRef<string>(undefined)
  const [expandedId, setExpandedId] = useState<string>()
  const [status, setStatus] = useState("")
  const viewerIsAdmin = roleOf(members, viewerId) === "admin"

  function changeRole(member: BoardMember, role: BoardRole) {
    if (member.id === viewerId && role !== "admin") {
      setExpandedId(undefined)
      popupRef.current?.focus()
    }
    else {
      refocusRef.current = member.id
    }
    onChangeRole(member.id, role)
    setStatus(`${member.fullName} is now ${ROLES[role].phrase}.`)
  }

  function refocusChecked(group: HTMLDivElement | null, memberId: string) {
    if (!group || refocusRef.current !== memberId)
      return
    refocusRef.current = undefined
    group.querySelector<HTMLElement>("[role=radio][aria-checked=true]")?.focus()
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={isMobile}
      disablePointerDismissal={!isMobile}
      onOpenChangeComplete={(next) => {
        if (!next) {
          setExpandedId(undefined)
          setStatus("")
        }
      }}
    >
      <DialogPrimitive.Portal container={isMobile ? undefined : panelSlot}>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-(--duration-base) ease-linear data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0 motion-reduce:duration-(--duration-fast) motion-reduce:data-ending-style:duration-(--duration-fast) lg:hidden"
        />
        <DialogPrimitive.Popup
          ref={popupRef}
          data-slot="members-panel"
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-popover text-popover-foreground shadow-popover outline-none sm:start-auto sm:w-90 sm:rounded-s-popover lg:static lg:z-auto lg:h-full",
            "transition-[opacity,translate] duration-(--duration-base) ease-enter data-ending-style:translate-x-full data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-exit data-starting-style:translate-x-full data-starting-style:opacity-0",
            "motion-reduce:duration-(--duration-fast) motion-reduce:data-ending-style:translate-x-0 motion-reduce:data-ending-style:duration-(--duration-fast) motion-reduce:data-starting-style:translate-x-0 lg:data-ending-style:translate-x-0 lg:data-starting-style:translate-x-0",
          )}
        >
          <header className="flex items-center justify-between gap-2 py-3 ps-6 pe-3">
            <DialogTitle>Members</DialogTitle>
            <DialogPrimitive.Close render={<Button variant="ghost" size="icon" />}>
              <Icon icon={Cancel01Icon} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </header>
          <p role="status" className="sr-only">{status}</p>
          <div className="flex min-h-0 flex-1 flex-col gap-section-gap overflow-y-auto px-6 pt-2 pb-6">
            {groupByRole(members).map(group => (
              <RoleGroup key={group.role} role={group.role} count={group.members.length}>
                {group.members.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isViewer={member.id === viewerId}
                    expanded={viewerIsAdmin && expandedId === member.id}
                    canChangeRole={viewerIsAdmin}
                    lastAdmin={isLastAdmin(members, member)}
                    onToggle={() => setExpandedId(expandedId === member.id
                      ? undefined
                      : member.id)}
                    onChangeRole={role => changeRole(member, role)}
                    radioGroupRef={group => refocusChecked(group, member.id)}
                  />
                ))}
              </RoleGroup>
            ))}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function RoleGroup({ role, count, children }: Readonly<{ role: BoardRole, count: number, children: React.ReactNode }>) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h3 id={headingId} className="flex items-baseline gap-2 text-heading">
        {ROLES[role].groupName}
        <span className="text-meta text-muted-foreground">{count}</span>
      </h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </section>
  )
}

type MemberRowProps = Readonly<{
  member: BoardMember
  isViewer: boolean
  expanded: boolean
  canChangeRole: boolean
  lastAdmin: boolean
  onToggle: () => void
  onChangeRole: (role: BoardRole) => void
  radioGroupRef: (group: HTMLDivElement | null) => void
}>

function MemberRow({ member, isViewer, expanded, canChangeRole, lastAdmin, onToggle, onChangeRole, radioGroupRef }: MemberRowProps) {
  const rolesId = useId()

  return (
    <li className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <MemberAvatar member={member} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-card-title">
            <span className="min-w-0 truncate">{member.fullName}</span>
            {isViewer && <span className="text-meta text-muted-foreground">(you)</span>}
            {member.guest && <Badge variant="outline" title="Not a member of this workspace">Guest</Badge>}
          </p>
          <p className="truncate text-meta text-muted-foreground">{`@${member.username}`}</p>
        </div>
        {canChangeRole && (
          <Button variant="ghost" className="px-2.5" aria-expanded={expanded} aria-controls={expanded ? rolesId : undefined} onClick={onToggle}>
            Change role
            <span className="sr-only">{` for ${member.fullName}`}</span>
          </Button>
        )}
      </div>
      {expanded && (
        <RoleChooser id={rolesId} member={member} lastAdmin={lastAdmin} onChange={onChangeRole} groupRef={radioGroupRef} />
      )}
    </li>
  )
}

type RoleChooserProps = Readonly<{
  id: string
  member: BoardMember
  lastAdmin: boolean
  onChange: (role: BoardRole) => void
  groupRef: (group: HTMLDivElement | null) => void
}>

function RoleChooser({ id, member, lastAdmin, onChange, groupRef }: RoleChooserProps) {
  const labelId = useId()
  const noteId = useId()

  return (
    <div id={id} className="flex flex-col gap-3 rounded-card bg-muted p-3.5">
      <span id={labelId} className="sr-only">{`Role for ${member.fullName}`}</span>
      <RadioGroup
        ref={groupRef}
        value={member.role}
        disabled={lastAdmin}
        aria-labelledby={labelId}
        aria-describedby={lastAdmin ? noteId : undefined}
        onValueChange={onChange}
        className="gap-3"
      >
        {BOARD_ROLES.map(role => (
          <RoleOption key={role} role={role} />
        ))}
      </RadioGroup>
      {lastAdmin && <p id={noteId} className="text-meta text-muted-foreground">Make someone else an admin first. A board always needs one.</p>}
    </div>
  )
}

function RoleOption({ role }: Readonly<{ role: BoardRole }>) {
  const descriptionId = useId()
  return (
    <label className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-0.5 has-data-disabled:cursor-not-allowed">
      <RadioGroupItem value={role} aria-describedby={descriptionId} className="row-span-2 mt-0.5" />
      <span className="text-card-title">{ROLES[role].name}</span>
      <span id={descriptionId} className="text-meta text-muted-foreground">{ROLES[role].description}</span>
    </label>
  )
}

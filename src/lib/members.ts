export const BOARD_ROLES = ["admin", "normal", "observer"] as const

export type BoardRole = typeof BOARD_ROLES[number]

export type BoardMember = {
  id: string
  fullName: string
  username: string
  role: BoardRole
  guest?: boolean
}

export type AddMembersSetting = "admins" | "members"

export const ROLES: Record<BoardRole, { name: string, groupName: string, description: string, phrase: string }> = {
  admin: {
    name: "Admin",
    groupName: "Admins",
    description: "Changes anything, including members and board settings.",
    phrase: "an admin",
  },
  normal: {
    name: "Normal",
    groupName: "Normals",
    description: "Adds, edits, and moves lists and cards.",
    phrase: "a normal member",
  },
  observer: {
    name: "Observer",
    groupName: "Observers",
    description: "Reads the board but can't change it.",
    phrase: "an observer",
  },
}

export function roleOf(members: readonly BoardMember[], userId: string) {
  return members.find(member => member.id === userId)?.role
}

export type AvatarStep = 1 | 2 | 3 | 4

export function avatarStep(userId: string): AvatarStep {
  let hash = 2166136261
  for (const char of userId) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 4 + 1) as AvatarStep
}

export function initials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ""
  const last = words.length > 1
    ? words.at(-1)?.[0] ?? ""
    : ""
  return (first + last).toUpperCase()
}

const STACK_FACES = 3

export function stackFaces(members: readonly BoardMember[]) {
  if (members.length <= STACK_FACES + 1)
    return { faces: members, overflow: 0 }
  return {
    faces: members.slice(0, STACK_FACES),
    overflow: members.length - STACK_FACES,
  }
}

export function groupByRole(members: readonly BoardMember[]) {
  return BOARD_ROLES
    .map(role => ({
      role,
      members: members.filter(member => member.role === role),
    }))
    .filter(group => group.members.length > 0)
}

export function isLastAdmin(members: readonly BoardMember[], member: BoardMember) {
  return member.role === "admin" && members.filter(other => other.role === "admin").length === 1
}

export function mayAddMembers(role: BoardRole | undefined, setting: AddMembersSetting) {
  return role === "admin" || (role === "normal" && setting === "members")
}

export function mayEditBoard(role: BoardRole | undefined) {
  return role === "admin" || role === "normal"
}

export function boardAdmins(members: readonly BoardMember[]) {
  return members.filter(member => member.role === "admin")
}

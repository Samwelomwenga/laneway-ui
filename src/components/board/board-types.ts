import type { CardFaceData } from "@/components/card-face"
import type { LabelColor } from "@/lib/label-colors"

export type CheckItem = { id: string, name: string, checked: boolean }

export type BoardCardData = CardFaceData & { id: string, checkItems?: CheckItem[] }

export type BoardListData = {
  id: string
  name: string
  color?: LabelColor
  cards: BoardCardData[]
}

export type BoardListMeta = Omit<BoardListData, "cards">

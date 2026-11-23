import type { CardFaceData } from "@/components/card-face"
import type { LabelColor } from "@/lib/label-colors"

export type BoardCardData = CardFaceData & { id: string }

export type BoardListData = {
  id: string
  name: string
  color?: LabelColor
  cards: BoardCardData[]
}

export type BoardListMeta = Omit<BoardListData, "cards">

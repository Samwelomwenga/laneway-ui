export const LABEL_COLOR_NAMES = {
  yellow: "Yellow",
  purple: "Purple",
  blue: "Blue",
  red: "Red",
  green: "Green",
  orange: "Orange",
  black: "Black",
  sky: "Sky",
  pink: "Pink",
  lime: "Lime",
} as const

export type LabelColor = keyof typeof LABEL_COLOR_NAMES

export const LABEL_COLOR_KEYS = Object.keys(LABEL_COLOR_NAMES) as LabelColor[]

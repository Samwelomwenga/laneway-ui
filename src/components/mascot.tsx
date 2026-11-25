import { MascotStill } from "@/components/mascot-still"
import { WelcomingClip } from "@/components/welcoming-clip"
import { cn } from "@/lib/utils"

const SIZES = {
  hero: { className: "size-[min(8rem,30svh)] sm:size-[min(12rem,30svh)]", sizes: "(min-width: 40rem) 12rem, 8rem" },
  small: { className: "size-30", sizes: "7.5rem" },
} as const

type MascotSize = keyof typeof SIZES

export const STILL_EXPRESSIONS = [
  "neutral",
  "inviting",
  "puzzled",
  "apologetic",
  "waiting",
  "pleased",
] as const

type StillExpression = typeof STILL_EXPRESSIONS[number]

type MascotProps = Readonly<{ size: MascotSize, className?: string } & (
  | { expression: StillExpression | "welcoming" }
  | { expression: "pointing", toward: "left" | "right" }
)>

export function Mascot(props: MascotProps) {
  const { size, className } = props
  const boxClassName = cn(
    "shrink-0",
    SIZES[size].className,
    props.expression === "pointing" && props.toward === "left" && "-scale-x-100",
    className,
  )
  if (props.expression === "welcoming")
    return <WelcomingClip className={boxClassName} sizes={SIZES[size].sizes} />
  return <MascotStill file={`cobble-${props.expression}.png`} className={boxClassName} sizes={SIZES[size].sizes} />
}

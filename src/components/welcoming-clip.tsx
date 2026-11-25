"use client"

import type { MascotBoxProps } from "@/components/mascot-still"
import { useSyncExternalStore } from "react"
import { MascotStill } from "@/components/mascot-still"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(onChange: () => void) {
  const query = matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

export function WelcomingClip({ className, sizes }: MascotBoxProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchMedia(REDUCED_MOTION).matches,
    () => undefined,
  )

  if (reducedMotion === undefined)
    return <span aria-hidden className={className} />
  if (reducedMotion)
    return <MascotStill file="cobble-welcoming-end.png" className={className} sizes={sizes} />
  return (
    <video aria-hidden autoPlay muted playsInline disablePictureInPicture disableRemotePlayback className={className}>
      <source src="/mascot/cobble-welcoming.mov" type={"video/mp4; codecs=\"hvc1\""} />
      <source src="/mascot/cobble-welcoming.webm" type="video/webm" />
    </video>
  )
}

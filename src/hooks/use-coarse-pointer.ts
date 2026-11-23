import { useSyncExternalStore } from "react"

const QUERY = "(pointer: coarse)"

function subscribe(onChange: () => void) {
  const query = matchMedia(QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false)
}

import { useMediaQuery } from "@/hooks/use-media-query"

export function useCoarsePointer() {
  return useMediaQuery("(pointer: coarse)")
}

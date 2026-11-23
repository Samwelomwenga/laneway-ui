import { useMediaQuery } from "@/hooks/use-media-query"

export function useIsMobile() {
  return useMediaQuery("(width < 64rem)")
}

import type { Metadata } from "next"
import { NotFoundScreen } from "@/components/edge-screen"

export const metadata: Metadata = {
  title: "Page not found · Laneway",
}

export default function NotFound() {
  return <NotFoundScreen />
}

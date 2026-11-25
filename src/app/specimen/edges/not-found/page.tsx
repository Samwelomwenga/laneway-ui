import type { Metadata } from "next"
import { NotFoundScreen } from "@/components/edge-screen"

export const metadata: Metadata = {
  title: "Not-found screen · Laneway",
}

export default function NotFoundSpecimenPage() {
  return <NotFoundScreen />
}

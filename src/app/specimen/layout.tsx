import { notFound } from "next/navigation"
import { requireEnv } from "@/lib/env"

export default function SpecimenLayout({ children }: LayoutProps<"/specimen">): React.ReactNode {
  if (requireEnv("NODE_ENV") === "production") {
    notFound()
  }
  return children
}

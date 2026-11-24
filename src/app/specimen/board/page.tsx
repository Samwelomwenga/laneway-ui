import type { Metadata } from "next"
import { FIXTURE_VIEWER_ID } from "@/app/specimen/board/fixture"
import { FixtureBoard } from "@/app/specimen/board/fixture-board"

export const metadata: Metadata = {
  title: "Fixture board · Laneway",
}

export default function FixtureBoardPage() {
  return <FixtureBoard viewerId={FIXTURE_VIEWER_ID} />
}

import type { Metadata } from "next"
import { FIXTURE_OBSERVER_ID } from "@/app/specimen/board/fixture"
import { FixtureBoard } from "@/app/specimen/board/fixture-board"

export const metadata: Metadata = {
  title: "Fixture board as an observer · Laneway",
}

export default function ObserverBoardPage() {
  return <FixtureBoard viewerId={FIXTURE_OBSERVER_ID} />
}

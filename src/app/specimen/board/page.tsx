import type { Metadata } from "next"
import { FIXTURE_LISTS } from "@/app/specimen/board/fixture"
import { Board } from "@/components/board/board"
import { ModeToggle } from "@/components/mode-toggle"

export const metadata: Metadata = {
  title: "Fixture board · Laneway",
}

export default function FixtureBoardPage() {
  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 px-list-gap py-3">
        <h1 className="text-title">Fixture board</h1>
        <ModeToggle />
      </header>
      <Board initialLists={FIXTURE_LISTS} />
    </main>
  )
}

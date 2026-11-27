import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { recordLostChanges, takeLostChanges } from "@/lib/auth/lost-changes"

function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: key => items.get(key) ?? null,
    key: index => Array.from(items.keys())[index] ?? null,
    removeItem: (key) => {
      items.delete(key)
    },
    setItem: (key, value) => {
      items.set(key, value)
    },
  }
}

const router = {
  replace: vi.fn<(href: string) => void>(),
}

beforeEach(() => {
  vi.stubGlobal("sessionStorage", memoryStorage())
  vi.useFakeTimers({
    now: new Date("2026-11-27T12:00:00Z"),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  router.replace.mockReset()
})

describe("recordLostChanges", () => {
  it("sends the tab to sign-in with returnTo", () => {
    recordLostChanges(["Add \"Check the sign-in copy\" to Review"], "/boards/7?card=3", router)

    expect(router.replace).toHaveBeenCalledWith("/sign-in?returnTo=%2Fboards%2F7%3Fcard%3D3")
  })

  it("appends to the list across several writes", () => {
    recordLostChanges(["Add \"Check the sign-in copy\" to Review"], "/", router)
    vi.advanceTimersByTime(1_000)
    recordLostChanges(["Rename Review to Done", "Archive Backlog"], "/", router)

    expect(takeLostChanges()).toEqual([
      "Add \"Check the sign-in copy\" to Review",
      "Rename Review to Done",
      "Archive Backlog",
    ])
  })
})

describe("takeLostChanges", () => {
  it("deletes the list once read", () => {
    recordLostChanges(["Rename Review to Done"], "/", router)

    expect(takeLostChanges()).toEqual(["Rename Review to Done"])
    expect(takeLostChanges()).toEqual([])
  })

  it("drops entries older than 10 minutes", () => {
    recordLostChanges(["Rename Review to Done"], "/", router)
    vi.advanceTimersByTime(10 * 60_000 + 1)
    recordLostChanges(["Archive Backlog"], "/", router)
    vi.advanceTimersByTime(10 * 60_000)

    expect(takeLostChanges()).toEqual(["Archive Backlog"])
  })

  it("returns nothing when the stored list is not valid JSON", () => {
    sessionStorage.setItem("lnw:lost-changes", "{not json")

    expect(takeLostChanges()).toEqual([])
  })
})

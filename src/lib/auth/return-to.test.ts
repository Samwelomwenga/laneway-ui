import { describe, expect, it } from "vitest"
import { safeReturnTo } from "@/lib/auth/return-to"

describe("safeReturnTo", () => {
  it("keeps a protected path with its query", () => {
    expect(safeReturnTo("/b/1?x=2")).toBe("/b/1?x=2")
  })

  it.each([
    ["a protocol-relative URL", "//evil"],
    ["a backslash that browsers read as a slash", "/\\evil"],
    ["an absolute URL", "https://evil"],
    ["a tab that the URL parser strips", "/\t/evil"],
    ["a public page", "/sign-in"],
    ["a public page with a query", "/sign-in?returnTo=/b/1"],
    ["an empty value", ""],
    ["a missing value", null],
  ])("sends %s home", (_, value) => {
    expect(safeReturnTo(value)).toBe("/")
  })
})

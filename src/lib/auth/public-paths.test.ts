import { afterEach, describe, expect, it, vi } from "vitest"

async function isPublicPathIn(nodeEnv: string, pathname: string) {
  vi.stubEnv("NODE_ENV", nodeEnv)
  const { isPublicPath } = await import("@/lib/auth/public-paths")
  return isPublicPath(pathname)
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("isPublicPath", () => {
  it.each(["/sign-in", "/left", "/data/username-available"])("lets %s through", async (pathname) => {
    expect(await isPublicPathIn("production", pathname)).toBe(true)
  })

  it.each([
    "/",
    "/settings",
    "/left/anything",
    "/sign-in-later",
    "/data/username-available/x",
  ])("protects %s", async (pathname) => {
    expect(await isPublicPathIn("production", pathname)).toBe(false)
  })

  it("opens the specimen and prototype pages in development", async () => {
    expect(await isPublicPathIn("development", "/specimen/board/empty")).toBe(true)
    expect(await isPublicPathIn("development", "/prototype")).toBe(true)
  })

  it("protects the specimen pages in production", async () => {
    expect(await isPublicPathIn("production", "/specimen")).toBe(false)
  })
})

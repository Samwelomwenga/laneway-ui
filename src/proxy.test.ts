import type { NextResponse } from "next/server"
import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server"
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { resetRefreshLock } from "@/lib/auth/refresh-lock"
import { config, proxy } from "@/proxy"

vi.hoisted(() => {
  vi.stubEnv("LANEWAY_API_URL", "http://api.test:8080")
})

const REFRESH = "__Host-Http-lnw_refresh"
const ACCESS = "__Host-Http-lnw_access"
const NOTICE = "__Host-lnw_notice"

const newAccessLine = `${ACCESS}=at-new; max-age=840; path=/; secure; samesite=lax; httponly`
const newRefreshLine = `${REFRESH}=rt-new; max-age=604800; path=/; secure; samesite=lax; httponly`
const clearRefreshLine = `${REFRESH}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax; httponly`

const fetchMock = vi.fn<typeof fetch>()

function apiReply(status: number, ...setCookies: string[]) {
  const headers = new Headers()
  for (const line of setCookies) {
    headers.append("set-cookie", line)
  }
  return new Response(null, { status, headers })
}

function sentRequest() {
  const [input, init] = fetchMock.mock.lastCall ?? []
  return new Request(input!, init)
}

function expectUntouched(response: NextResponse) {
  expect(response.headers.getSetCookie()).toEqual([])
  expect(getRedirectUrl(response)).toBeNull()
}

/** The `cookie` header the render sees, which Next carries on the proxy response. */
function renderCookies(response: Response) {
  const header = response.headers.get("x-middleware-request-cookie") ?? ""
  return Object.fromEntries(header.split("; ").map((pair): [string, string] => {
    const [name = "", value = ""] = pair.split("=", 2)
    return [name, value]
  }))
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  fetchMock.mockReset()
  resetRefreshLock()
})

function request(path: string, cookies: Record<string, string> = {}, headers: Record<string, string> = {}, method = "GET") {
  const cookie = Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ")
  return new NextRequest(`https://laneway.test${path}`, {
    method,
    headers: cookie === ""
      ? headers
      : { ...headers, cookie },
  })
}

describe("proxy matcher", () => {
  it.each([
    "/",
    "/settings/email",
    "/sign-in",
    "/data/sessions",
    "/specimen",
  ])("runs on %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true)
  })

  it.each([
    "/api/health",
    "/_next/static/chunks/main.js",
    "/_next/image",
    "/favicon.ico",
    "/mascot/cobble-welcoming.webm",
    "/specimen/cover.svg",
  ])("skips %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false)
  })
})

describe("proxy redirect", () => {
  it("sends a protected path with no refresh cookie to sign-in with its path and query", async () => {
    const response = await proxy(request("/settings/email?tab=change"))

    expect(getRedirectUrl(response)).toBe("https://laneway.test/sign-in?returnTo=%2Fsettings%2Femail%3Ftab%3Dchange")
  })

  it("counts an empty refresh cookie as none", async () => {
    const response = await proxy(request("/", { [REFRESH]: "" }))

    expect(getRedirectUrl(response)).toBe("https://laneway.test/sign-in?returnTo=%2F")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("lets a server function call through, so it can return notAuthenticated itself", async () => {
    const response = await proxy(request("/settings/email", {}, { "next-action": "7f3a" }, "POST"))

    expect(getRedirectUrl(response)).toBeNull()
  })

  it("still redirects a GET that carries a next-action header", async () => {
    const response = await proxy(request("/settings/email", {}, { "next-action": "7f3a" }))

    expect(getRedirectUrl(response)).toBe("https://laneway.test/sign-in?returnTo=%2Fsettings%2Femail")
  })

  it("never redirects away from a public path", async () => {
    const response = await proxy(request("/sign-up"))

    expect(getRedirectUrl(response)).toBeNull()
  })
})

describe("proxy notice", () => {
  it("on sign-in, deletes the notice cookie and tells the render the session ended", async () => {
    const response = await proxy(request("/sign-in", { [NOTICE]: "ended" }))

    expect(response.cookies.get(NOTICE)).toMatchObject({ value: "", path: "/", secure: true })
    expect(response.headers.get("x-middleware-request-x-lnw-notice")).toBe("ended")
  })

  it("leaves the notice cookie alone on other pages", async () => {
    const response = await proxy(request("/sign-up", { [NOTICE]: "ended" }))

    expect(response.headers.getSetCookie()).toEqual([])
    expect(response.headers.get("x-middleware-request-x-lnw-notice")).toBeNull()
  })

  it("drops an x-lnw-notice header the browser sent", async () => {
    const response = await proxy(request("/sign-in", {}, { "x-lnw-notice": "ended" }))

    expect(response.headers.get("x-middleware-override-headers")).not.toContain("x-lnw-notice")
    expect(response.headers.get("x-middleware-request-x-lnw-notice")).toBeNull()
  })

  it("tells sign-in at once when its own refresh gets a 401", async () => {
    fetchMock.mockResolvedValue(apiReply(401, clearRefreshLine))

    const response = await proxy(request("/sign-in", { [REFRESH]: "rt-revoked" }))

    expect(response.cookies.get(NOTICE)?.value).toBe("")
    expect(response.headers.get("x-middleware-request-x-lnw-notice")).toBe("ended")
  })
})

describe("proxy refresh", () => {
  it("refreshes once when the access cookie is gone, relays the cookies, and rewrites the request cookie", async () => {
    fetchMock.mockResolvedValue(apiReply(200, newAccessLine, newRefreshLine))

    const response = await proxy(request("/settings", { [REFRESH]: "rt-old", theme: "dark" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const sent = sentRequest()
    expect(sent.method).toBe("POST")
    expect(sent.url).toBe("http://api.test:8080/api/v1/auth/refresh")
    expect(sent.headers.get("cookie")).toBe(`${REFRESH}=rt-old`)
    expect(response.cookies.get(ACCESS)).toMatchObject({
      value: "at-new",
      maxAge: 840,
      secure: true,
      httpOnly: true,
    })
    expect(response.cookies.get(REFRESH)).toMatchObject({ value: "rt-new", maxAge: 604800 })
    expect(renderCookies(response)).toEqual({ [REFRESH]: "rt-new", theme: "dark", [ACCESS]: "at-new" })
    expect(getRedirectUrl(response)).toBeNull()
  })

  it("shares one refresh call per refresh cookie for 10 seconds after it settles", async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(async () => apiReply(200, newAccessLine, newRefreshLine))
    const stale = { [REFRESH]: "rt-old" }

    const [first, second] = await Promise.all([
      proxy(request("/", stale)),
      proxy(request("/settings", stale)),
    ])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(first.cookies.get(ACCESS)?.value).toBe("at-new")
    expect(second.cookies.get(ACCESS)?.value).toBe("at-new")

    await vi.advanceTimersByTimeAsync(9_000)
    const third = await proxy(request("/", stale))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(third.cookies.get(ACCESS)?.value).toBe("at-new")

    await vi.advanceTimersByTimeAsync(2_000)
    await proxy(request("/", stale))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("doesn't share a refresh call between different refresh cookies", async () => {
    fetchMock.mockImplementation(async () => apiReply(200, newAccessLine, newRefreshLine))

    await Promise.all([
      proxy(request("/", { [REFRESH]: "rt-a" })),
      proxy(request("/", { [REFRESH]: "rt-b" })),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("relays the API's clear on a 401, sets the ended notice, and doesn't redirect", async () => {
    fetchMock.mockResolvedValue(apiReply(401, clearRefreshLine))

    const response = await proxy(request("/settings", { [REFRESH]: "rt-revoked" }))

    expect(response.cookies.get(REFRESH)).toMatchObject({ value: "", path: "/", secure: true })
    expect(response.cookies.get(NOTICE)).toMatchObject({
      value: "ended",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 120,
    })
    expect(getRedirectUrl(response)).toBeNull()
  })

  it.each([409, 500, 503])("changes no cookies and doesn't redirect on a %i", async (status) => {
    fetchMock.mockResolvedValue(apiReply(status, clearRefreshLine))

    const response = await proxy(request("/settings", { [REFRESH]: "rt-old" }))

    expectUntouched(response)
  })

  it("changes no cookies and doesn't redirect when the API can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))

    const response = await proxy(request("/settings", { [REFRESH]: "rt-old" }))

    expectUntouched(response)
  })

  it("gives up on the refresh after 5 seconds and changes no cookies", async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(async (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))
    }))

    const pending = proxy(request("/settings", { [REFRESH]: "rt-old" }))
    await vi.advanceTimersByTimeAsync(5_000)

    expectUntouched(await pending)
  })

  it("refreshes on a prefetch too", async () => {
    fetchMock.mockResolvedValue(apiReply(200, newAccessLine, newRefreshLine))

    const response = await proxy(request("/settings", { [REFRESH]: "rt-old" }, { "next-router-prefetch": "1" }))

    expect(response.cookies.get(ACCESS)?.value).toBe("at-new")
  })

  it("doesn't refresh while the access cookie is present", async () => {
    await proxy(request("/settings", { [REFRESH]: "rt-old", [ACCESS]: "at-live" }))

    expect(fetchMock).not.toHaveBeenCalled()
  })
})

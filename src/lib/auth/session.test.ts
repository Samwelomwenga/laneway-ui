import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { callProtectedApi, requireSession, verifySession } from "@/lib/auth/session"

vi.hoisted(() => {
  vi.stubEnv("LANEWAY_API_URL", "http://api.test:8080")
})

const incoming = new Headers({ cookie: "__Host-Http-lnw_access=abc" })

vi.mock("next/headers", () => ({
  headers: async () => incoming,
}))

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect ${url}`)
  },
}))

const profile = {
  id: "7b0c",
  username: "sam",
  email: "sam@laneway.test",
  firstName: "Sam",
  lastName: "Otieno",
  profilePictureUrl: null,
}

function apiReply(status: number, data: unknown = null) {
  return Response.json({
    success: status < 400,
    message: "",
    data,
    statusCode: status,
    errors: [],
  }, { status })
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe("verifySession", () => {
  it("returns the profile from GET /api/v1/profile", async () => {
    fetchMock.mockResolvedValue(apiReply(200, profile))

    await expect(verifySession()).resolves.toEqual(profile)
    const [input, init] = fetchMock.mock.lastCall!
    const sent = new Request(input, init)
    expect(sent.url).toBe("http://api.test:8080/api/v1/profile")
    expect(sent.headers.get("cookie")).toBe("__Host-Http-lnw_access=abc")
  })

  it("returns null when the API answers 401", async () => {
    fetchMock.mockResolvedValue(apiReply(401))

    await expect(verifySession()).resolves.toBeNull()
  })

  it.each([500, 503, 409])("throws on a %i so the error edge shows", async (status) => {
    fetchMock.mockResolvedValue(apiReply(status))

    await expect(verifySession()).rejects.toThrow()
  })
})

describe("requireSession", () => {
  it("returns the profile for a signed-in user", async () => {
    fetchMock.mockResolvedValue(apiReply(200, profile))

    await expect(requireSession("/")).resolves.toEqual(profile)
  })

  it("redirects to sign-in with the path as returnTo on a 401", async () => {
    fetchMock.mockResolvedValue(apiReply(401))

    await expect(requireSession("/settings/email?step=2")).rejects.toThrow(
      "redirect /sign-in?returnTo=%2Fsettings%2Femail%3Fstep%3D2",
    )
  })
})

describe("callProtectedApi", () => {
  const notAuthenticated = { ok: false, reason: "notAuthenticated", returnTo: "/settings/email" }

  it("returns the API's reply when the session holds", async () => {
    fetchMock
      .mockResolvedValueOnce(apiReply(200, profile))
      .mockResolvedValueOnce(apiReply(202))

    const reply = await callProtectedApi("/settings/email", "/api/v1/auth/change-email", { method: "POST", body: {} })

    expect(reply).toMatchObject({ status: 202 })
  })

  it("returns notAuthenticated without calling the API when there is no session", async () => {
    fetchMock.mockResolvedValueOnce(apiReply(401))

    await expect(callProtectedApi("/settings/email", "/api/v1/auth/change-email", { method: "POST" })).resolves.toEqual(notAuthenticated)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("returns notAuthenticated when its own call answers 401", async () => {
    fetchMock
      .mockResolvedValueOnce(apiReply(200, profile))
      .mockResolvedValueOnce(apiReply(401))

    await expect(callProtectedApi("/settings/email", "/api/v1/auth/change-email", { method: "POST" })).resolves.toEqual(notAuthenticated)
  })

  it("sends a returnTo that isn't a protected path back to /", async () => {
    fetchMock.mockResolvedValueOnce(apiReply(401))

    await expect(callProtectedApi("https://evil.test/", "/api/v1/auth/change-email", { method: "POST" })).resolves.toMatchObject({ returnTo: "/" })
  })
})

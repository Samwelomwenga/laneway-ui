import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { callApi } from "@/lib/api/client"

vi.hoisted(() => {
  vi.stubEnv("LANEWAY_API_URL", "http://api.test:8080")
})

const envelope = {
  success: true,
  message: "Profile",
  data: { username: "sam" },
  statusCode: 200,
  errors: [],
  traceId: "00-abc-01",
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(envelope))
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

function sentRequest() {
  const [input, init] = fetchMock.mock.lastCall ?? []
  return new Request(input!, init)
}

async function headersSentFor(incoming: Record<string, string>) {
  await callApi("/api/v1/profile", {
    incoming: new Headers(incoming),
  })
  return sentRequest().headers
}

describe("callApi request", () => {
  it("calls LANEWAY_API_URL with the method and a JSON body", async () => {
    await callApi("/api/v1/auth/sign-in", {
      method: "POST",
      body: { email: "sam@laneway.test" },
      incoming: new Headers(),
    })

    const request = sentRequest()
    expect(request.url).toBe("http://api.test:8080/api/v1/auth/sign-in")
    expect(request.method).toBe("POST")
    expect(request.headers.get("content-type")).toBe("application/json")
    expect(await request.json()).toEqual({ email: "sam@laneway.test" })
  })

  it("sends the proto and the CSRF header on every call", async () => {
    const headers = await headersSentFor({})

    expect(headers.get("x-forwarded-proto")).toBe("https")
    expect(headers.get("x-laneway-csrf")).toBe("1")
  })

  it("turns CF-Connecting-IP into X-Forwarded-For", async () => {
    expect((await headersSentFor({ "cf-connecting-ip": "203.0.113.7" })).get("x-forwarded-for")).toBe("203.0.113.7")
  })

  it("sends no X-Forwarded-For without CF-Connecting-IP", async () => {
    expect((await headersSentFor({})).has("x-forwarded-for")).toBe(false)
  })

  it("never passes an incoming X-Forwarded-For through", async () => {
    const headers = await headersSentFor({
      "cf-connecting-ip": "203.0.113.7",
      "x-forwarded-for": "198.51.100.1",
    })

    expect(headers.get("x-forwarded-for")).toBe("203.0.113.7")
  })

  it("never passes Origin or Sec-Fetch-Site through", async () => {
    const headers = await headersSentFor({
      "origin": "https://evil.test",
      "sec-fetch-site": "cross-site",
    })

    expect(headers.has("origin")).toBe(false)
    expect(headers.has("sec-fetch-site")).toBe(false)
  })

  it("passes the browser's User-Agent through so the API can name the session", async () => {
    const agent = "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0"

    expect((await headersSentFor({ "user-agent": agent })).get("user-agent")).toBe(agent)
  })

  it("sends only the two auth cookies", async () => {
    const headers = await headersSentFor({
      cookie: "theme=dark; __Host-Http-lnw_access=eyJ.a.b; __Host-lnw_notice=ended; __Host-Http-lnw_refresh=lnw_rt_x",
    })

    expect(headers.get("cookie")).toBe("__Host-Http-lnw_access=eyJ.a.b; __Host-Http-lnw_refresh=lnw_rt_x")
  })

  it("treats an empty auth cookie as absent", async () => {
    const headers = await headersSentFor({ cookie: "__Host-Http-lnw_access=; __Host-Http-lnw_refresh=lnw_rt_x" })

    expect(headers.get("cookie")).toBe("__Host-Http-lnw_refresh=lnw_rt_x")
  })

  it("sends no Cookie header without auth cookies", async () => {
    expect((await headersSentFor({ cookie: "theme=dark" })).has("cookie")).toBe(false)
  })
})

describe("callApi reply", () => {
  it("parses the envelope", async () => {
    const reply = await callApi("/api/v1/profile", {
      incoming: new Headers(),
    })

    expect(reply.status).toBe(200)
    expect(reply.body).toEqual(envelope)
  })

  it("reads Retry-After on a 429", async () => {
    fetchMock.mockResolvedValue(Response.json(
      {
        ...envelope,
        success: false,
        data: null,
        statusCode: 429,
      },
      {
        status: 429,
        headers: { "retry-after": "600" },
      },
    ))

    expect((await callApi("/api/v1/auth/sign-in", {
      incoming: new Headers(),
    })).retryAfterSeconds).toBe(600)
  })

  it("ignores Retry-After on other statuses", async () => {
    fetchMock.mockResolvedValue(Response.json(envelope, {
      headers: { "retry-after": "600" },
    }))

    expect((await callApi("/api/v1/profile", {
      incoming: new Headers(),
    })).retryAfterSeconds).toBeNull()
  })

  it("returns a 401 as is, without retrying", async () => {
    fetchMock.mockResolvedValue(Response.json({
      ...envelope,
      success: false,
      data: null,
      statusCode: 401,
    }, { status: 401 }))

    const reply = await callApi("/api/v1/profile", {
      incoming: new Headers(),
    })

    expect(reply.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("has no body on a 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    expect((await callApi("/api/v1/auth/sign-out", {
      method: "POST",
      incoming: new Headers(),
    })).body).toBeNull()
  })

  it("keeps the response so the relay can read its Set-Cookie", async () => {
    const response = Response.json(envelope)
    fetchMock.mockResolvedValue(response)

    expect((await callApi("/api/v1/auth/refresh", {
      method: "POST",
      incoming: new Headers(),
    })).response).toBe(response)
  })
})

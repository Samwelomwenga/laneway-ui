import type { ApiError } from "@/lib/auth/error-copy"
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/api/cookie-names"
import { requireEnv } from "@/lib/env"
import "server-only"

const AUTH_COOKIES = new Set([ACCESS_COOKIE, REFRESH_COOKIE])

/** The browser's request headers: `headers()` in a render or server function, `request.headers` in proxy. */
type IncomingHeaders = Pick<Headers, "get">

/** The body laneway-api wraps every JSON reply in. */
type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T | null
  statusCode: number
  errors: ApiError[]
  traceId?: string
}

export type ApiReply<T> = {
  status: number
  body: ApiEnvelope<T> | null
  retryAfterSeconds: number | null
  /** Pass to `relayApiCookies` when the browser needs the API's cookies. */
  response: Response
}

export type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  incoming: IncomingHeaders
  signal?: AbortSignal
}

/** One call to laneway-api, never retried. A 401 comes back as a reply for the caller to handle. */
export async function callApi<T>(path: string, { method = "GET", body, incoming, signal }: ApiRequest): Promise<ApiReply<T>> {
  const headers = outgoingHeaders(incoming)
  if (body !== undefined) {
    headers.set("content-type", "application/json")
  }

  const response = await fetch(new URL(path, requireEnv("LANEWAY_API_URL")), {
    method,
    headers,
    body: body === undefined
      ? undefined
      : JSON.stringify(body),
    signal,
  })

  return {
    status: response.status,
    body: await readEnvelope<T>(response),
    retryAfterSeconds: response.status === 429
      ? readRetryAfter(response)
      : null,
    response,
  }
}

function outgoingHeaders(incoming: IncomingHeaders): Headers {
  const headers = new Headers({
    "accept": "application/json",
    "x-forwarded-proto": "https",
    "x-laneway-csrf": "1",
  })

  const cookie = authCookies(incoming.get("cookie"))
  if (cookie !== "") {
    headers.set("cookie", cookie)
  }
  // Cloudflare's tunnel puts the browser's address in CF-Connecting-IP. An incoming
  // X-Forwarded-For is whatever the browser chose to send, so it never reaches the API.
  const clientIp = incoming.get("cf-connecting-ip") ?? ""
  if (clientIp !== "") {
    headers.set("x-forwarded-for", clientIp)
  }
  // The API names each session after the agent that signed in.
  const userAgent = incoming.get("user-agent") ?? ""
  if (userAgent !== "") {
    headers.set("user-agent", userAgent)
  }
  return headers
}

function authCookies(cookieHeader: string | null): string {
  return (cookieHeader ?? "")
    .split(";")
    .map(pair => pair.trim())
    .filter((pair) => {
      const [name, value] = pair.split("=", 2)
      return AUTH_COOKIES.has(name ?? "") && Boolean(value)
    })
    .join("; ")
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  if (!response.headers.get("content-type")?.includes("json")) {
    return null
  }
  return await response.json() as ApiEnvelope<T>
}

function readRetryAfter(response: Response): number | null {
  const seconds = Number(response.headers.get("retry-after"))
  return Number.isInteger(seconds) && seconds >= 0
    ? seconds
    : null
}

import type { NextRequest } from "next/server"
import type { ApiReply } from "@/lib/api/client"
import { RequestCookies, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies"
import { NextResponse } from "next/server"
import { callApi } from "@/lib/api/client"
import { ACCESS_COOKIE, API_COOKIE_PREFIX, REFRESH_COOKIE } from "@/lib/api/cookie-names"
import { relayApiCookies } from "@/lib/api/relay"
import { isPublicPath } from "@/lib/auth/public-paths"
import { refreshOnce } from "@/lib/auth/refresh-lock"

const REFRESH_TIMEOUT_MS = 5_000

const SIGN_IN_PATH = "/sign-in"

const SESSION_ENDED = "ended"

const NOTICE_MAX_AGE_SECONDS = 120

const ENDED_NOTICE_COOKIE = {
  name: "__Host-lnw_notice",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
} as const

const NOTICE_HEADER = "x-lnw-notice"

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value ?? ""
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value ?? ""
  const renderHeaders = new Headers(request.headers)
  const setCookies = new ResponseCookies(new Headers())

  if (refreshToken !== "" && accessToken === "") {
    const reply = await refreshOnce(refreshToken, async () => tryRefresh(request.headers))
    if (reply?.status === 200 || reply?.status === 401) {
      relayApiCookies(reply.response, setCookies)
    }
    if (reply?.status === 200) {
      rewriteRenderCookies(renderHeaders, setCookies)
    }
    else if (reply?.status === 401) {
      setCookies.set({ ...ENDED_NOTICE_COOKIE, value: SESSION_ENDED, maxAge: NOTICE_MAX_AGE_SECONDS })
    }
  }

  handOffEndedNotice(request, renderHeaders, setCookies)

  const handlesOwnAuthFailure = request.method === "POST" && request.headers.has("next-action")
  if (refreshToken === "" && !handlesOwnAuthFailure && !isPublicPath(pathname)) {
    const signIn = new URL(SIGN_IN_PATH, request.url)
    signIn.searchParams.set("returnTo", pathname + search)
    return NextResponse.redirect(signIn)
  }

  const response = NextResponse.next({
    request: { headers: renderHeaders },
  })
  for (const cookie of setCookies.getAll()) {
    response.cookies.set(cookie)
  }
  return response
}

async function tryRefresh(incoming: Headers): Promise<ApiReply<unknown> | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS)
  try {
    return await callApi("/api/v1/auth/refresh", { method: "POST", incoming, signal: controller.signal })
  }
  catch {
    return null
  }
  finally {
    clearTimeout(timer)
  }
}

function handOffEndedNotice(request: NextRequest, renderHeaders: Headers, setCookies: ResponseCookies): void {
  renderHeaders.delete(NOTICE_HEADER)
  const ended = request.cookies.has(ENDED_NOTICE_COOKIE.name) || setCookies.has(ENDED_NOTICE_COOKIE.name)
  if (request.nextUrl.pathname === SIGN_IN_PATH && ended) {
    setCookies.delete(ENDED_NOTICE_COOKIE)
    renderHeaders.set(NOTICE_HEADER, SESSION_ENDED)
  }
}

/**
 * Next merges proxy's `Set-Cookie` into `cookies()` but not into `headers()`, and `callApi` forwards
 * the raw `cookie` header from `headers()`. Without this the render's API call has no access cookie.
 */
function rewriteRenderCookies(renderHeaders: Headers, relayed: ResponseCookies): void {
  const renderCookies = new RequestCookies(renderHeaders)
  for (const { name, value } of relayed.getAll()) {
    if (!name.startsWith(API_COOKIE_PREFIX)) {
      continue
    }
    if (value === "") {
      renderCookies.delete(name)
    }
    else {
      renderCookies.set(name, value)
    }
  }
}

export const config = {
  // A path with a dot counts as a static file, so no page path may contain one.
  matcher: ["/((?!_next/|api/health$|.*\\.[^/]+$).*)"],
}

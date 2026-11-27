import type { ResponseCookie, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies"
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { API_COOKIE_PREFIX } from "@/lib/api/cookie-names"
import "server-only"

/** `cookies()` in a server function or route handler, or `NextResponse.cookies` in proxy. */
export type CookieTarget = Pick<ResponseCookies, "set" | "delete">

/**
 * Copies laneway-api's auth cookies onto the browser response. Throws before writing anything if a
 * cookie breaks the `__Host-` rules, since the browser would drop it and the session would vanish.
 */
export function relayApiCookies(response: Response, target: CookieTarget): void {
  const cookies = response.headers
    .getSetCookie()
    .map(parseSetCookie)
    .filter((cookie): cookie is ResponseCookie => cookie?.name.startsWith(API_COOKIE_PREFIX) ?? false)

  for (const cookie of cookies) {
    assertHostCookie(cookie)
  }

  for (const { value, maxAge, expires: _, ...attributes } of cookies) {
    if (!value || maxAge === 0) {
      target.delete(attributes)
    }
    else {
      target.set({ ...attributes, value, maxAge })
    }
  }
}

function assertHostCookie(cookie: ResponseCookie): void {
  if (cookie.domain !== undefined) {
    throw new Error(`laneway-api set ${cookie.name} with a Domain.`)
  }
  if (cookie.path !== "/") {
    throw new Error(`laneway-api set ${cookie.name} with a path other than /.`)
  }
  if (!cookie.secure) {
    throw new Error(`laneway-api set ${cookie.name} without Secure.`)
  }
}

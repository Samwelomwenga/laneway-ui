import { NextResponse } from "next/server"
import { describe, expect, it } from "vitest"
import { relayApiCookies } from "@/lib/api/relay"

const REFRESH = "__Host-Http-lnw_refresh"
const ACCESS = "__Host-Http-lnw_access"
const refreshValue = "lnw_rt_4mPq7Zr2Wb9Xk1Ls8Dv3Nf6Hj0Gt5Yc2Ue7Ia4Ro9Ep"

// What laneway-api's `RefreshCookie.Write` sends today, through ASP.NET Core's `Cookies.Append`.
const refreshLine = `${REFRESH}=${refreshValue}; max-age=604800; path=/; secure; samesite=strict; httponly`

function apiResponse(...setCookies: string[]) {
  const headers = new Headers()
  for (const line of setCookies) {
    headers.append("set-cookie", line)
  }
  return new Response(null, { headers })
}

function relayed(...setCookies: string[]) {
  const target = NextResponse.next()
  relayApiCookies(apiResponse(...setCookies), target.cookies)
  return target
}

describe("relayApiCookies", () => {
  it("copies an API cookie with its name, value, Max-Age, and flags", () => {
    expect(relayed(refreshLine).cookies.get(REFRESH)).toMatchObject({
      name: REFRESH,
      value: refreshValue,
      maxAge: 604800,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    })
  })

  it("copies both auth cookies", () => {
    const target = relayed(refreshLine, `${ACCESS}=eyJ.a.b; max-age=840; path=/; secure; samesite=lax; httponly`)

    expect(target.cookies.getAll().map(cookie => cookie.name)).toEqual([REFRESH, ACCESS])
  })

  it("drops a cookie with a foreign name", () => {
    expect(relayed("tracker=1; path=/; secure", refreshLine).cookies.getAll().map(cookie => cookie.name)).toEqual([REFRESH])
  })

  it.each([
    ["a Domain", `${REFRESH}=x; max-age=60; domain=laneway.app; path=/; secure; httponly`],
    ["a path other than /", `${REFRESH}=x; max-age=60; path=/api; secure; httponly`],
    ["no path", `${REFRESH}=x; max-age=60; secure; httponly`],
    ["no Secure", `${REFRESH}=x; max-age=60; path=/; httponly`],
  ])("throws on %s and writes nothing", (_, line) => {
    const target = NextResponse.next()

    expect(() => relayApiCookies(apiResponse(refreshLine, line), target.cookies)).toThrow()
    expect(target.headers.getSetCookie()).toEqual([])
  })

  it.each([
    ["Max-Age=0", `${REFRESH}=; max-age=0; path=/; secure; samesite=lax; httponly`],
    ["an empty value", `${REFRESH}=; max-age=604800; path=/; secure; samesite=lax; httponly`],
  ])("turns %s into a delete the browser accepts for a __Host- cookie", (_, line) => {
    const [setCookie] = relayed(line).headers.getSetCookie()

    expect(setCookie).toMatch(new RegExp(`^${REFRESH}=;`))
    expect(setCookie).toContain("Path=/")
    expect(setCookie).toContain("Secure")
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT")
  })
})

import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
const devCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"

const securityHeaders = {
  "content-security-policy": csp,
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "strict-transport-security": "max-age=63072000; includeSubDomains",
  "cross-origin-opener-policy": "same-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
}

async function headersFor(path: string) {
  const { default: nextConfig } = await import("./next.config")
  const response = await unstable_getResponseFromNextConfig({
    url: `https://laneway.test${path}`,
    nextConfig,
  })
  return Object.fromEntries(response.headers)
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("security headers", () => {
  it.each(["/", "/sign-in", "/settings/sessions"])("sends every header on %s", async (path) => {
    vi.stubEnv("NODE_ENV", "production")

    expect(await headersFor(path)).toMatchObject(securityHeaders)
  })

  it("keeps unsafe-eval out of production", async () => {
    vi.stubEnv("NODE_ENV", "production")

    expect((await headersFor("/"))["content-security-policy"]).not.toContain("'unsafe-eval'")
  })

  it("allows unsafe-eval in development for React's dev tooling", async () => {
    vi.stubEnv("NODE_ENV", "development")

    expect((await headersFor("/"))["content-security-policy"]).toBe(devCsp)
  })
})

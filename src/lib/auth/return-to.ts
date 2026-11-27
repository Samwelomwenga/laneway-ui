import { isPublicPath } from "@/lib/auth/public-paths"

const ORIGIN = "https://laneway.invalid"

export function safeReturnTo(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/"
  }
  const url = new URL(value, ORIGIN)
  if (url.origin !== ORIGIN || isPublicPath(url.pathname)) {
    return "/"
  }
  return value
}

export function signInHref(returnTo: string): string {
  return `/sign-in?returnTo=${encodeURIComponent(returnTo)}`
}

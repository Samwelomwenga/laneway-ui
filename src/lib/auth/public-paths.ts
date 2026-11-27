import { requireEnv } from "@/lib/env"

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/check-your-email",
  "/verify-email",
  "/reset-password",
  "/confirm-email-change",
  "/undo-email-change",
  "/signed-out",
  "/left",
  "/data/username-available",
])

const DEV_ONLY_SECTIONS = ["/specimen", "/prototype"]

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || (isDevelopment() && inDevOnlySection(pathname))
}

function isDevelopment(): boolean {
  return requireEnv("NODE_ENV") === "development"
}

function inDevOnlySection(pathname: string): boolean {
  return DEV_ONLY_SECTIONS.some(section => pathname === section || pathname.startsWith(`${section}/`))
}

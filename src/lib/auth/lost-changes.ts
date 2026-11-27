import type { NotAuthenticated } from "@/lib/auth/not-authenticated"
import { useRouter } from "next/navigation"
import { signInHref } from "@/lib/auth/return-to"

const STORAGE_KEY = "lnw:lost-changes"

const MAX_AGE_MS = 10 * 60_000

type LostChange = { description: string, at: number }

type Router = { replace: (href: string) => void }

/** Saves what didn't save, for the sign-in notice to list, then sends the tab to sign-in. */
export function recordLostChanges(descriptions: readonly string[], returnTo: string, router: Router): void {
  const at = Date.now()
  const entries = [
    ...storedEntries(),
    ...descriptions.map(description => ({ description, at })),
  ]
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  router.replace(signInHref(returnTo))
}

/**
 * For a write whose server function returned `notAuthenticated`. Undo the optimistic change first,
 * then pass a plain description like `Add "Check the sign-in copy" to Review`.
 */
export function useRecordLostChange(): (result: NotAuthenticated, description: string) => void {
  const router = useRouter()
  return (result, description) => recordLostChanges([description], result.returnTo, router)
}

export function takeLostChanges(): string[] {
  const entries = storedEntries()
  sessionStorage.removeItem(STORAGE_KEY)
  const oldest = Date.now() - MAX_AGE_MS
  return entries.filter(entry => entry.at >= oldest).map(entry => entry.description)
}

function storedEntries(): LostChange[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(parsed)
      ? parsed.filter(isLostChange)
      : []
  }
  catch {
    return []
  }
}

function isLostChange(value: unknown): value is LostChange {
  return typeof value === "object"
    && value !== null
    && typeof (value as LostChange).description === "string"
    && typeof (value as LostChange).at === "number"
}

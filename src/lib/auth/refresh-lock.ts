import { createHash } from "node:crypto"
import "server-only"

/** laneway-api's `RefreshToken.GraceWindow`: the old refresh cookie still works this long after a rotation. */
const KEEP_SETTLED_MS = 10_000

const pending = new Map<string, Promise<unknown>>()

/**
 * Runs one refresh per refresh cookie. A request that arrives while the call is in flight, or within
 * `KEEP_SETTLED_MS` after it settles, gets the same reply, so the API sees one rotation and every
 * tab receives the same new cookies.
 */
export async function refreshOnce<T>(refreshToken: string, run: () => Promise<T>): Promise<T> {
  const tokenHash = createHash("sha256").update(refreshToken).digest("hex")
  const existing = pending.get(tokenHash)
  if (existing !== undefined) {
    return existing as Promise<T>
  }

  const reply = run()
  pending.set(tokenHash, reply)
  void reply.finally(() => {
    setTimeout(() => {
      if (pending.get(tokenHash) === reply) {
        pending.delete(tokenHash)
      }
    }, KEEP_SETTLED_MS).unref()
  }).catch(() => {})
  return reply
}

export function resetRefreshLock(): void {
  pending.clear()
}

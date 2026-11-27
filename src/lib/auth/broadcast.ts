const CHANNEL_NAME = "lnw:auth"

const KICKED_KEY = "lnw:kicked"

type SignOutReason = "signed-out" | "ended"

type AuthMessage
  = | { type: "signed-out", reason: SignOutReason }
    | { type: "signed-in" }

/**
 * Sent after the server function succeeds and before the redirect, so other tabs follow this one.
 */
export function postAuthMessage(message: AuthMessage): void {
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.postMessage(message)
  channel.close()
}

export function subscribeToAuthMessages(onMessage: (message: AuthMessage) => void): () => void {
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (isAuthMessage(event.data)) {
      onMessage(event.data)
    }
  })
  return () => channel.close()
}

/** The sign-in page reads this to show a notice in a tab another tab signed out. */
export function rememberKick(reason: SignOutReason): void {
  sessionStorage.setItem(KICKED_KEY, reason)
}

function isAuthMessage(data: unknown): data is AuthMessage {
  if (typeof data !== "object" || data === null) {
    return false
  }
  const { type, reason } = data as { type?: unknown, reason?: unknown }
  return type === "signed-in" || (type === "signed-out" && (reason === "signed-out" || reason === "ended"))
}

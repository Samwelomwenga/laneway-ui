const KICKED_KEY = "lnw:kicked"

const SIGN_OUT_REASONS = ["signed-out", "ended"] as const

type SignOutReason = typeof SIGN_OUT_REASONS[number]

type AuthMessage
  = | { type: "signed-out", reason: SignOutReason }
    | { type: "signed-in" }

let tabChannel: BroadcastChannel | undefined

/** A channel never hears its own posts, so one per tab keeps a tab that signs out from kicking itself. */
function authChannel(): BroadcastChannel {
  tabChannel ??= new BroadcastChannel("lnw:auth")
  return tabChannel
}

/**
 * Sent after the server function succeeds and before the redirect, so other tabs follow this one.
 */
export function postAuthMessage(message: AuthMessage): void {
  authChannel().postMessage(message)
}

export function subscribeToAuthMessages(onMessage: (message: AuthMessage) => void): () => void {
  const listener = (event: MessageEvent<unknown>) => {
    if (isAuthMessage(event.data)) {
      onMessage(event.data)
    }
  }
  authChannel().addEventListener("message", listener)
  return () => authChannel().removeEventListener("message", listener)
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
  return type === "signed-in" || (type === "signed-out" && SIGN_OUT_REASONS.includes(reason as SignOutReason))
}

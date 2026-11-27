/** What a protected server function returns when the session is gone. It never redirects. */
export type NotAuthenticated = {
  ok: false
  reason: "notAuthenticated"
  /** The page the write ran from, already run through `safeReturnTo`. */
  returnTo: string
}

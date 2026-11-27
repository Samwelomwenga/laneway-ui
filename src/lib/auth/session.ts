import type { ApiReply, ApiRequest } from "@/lib/api/client"
import type { NotAuthenticated } from "@/lib/auth/not-authenticated"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { callApi } from "@/lib/api/client"
import { safeReturnTo, signInHref } from "@/lib/auth/return-to"
import "server-only"

export type Profile = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  profilePictureUrl: string | null
}

export const verifySession = cache(async (): Promise<Profile | null> => {
  const reply = await callApi<Profile>("/api/v1/profile", { incoming: await headers() })
  if (reply.status === 401) {
    return null
  }
  if (reply.status !== 200 || !reply.body?.data) {
    throw new Error(`GET /api/v1/profile answered ${reply.status}`)
  }
  return reply.body.data
})

/** Every protected page calls this. `path` is the page's path and query, sent back after sign-in. */
export async function requireSession(path: string): Promise<Profile> {
  const profile = await verifySession()
  if (profile === null) {
    redirect(signInHref(path))
  }
  return profile
}

/** The one way a protected server function calls the API. `returnTo` is the page the write ran from. */
export async function callProtectedApi<T>(
  returnTo: string,
  path: string,
  request: Omit<ApiRequest, "incoming">,
): Promise<ApiReply<T> | NotAuthenticated> {
  const notAuthenticated: NotAuthenticated = {
    ok: false,
    reason: "notAuthenticated",
    returnTo: safeReturnTo(returnTo),
  }
  if (await verifySession() === null) {
    return notAuthenticated
  }
  const reply = await callApi<T>(path, { ...request, incoming: await headers() })
  return reply.status === 401
    ? notAuthenticated
    : reply
}

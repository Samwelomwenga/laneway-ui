"use client"

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { rememberKick, subscribeToAuthMessages } from "@/lib/auth/broadcast"
import { recordLostChanges } from "@/lib/auth/lost-changes"
import { signInHref } from "@/lib/auth/return-to"
import { unsavedNames } from "@/lib/auth/unsaved"
import { DataReadError } from "@/lib/data/read-data"

function currentPath(): string {
  return location.pathname + location.search
}

export function ProtectedProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof DataReadError && error.status === 401) {
          router.replace(signInHref(currentPath()))
        }
      },
    }),
  }))

  useEffect(() => subscribeToAuthMessages((message) => {
    if (message.type === "signed-in") {
      location.reload()
      return
    }
    rememberKick(message.reason)
    recordLostChanges(unsavedNames(), currentPath(), router)
  }), [router])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

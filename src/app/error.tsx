"use client"

import { useSyncExternalStore } from "react"
import { ErrorScreen, OfflineScreen } from "@/components/edge-screen"

function subscribeToGoingOffline(onChange: () => void) {
  addEventListener("offline", onChange)
  return () => removeEventListener("offline", onChange)
}

export default function RouteError({ retry }: Readonly<{ error: unknown, retry: () => void }>) {
  const offline = useSyncExternalStore(subscribeToGoingOffline, () => !navigator.onLine, () => false)
  return offline
    ? <OfflineScreen onRetry={retry} />
    : <ErrorScreen onRetry={retry} />
}

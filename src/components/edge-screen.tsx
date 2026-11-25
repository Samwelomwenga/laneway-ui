"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Mascot } from "@/components/mascot"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type EdgeScreenProps = Readonly<{
  expression: "puzzled" | "apologetic" | "waiting"
  title: string
  description: string
  action: React.ReactNode
}>

function EdgeScreen({ expression, title, description, action }: EdgeScreenProps) {
  return (
    <main className="@container flex min-h-svh flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Mascot expression={expression} size="hero" />
          </EmptyMedia>
          <EmptyTitle level={1}>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>{action}</EmptyContent>
      </Empty>
    </main>
  )
}

export function NotFoundScreen() {
  return (
    <EdgeScreen
      expression="puzzled"
      title="We can't find that page"
      description="The link may be wrong, or you may not have access to it. If someone sent it to you, ask them to check it."
      action={<Button nativeButton={false} render={<Link href="/" />}>Go to your boards</Button>}
    />
  )
}

export function ErrorScreen({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <EdgeScreen
      expression="apologetic"
      title="Something went wrong"
      description="This page didn't load. Try again, and if it still won't load, come back in a little while."
      action={<Button onClick={onRetry}>Try again</Button>}
    />
  )
}

export function OfflineScreen({ onRetry }: Readonly<{ onRetry: () => void }>) {
  useEffect(() => {
    addEventListener("online", onRetry)
    return () => removeEventListener("online", onRetry)
  }, [onRetry])

  return (
    <EdgeScreen
      expression="waiting"
      title="You're offline"
      description="This page needs a connection to load. It will load on its own once you're back online."
      action={<Button onClick={onRetry}>Try again</Button>}
    />
  )
}

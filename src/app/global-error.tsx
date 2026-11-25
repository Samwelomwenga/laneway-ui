"use client"

import { instrumentSans } from "@/app/fonts"
import { ErrorScreen } from "@/components/edge-screen"
import { ThemeProvider } from "@/components/theme-provider"
import "@/app/globals.css"

export default function GlobalError({ retry }: Readonly<{ error: unknown, retry: () => void }>) {
  return (
    <html lang="en" className={instrumentSans.variable} suppressHydrationWarning>
      <body>
        <title>Something went wrong · Laneway</title>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorScreen onRetry={retry} />
        </ThemeProvider>
      </body>
    </html>
  )
}

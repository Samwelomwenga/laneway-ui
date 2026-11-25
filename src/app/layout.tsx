import type { Metadata } from "next"
import { instrumentSans } from "@/app/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Laneway",
  description: "The web client for Laneway.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster>{children}</Toaster>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

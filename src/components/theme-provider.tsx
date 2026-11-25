"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider(props: Readonly<React.ComponentProps<typeof NextThemesProvider>>) {
  return <NextThemesProvider {...props} />
}

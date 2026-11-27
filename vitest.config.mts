import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Next swaps `server-only` for its own copy at build time, so the npm package isn't installed.
    alias: { "server-only": "next/dist/compiled/server-only/empty.js" },
  },
  test: {
    exclude: [
      ...configDefaults.exclude,
      ".agents/**",
      ".claude/**",
      ".scratch/**",
    ],
  },
})

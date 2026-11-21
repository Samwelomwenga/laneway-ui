import type { NextConfig } from "next"
import { withCn } from "cn/next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default withCn(nextConfig, {
  css: "src/app/globals.css",
  full: true,
  out: "src/lib/cn-tables.ts",
})

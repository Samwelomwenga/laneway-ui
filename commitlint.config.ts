import type { UserConfig } from "@commitlint/types"

// A fallback. Dependabot copies the repo's lowercase style, so it only sends this capitalized title if that ever stops.
const isDependabotDefaultBumpTitle = (commit: string) => /^(?:chore|ci)\(deps(?:-dev)?\): Bump /.test(commit)

export default {
  extends: ["@commitlint/config-conventional"],
  ignores: [isDependabotDefaultBumpTitle],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
  },
} satisfies UserConfig

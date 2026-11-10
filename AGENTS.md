<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code comments

Keep comments lean. A comment carries the why, and never a ticket id. Vendored skills under `.agents/skills/` and `.claude/skills/` are exempt from comment review and never edited here. See `docs/agents/code-comments.md`.

## Commits

Every commit follows Conventional Commits, and the `commit-msg` hook rejects one that doesn't. See `docs/agents/commit-conventions.md`.

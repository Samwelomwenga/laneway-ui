<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues and specs live as local markdown in `.scratch/`, which stays uncommitted. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage state sits on an issue's `Status:` line as one of `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, or `wontfix`.

### Domain docs

Single-context. laneway-api's glossary owns domain terms, and this repo's `GLOSSARY.md` holds UI terms only. See `docs/agents/domain.md`.

### Vendored skills

Skills live in `.agents/skills/`, pinned by `skills-lock.json`, and `.claude/skills/` symlinks into it. Two agent files live in `.claude/agents/`. Nobody edits any of it. See `docs/agents/skills.md`.

## Code comments

Keep comments lean. A comment carries the why, and never a ticket id. Vendored skills under `.agents/skills/` and `.claude/skills/` are exempt from comment review and never edited here. See `docs/agents/code-comments.md`.

## Commits

Every commit follows Conventional Commits, and the `commit-msg` hook rejects one that doesn't. See `docs/agents/commit-conventions.md`.

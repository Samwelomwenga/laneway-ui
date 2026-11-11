# Agent skills

laneway-ui vendors its agent skills so every clone, Claude Code and Codex alike, gets the same pinned copies. The same skills may also be installed globally on your machine. The repo copies win for work in this repo.

## Where they live

- `.agents/skills/<name>/` holds each skill. Codex reads this folder on its own.
- `.claude/skills/<name>` is a symlink into it, for Claude Code.
- `skills-lock.json` records each skill's source, path, ref, and hash.
- `.claude/agents/` holds two agent files that pstack skills need. They are copied by hand, so they aren't in the lock. Their provenance is in the table below.

All of it is third-party source. Don't edit it, don't review it as ours, and don't lint it. ESLint, knip, and lint-staged ignore `.agents/`, `.claude/`, and `skills-lock.json`. The editor formats nothing on save.

## Sources and pins

| Source                     | Subpath                                     | Pin                                                             |
| -------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `mattpocock/skills`        | `skills/engineering`, `skills/productivity` | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`                      |
| `cursor/plugins`           | `pstack/skills`, `cursor-team-kit/skills`   | `5866df557357d005b3c0c9d3da0d9e739b4bdde3`                      |
| `vercel/next.js`           | `skills`                                    | `0eda7207b868b6aef91322516ad3e5a54822be6f`                      |
| `vercel-labs/agent-skills` | `skills`                                    | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`                      |
| `pbakaus/impeccable`       | `.agents/skills`                            | `035c8f319edd019936525a062fe99e83ca8d12c6` (tag `skill-v4.8.2`) |

`skills-lock.json` lists every skill. Install from the subpath, never from the repo root. `cursor/plugins` also ships a generated copy of each pstack skill under `harness/`, and `pbakaus/impeccable` ships impeccable in 25 folders.

## Agent file provenance

| File                              | Upstream                                        | Commit    | sha256                                                             |
| --------------------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------ |
| `.claude/agents/comment-sicko.md` | `cursor/plugins/pstack/agents/comment-sicko.md` | `5866df5` | `3e239e40b7b4b9beb2cf7f3ccc57f2388eb8b69bd1ba8ae888ef87ef6e0e2116` |
| `.claude/agents/poteto-agent.md`  | `cursor/plugins/pstack/agents/poteto-agent.md`  | `5866df5` | `979f18abd000d185a0b4c41a2a4111c0910596a7f5c81cbb571885bc721b2bf7` |

`no-comments` spawns Comment Sicko, and `poteto-mode` spawns the poteto agent.

## The CLI

Run it as `pnpm dlx skills@1.7.6`. It is not a devDependency, because no script calls it and knip would flag it.

```sh
pnpm dlx skills@1.7.6 add <owner>/<repo>/<subpath>#<full sha> -a claude-code codex -y --skill <name> ...
```

`--skill` takes the frontmatter `name`. It equals the folder name, except that vercel-labs names its skills `vercel-react-best-practices` and `vercel-composition-patterns`.

`pnpm dlx skills@1.7.6 check` tells you whether upstream has moved. It is a manual check, never a gate.

## Bumping a pin

Nothing updates on a schedule. To bump a source:

1. Read upstream's diff between the old pin and the new one.
2. Re-run the `add` command for that source at the new sha, with the same `--skill` list.
3. For a `cursor/plugins` bump, re-copy both agent files at the new sha and update the provenance table.
4. Commit it on its own as `build(skills): bump <source> to <short sha>`. The body says what changed upstream.

A `next-devtools-mcp` version bump in `.mcp.json` is the same kind of commit.

Nothing checks the hashes automatically. The vendored files are committed, so diff review is the check. When the repo gets CI, it can add one if `skills` has a stable integrity command by then.

## Setup you do by hand

- Install `agent-browser` 0.31.1 or later. `next-dev-loop` drives the browser with it.
- Trust the folder in Claude Code. Until you do, it ignores the project's MCP approval and allow rules in `.claude/settings.json`.
- impeccable's `hooks on` writes to your own `.claude/settings.local.json`, which git ignores. It never goes in the shared file.

## Rules

- mattpocock's `tdd` and `teach` own those names. `implement` and `implement-spec` call `/tdd` and expect his version. pstack's versions are not vendored.
- `pr` sets the sections of a PR body. `technical-writing` and `unslop` set the prose.
- `no-comments` owns comments. `deslop` handles defensive checks, casts, and nesting, and leaves comments alone.
- `poteto-mode` calls `control-cli`, which is not vendored, since laneway-ui has no CLI or TUI. It skips that step.
- A verify skill made by `create-verification-skill` goes in `.agents/skills/verify-laneway-ui/` with a `.claude/skills/` symlink, not in `.cursor/skills/`. It is our code. It stays out of `skills-lock.json` and gets comment review.

## Lands with the library

Library skills arrive in the PR that installs their library, not before. That PR adds its row's items and moves the row into "Sources and pins".

| Library                       | That PR adds                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui                     | The `shadcn` skill from `shadcn-ui/ui` at subpath `skills`, pinned to a commit. `"shadcn": { "command": "npx", "args": ["-y", "shadcn@<x.y.z>", "mcp"] }` in `.mcp.json` at an exact version, and `shadcn` in `enabledMcpjsonServers` in `.claude/settings.json`. It goes in the PR that runs `shadcn init`, since the skill reads `components.json`. |
| TanStack Table                | Its skill from `TanStack/table` at the release tag that matches the installed version, such as `v9.3.1`. Each package bump moves the tag by hand. No TanStack Intent.                                                                                                                                                                                 |
| TanStack Query, TanStack Form | Nothing today. Check for a stable skill when the library is installed.                                                                                                                                                                                                                                                                                |
| react-hook-form               | `docs/agents/react.md` with the rule "Read form values with `useWatch` or `subscribe`, never render `watch()` or `getValues()`. React Compiler caches them and renders stale values.", plus a "React" subsection in `AGENTS.md` that points at it. Revisit when react-hook-form v8 is stable.                                                         |

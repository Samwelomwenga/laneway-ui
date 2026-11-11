# Skills and MCP servers for TanStack, forms, schemas, and nuqs

Research for wayfinder ticket 03. Checked on 2026-11-11 against npm, GitHub, and each library's own docs.

## Short answer

TanStack ships official agent skills, but not for the two packages we need most. Table and DB put skills inside their npm packages. Query has none. Form has skills only on its 2.0 alpha. No maintainer of react-hook-form, zod, or nuqs ships a consumer skill. All three publish an `llms.txt`. The only official MCP server in this layer is TanStack's hosted docs server, and it now needs an API key. I would vendor nothing from TanStack for Query or Form yet. I would add a drag and drop library and an OpenAPI client generator, and Orval ships an official skill for the second.

## TanStack

### How TanStack ships skills: TanStack Intent

TanStack Intent (`@tanstack/intent`) is a CLI that finds skills inside packages in `node_modules` and loads the one that matches the installed version. Source: https://tanstack.com/intent/latest/docs/overview

- Maintainer: TanStack. Repo: https://github.com/TanStack/intent
- Latest version: 0.5.6. Source: https://www.npmjs.com/package/@tanstack/intent
- A package opts in with the `tanstack-intent` npm keyword and a `skills/` folder. Source: https://tanstack.com/intent/latest/docs/overview
- Install: `npm i -D @tanstack/intent`, then `npx @tanstack/intent@latest install`. Source: https://tanstack.com/intent/latest/docs/getting-started/quick-start-consumers.md
- `install` writes an allowlist to `package.json#intent.skills` and a managed `intent-skills` block into `AGENTS.md`. That block tells the agent to run `intent list` and `intent load`. Source: same page.
- `npx @tanstack/intent@latest hooks install` adds project hooks for Claude Code and Codex. The hooks block edits until the agent runs `intent load`. Source: same page.
- The registry of packages that ship skills is at https://tanstack.com/intent/registry

This model clashes with our map. Intent keeps skills in `node_modules` and never copies them into `.agents/skills/`. They update whenever the package updates, so `skills-lock.json` can't pin them. We either let Intent own TanStack skills, or copy the files out of the tarball by hand and lose the version tracking. I lean toward copying them, because a skill that changes on `pnpm update` without review is the thing the lock exists to stop.

### Per library

I unpacked each tarball from npm and listed its `skills/` files.

| Package | Latest | Ships skills? | Skills |
|---|---|---|---|
| `@tanstack/react-query` | 5.107.1 | No | none |
| `@tanstack/query-core` | 5.107.1 | No | none |
| `@tanstack/react-form` | 1.33.5 | No | none on `latest` |
| `@tanstack/react-form@alpha` | 2.0.0-alpha.3 | Yes | 8 |
| `@tanstack/react-table` | 9.3.1 | Yes | `getting-started`, `table-state`, `migrate-v8-to-v9` |
| `@tanstack/table-core` | 9.3.1 | Yes | `core`, `table-features`, `table-state`, `custom-features`, `migrate-v8-to-v9` |
| `@tanstack/db` | 1.0.0-rc.1.5 | Yes | `db-core` (with `live-queries`, `mutations-optimistic`, `collection-setup`, `persistence`, `custom-adapter`), `meta-framework` |
| `@tanstack/react-db` | 1.0.0-rc.1.5 | Yes | `react-db` |
| `@tanstack/react-virtual` | 3.14.26 | No | none |
| `@tanstack/react-pacer` | 0.24.1 | No | none |

Versions and keywords come from npm: https://www.npmjs.com/package/@tanstack/react-query, https://www.npmjs.com/package/@tanstack/react-form, https://www.npmjs.com/package/@tanstack/react-table, https://www.npmjs.com/package/@tanstack/db. Skill sources on GitHub: https://github.com/TanStack/table/tree/main/packages/react-table/skills, https://github.com/TanStack/table/tree/main/packages/table-core/skills, https://github.com/TanStack/db/tree/main/packages/db/skills.

Query. A PR added 29 Intent skills in a new `@tanstack/query-intent` package. It was closed unmerged on 2026-08-17. Source: https://github.com/TanStack/query/pull/10879. The `AGENTS.md` in the Query repo is for contributors, not for apps that use Query. Source: https://github.com/TanStack/query/blob/main/AGENTS.md

Form. The skills live on the `alpha` branch and target Form v2. They include `query-backed-forms` and `schema-driven-forms`. Source: https://github.com/TanStack/form/tree/alpha/packages/react-form/skills. They were added in https://github.com/TanStack/form/pull/2328. Their front matter says `library_version: '0.0.0'`, so they are not tied to a release yet.

Table. These are the most complete TanStack skills, but they target Table v9. A kanban board doesn't need a table. They only matter if we add a list or table view of cards.

DB. TanStack DB does optimistic mutations over a client store, and that fits card moves. It is still a release candidate. TanStack Query's own optimistic updates cover moves without a new dependency.

### TanStack MCP server

The MCP server in `@tanstack/cli` is gone. `tanstack mcp` was removed and "will not be restored". Its tools moved to CLI commands such as `tanstack search-docs "loaders" --library router --json`. Source: https://github.com/TanStack/cli/blob/main/docs/mcp-migration.md

TanStack still hosts a docs MCP endpoint at `https://tanstack.com/api/mcp`. Its old docs pages at https://tanstack.com/mcp/latest/docs now return 404. An unauthenticated `initialize` call returns JSON-RPC error -32001, "Authentication required. Get an API key at https://tanstack.com/account/api-keys". TanStack's eval script says an API key is "required for production". Source: https://github.com/TanStack/tanstack.com/blob/main/scripts/mcp-eval/README.md

It's official but it needs a per-user key. That doesn't suit a committed `.mcp.json`. The plain-text index at https://tanstack.com/llms.txt routes agents to a per-library `llms.txt` with no key.

## react-hook-form

- No official skill. A code search of the `react-hook-form` GitHub org finds no `SKILL.md`. Source: https://github.com/react-hook-form
- Official agent docs: https://react-hook-form.com/llms.txt and https://react-hook-form.com/llms-full.txt. Both describe v7 and say v8 is in beta.
- Versions: `latest` is 7.92.0 and `beta` is 8.0.0-beta.0. Source: https://www.npmjs.com/package/react-hook-form
- Schema adapter: `@hookform/resolvers` 7.0.5 takes `zod ^3.25.0 || ^4.0.0` and `react-hook-form ^7.55.0`. It also has a Standard Schema resolver. Source: https://www.npmjs.com/package/@hookform/resolvers and https://react-hook-form.com/llms-full.txt

React Compiler matters here, because this repo enables it with `babel-plugin-react-compiler`. RHF's docs say `watch` and `getValues` keep the same reference across renders, so the compiler can cache them and render stale values. In v7 you use `useWatch` or `subscribe`, or mark the component `"use no memo"`. v8 adds compiler support. Source: https://react-hook-form.com/llms-full.txt and https://react-hook-form.com/migrate-v7-to-v8#ReactCompiler

Community skills exist, and none is maintainer-owned.

- `secondsky/claude-skills`, skill `react-hook-form-zod`. MIT, 248 stars, last push 2026-10-31. It pins react-hook-form 7.84.0, zod 4.3.6, and `@hookform/resolvers` 5.2.2. The resolvers pin is two majors behind. Install: `npx skills add secondsky/claude-skills --skill react-hook-form-zod`. Source: https://github.com/secondsky/claude-skills/tree/main/plugins/react-hook-form-zod
- The same repo has `tanstack-query` (pins 5.101.4), `tanstack-table`, and `zod` skills. Source: https://github.com/secondsky/claude-skills/tree/main/plugins
- `jezweb/claude-skills` still has a skills.sh listing for `react-hook-form-zod`, but the skill is no longer in the repo tree. Sources: https://skills.sh/jezweb/claude-skills/react-hook-form-zod and https://github.com/jezweb/claude-skills

## zod

- No official consumer skill. The two skills in `colinhacks/zod`, `triage` and `security-advisory`, are for maintainers. Source: https://github.com/colinhacks/zod/tree/main/.claude/skills
- Official agent docs: https://zod.dev/llms.txt and https://zod.dev/llms-full.txt, written for Zod 4.
- Version: 4.6.7. Source: https://www.npmjs.com/package/zod

Zod fits both form libraries. `@hookform/resolvers/zod` covers RHF. TanStack Form validates with Standard Schema, which Zod 4 implements. Source: https://tanstack.com/form/latest/docs/framework/react/guides/validation.md. nuqs documents Zod codecs as custom parsers. Source: https://nuqs.dev/docs/parsers/community/zod-codecs.md. Orval and Hey API can both generate Zod schemas from OpenAPI. Sources: https://orval.dev/llms.txt and https://heyapi.dev/docs/openapi/typescript/plugins/zod/v4.md. I see no reason to pick another schema library.

## nuqs

- No official consumer skill. The only skill in `47ng/nuqs` is `bundle-size-bake-off`, for contributors. Source: https://github.com/47ng/nuqs/tree/next/.agents/skills
- Official agent docs: https://nuqs.dev/llms.txt and https://nuqs.dev/llms-full.txt. They include pages on adapters, testing, and TanStack Table parsers.
- Version: 2.10.3. Peers are `next >=14.2.0` and `react >=18.2.0 || ^19.0.0-0`, so Next 16 and React 19 are covered. Source: https://www.npmjs.com/package/nuqs
- Best community skill I found: `pproenca/dot-skills`, skill `nuqs`. MIT, 224 stars, last push 2026-08-15. It covers nuqs v2.5 to v2.9 with 39 rules. Install: `npx skills add pproenca/dot-skills --skill nuqs`. Source: https://github.com/pproenca/dot-skills/tree/main/skills/.curated/nuqs

## Cross-library docs MCP

Context7 by Upstash serves current docs for all of these libraries. It is the one general-purpose option. MIT, about 64.6k stars, npm `@upstash/context7-mcp` 4.6.0. Remote URL is `https://mcp.context7.com/mcp`, and it "recommends" an API key for higher rate limits. Source: https://github.com/upstash/context7. It is third-party for every library here, so it's a fallback, not a source of truth.

## Does TanStack Form make react-hook-form redundant?

Yes, they solve the same problem. Pick one. shadcn/ui supports both and recommends neither. Source: https://ui.shadcn.com/docs/forms

TanStack's comparison table marks React Compiler support yes for TanStack Form and no for RHF. It also notes the table "may not be fully accurate". Source: https://tanstack.com/form/latest/docs/comparison. RHF's own docs agree that v7 needs care under the compiler, and they give the fix.

My take: keep RHF, since it's the fixed choice in the map, and don't add TanStack Form. Write a short rule in `docs/agents/` that says "use `useWatch`, never render `watch()`", because the compiler is on. Skills don't change the call. TanStack Form's skills target an unreleased v2, and RHF has none, so neither side wins on agent support. Revisit when RHF v8 is stable or Form v2 ships.

## Missing from this layer

### Drag and drop for cards and lists

The stack has nothing for reordering, and a kanban needs it. Neither candidate ships an agent skill: a code search of both repos finds no `SKILL.md`.

- dnd-kit. Maintainer: Claudéric Demers. The new `@dnd-kit/react` is 0.5.3, still pre-1.0. The old `@dnd-kit/core` 6.3.1 was last published in December 2024. Keyboard sensors and accessibility are built in. Docs for agents: https://dndkit.com/llms.txt. Sources: https://www.npmjs.com/package/@dnd-kit/react, https://www.npmjs.com/package/@dnd-kit/core, https://github.com/clauderic/dnd-kit
- Pragmatic drag and drop. Maintainer: Atlassian. `@atlaskit/pragmatic-drag-and-drop` is 4.0.0. It wraps the browser's native drag and drop, works with any view layer, and runs Trello and Jira. Sources: https://www.npmjs.com/package/@atlaskit/pragmatic-drag-and-drop, https://github.com/atlassian/pragmatic-drag-and-drop

I'd pick Pragmatic drag and drop for a Trello-style board. It's stable at 4.0 and was built for this exact UI. dnd-kit's React API is still at 0.x. Either one needs a hand-written `docs/agents/` note, because no skill exists.

### OpenAPI client generation

laneway-api already emits an OpenAPI document. `Program.cs` calls `AddOpenApi` at line 50 and maps `MapOpenApi` and Scalar at lines 172 to 175, but only in Development. Source: `Program.cs` in https://github.com/Samwelomwenga/laneway-api. It doesn't generate the document at build time. So the UI can only fetch the spec from a running dev server. ASP.NET Core can write it at build time with `Microsoft.Extensions.ApiDescription.Server`. Source: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi?view=aspnetcore-10.0#generate-openapi-documents-at-build-time

Generators:

- Orval 8.47.0. It generates TanStack Query hooks, Zod schemas, and MSW mocks. It ships an official skill in its repo, maintained by orval-labs. Install with `/plugin marketplace add orval-labs/orval` in Claude Code, or `npx skills add orval-labs/orval`. The skill was last changed on 2026-05-20, so it may lag the 8.x releases. Sources: https://github.com/orval-labs/orval/tree/master/skills, https://www.npmjs.com/package/orval
- Hey API `@hey-api/openapi-ts` 0.99.0. It has a TanStack Query v5 plugin and a Zod v4 plugin. I found no skill or MCP server. Sources: https://heyapi.dev/docs/openapi/typescript/plugins/tanstack-query.md, https://www.npmjs.com/package/@hey-api/openapi-ts
- `openapi-typescript` 7.13.0 with `openapi-fetch` and `openapi-react-query`. These are types plus a thin fetch wrapper with no generated hooks. No skill. Source: https://www.npmjs.com/package/openapi-react-query

Orval is the only generator here with an official skill, and it outputs both TanStack Query hooks and Zod. That makes it the best fit for this stack.

### Smaller gaps

- `@tanstack/react-query-devtools` 5.107.1 matches the Query version. Source: https://www.npmjs.com/package/@tanstack/react-query-devtools
- TanStack's `llms.txt` lists Pacer for debouncing and Virtual for long lists. Source: https://tanstack.com/llms.txt. Neither ships skills. Virtual only matters if a list holds hundreds of cards.

## Recommendation for the spec

- Vendor: the Orval skill, if we adopt Orval. Maybe `pproenca/dot-skills` `nuqs` and `secondsky/claude-skills` `react-hook-form-zod`, after reading them in full and fixing the stale resolvers pin.
- Don't vendor yet: TanStack Form v2 skills, since they target an alpha. TanStack Table skills, unless a table view lands.
- Decide: whether TanStack Intent manages TanStack skills from `node_modules`, or we copy them into `.agents/skills/` and pin them in `skills-lock.json`.
- MCP: none from this layer in `.mcp.json`. TanStack's server and Context7 both want per-user keys. Point agents at the `llms.txt` files from `docs/agents/` instead.
- Libraries to add: a drag and drop library (Pragmatic drag and drop) and an OpenAPI generator (Orval). laneway-api would also need to emit its spec at build time.

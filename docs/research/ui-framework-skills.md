# Skills and MCP servers for Next 16, React 19, Tailwind 4, and shadcn/ui

Research for wayfinder ticket 02. Checked on 2026-11-11 against laneway-ui at Next 16.4.6, React 19.3.0, Tailwind 4.3.3, and `babel-plugin-react-compiler` 1.0.0. `next.config.ts` already turns on `cacheComponents`, `partialPrefetching`, and `reactCompiler`. shadcn/ui is not installed yet, so there is no `components.json`.

## Short answer

- Next.js knowledge should come from the bundled docs, not a skill. Next's own guide says so, and the managed `AGENTS.md` block already points there.
- Vendor the `shadcn` skill from `shadcn-ui/ui` once `components.json` exists. Add the shadcn MCP server to `.mcp.json`.
- Add `next-devtools-mcp` to `.mcp.json` and vendor `next-dev-loop` from `vercel/next.js`. The other Next skills are optional, and the two adoption skills don't apply because the flags are already on.
- From `vercel-labs/agent-skills`, take `react-best-practices`, `composition-patterns`, and `web-design-guidelines`. All three are MIT and already appear in the reference repos.
- For design, take `impeccable` or `frontend-design`, not both. Impeccable started from frontend-design and goes further.
- Tailwind Labs and the React team publish no consumer skill or MCP server. Skip the community Tailwind skills. The shadcn skill covers the Tailwind 4 rules this app needs.
- The UI layer has no drag-and-drop library, and this is a kanban board. That is the biggest gap.

## Next.js 16

### Bundled docs and the AGENTS.md block

Next 16.2 and later ship version-matched docs in `node_modules/next/dist/docs/`. The folders mirror nextjs.org/docs. Source: https://nextjs.org/docs/app/guides/ai-agents

In 16.3 and later, `next dev` writes a managed block between `<!-- BEGIN:nextjs-agent-rules -->` markers in `AGENTS.md`. The block tells the agent to read the bundled docs. Source: https://nextjs.org/docs/app/guides/ai-agents. The `agentRules` config turns it off: https://nextjs.org/docs/app/api-reference/config/next-config-js/agentRules

laneway-ui's `AGENTS.md` already has this block. After `pnpm install`, the bundled docs here hold 475 files across `01-app`, `02-pages`, `03-architecture`, and `04-community`. They cover `reactCompiler`, the experimental `turbopackRustReactCompiler`, and Tailwind setup in `01-getting-started/11-css.md`. They don't mention shadcn.

Next's guide states the policy outright: "Framework knowledge comes from the bundled docs, not from Skills." It cites Vercel evals where the bundled docs scored 100% and skill-based approaches scored up to 79%. Sources: https://nextjs.org/docs/app/guides/ai-agents and https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

Per-error pages under `/docs/messages` are not bundled. Agents fetch them over the network as Markdown, through `.md` URLs or `llms.txt`. Source: https://nextjs.org/docs/app/guides/ai-agents

So no Next.js knowledge skill is worth vendoring. Any third-party "Next 16" skill would duplicate the bundled docs and drift from them.

### Next.js skills from vercel/next.js

Vercel maintains them in the Next.js repo under `skills/`. Source: https://github.com/vercel/next.js/tree/canary/skills. Install with `npx skills add vercel/next.js --skill <name>`. Source: https://nextjs.org/docs/app/guides/ai-agents

These are workflow skills. None of them is a docs dump.

| Skill | What it does | Fit for laneway-ui |
| --- | --- | --- |
| `next-dev-loop` | Verifies edits against a running `next dev`, using `/_next/mcp` and the `agent-browser` CLI | Yes. It is the edit-and-verify loop. |
| `next-bundle-optimizer` | Audits client bundle size with the Turbopack analyzer. Added in 16.4.0. | Optional, for later |
| `next-cache-components-adoption` | Turns on Cache Components and fixes routes | No. `cacheComponents` is already on. |
| `next-cache-components-optimizer` | Grows a route's static shell behind an `instant()` test | Optional, for later |
| `next-partial-prefetching-adoption` | Moves an app onto Partial Prefetching | No. `partialPrefetching` is already on. |
| `next-partial-prefetching-optimizer` | Tunes what each link prefetches | Optional, for later |

Source for the table is https://nextjs.org/docs/app/guides/ai-agents

`next-dev-loop` depends on `agent-browser` from `vercel-labs/agent-browser`, a CLI that exposes the DOM, console, network, and React tree as text. Sources: https://github.com/vercel/next.js/blob/canary/skills/next-dev-loop/SKILL.md and https://github.com/vercel-labs/agent-browser

### next-devtools-mcp

The Next 16 dev server exposes an MCP endpoint at `/_next/mcp`. It is on by default. `experimental.mcpServer: false` turns it off. Source: https://nextjs.org/docs/app/guides/mcp

`next-devtools-mcp` connects an agent client to that endpoint. Vercel maintains it. The latest npm version is 0.4.0. Sources: https://github.com/vercel/next-devtools-mcp and https://www.npmjs.com/package/next-devtools-mcp

Config from the Next docs:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

For Codex the repo gives `codex mcp add next-devtools -- npx next-devtools-mcp@latest`. Source: https://github.com/vercel/next-devtools-mcp

It has four tools: `nextjs_index`, `nextjs_call`, `nextjs_docs`, and `browser_eval`. Through `nextjs_call` an agent reaches the dev server's tools, such as `get_errors`, `get_routes`, `get_compilation_issues`, and `compile_route`. Source: https://nextjs.org/docs/app/guides/mcp

`nextjs_docs` now only points at `node_modules/next/dist/docs/`, so it adds nothing over the `AGENTS.md` block. The repo removed `upgrade_nextjs_16`, `enable_cache_components`, and the docs resources, and says those moved into skills. Source: https://github.com/vercel/next-devtools-mcp

`next-dev-loop` calls `/_next/mcp` directly and works without this server. Source: https://nextjs.org/docs/app/guides/mcp. The MCP server still helps for ad hoc questions like "what errors are on the page", so I'd add both.

## React 19 and the React Compiler

The React team publishes no consumer skill or MCP server. The `react/react` repo has `.claude/skills` (`extract-errors`, `feature-flags`, `fix`, `flags`, `flow`, `test`, `verify`), but those are for working on React itself. Source: https://github.com/facebook/react/tree/main/.claude/skills

react.dev serves `https://react.dev/llms.txt` with Markdown page URLs, so an agent can fetch current docs without a docs server. Source: https://react.dev/llms.txt

### vercel-labs/agent-skills

Vercel Labs maintains it under MIT. About 34k stars, last push 2026-10-28. Install with `npx skills add vercel-labs/agent-skills`. Source: https://github.com/vercel-labs/agent-skills

`react-best-practices` (frontmatter name `vercel-react-best-practices`, version 1.0.0) has 70 rules in 8 categories covering waterfalls, bundle size, server performance, and re-renders. It names no React or Next version. Source: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md

It does handle the compiler. Four rules in its compiled `AGENTS.md` say manual `memo()`, `useMemo()`, and JSX hoisting aren't needed when React Compiler is on. It still recommends functional `setState` for correctness. Source: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md

It overlaps with the Next bundled docs on server data fetching, `next/dynamic`, and `React.cache()`. The bundled docs win on Next APIs. The skill adds React-level re-render and waterfall rules the Next docs don't cover. weather-app already vendors it.

`composition-patterns` (name `vercel-composition-patterns`, 1.0.0) covers compound components and avoiding boolean props. It has a React 19 section, for example `react19-no-forwardref` and using `use()` over `useContext()`. Source: https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md. This fits a shadcn codebase, where components are compound by design.

`react-view-transitions` (1.0.0) covers React's `<ViewTransition>` and Next integration. Source: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-view-transitions/SKILL.md. Optional. It could matter for card moves on the board. weather-app vendors it.

### Community React Compiler skills

skills.sh lists third-party compiler skills, such as `saschb2b/skills/react-compiler`. They disagree on when to keep `useMemo` for effect dependencies. Sources: https://www.skills.sh/saschb2b/skills/react-compiler and https://tessl.io/registry/skills/github/compozy/compozy/react. I would skip them. The Next `reactCompiler` doc and react-best-practices already say what we need. The repo also lints with `eslint-plugin-react-you-might-not-need-an-effect` and `@eslint-react`.

## Tailwind CSS 4

Tailwind Labs publishes no agent skill, no MCP server, and no `llms.txt`. `https://tailwindcss.com/llms.txt` returned 404 on 2026-11-11.

The closest to first-party is Lombiq's `tailwind-4-docs`, which snapshots the docs from the `tailwindlabs/tailwindcss.com` repo. It is BSD-3-Clause, with about 80 stars and a last push on 2026-04-09. Install with `npx skills add lombiq/tailwind-agent-skills --skill tailwind-4-docs`. Source: https://github.com/Lombiq/Tailwind-Agent-Skills. A seven-month-old snapshot against Tailwind 4.3 is a staleness risk, so I'd skip it.

What covers Tailwind instead:

- The Next bundled docs cover the install and PostCSS setup. Source: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- The shadcn skill's `rules/styling.md` enforces the Tailwind habits that matter here: `gap-*` over `space-*`, `size-*`, semantic tokens, no manual `dark:` colors, and `cn()`. Source: https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md
- `eslint-plugin-better-tailwindcss` is already in `package.json` and catches class issues at lint time.

## shadcn/ui

### shadcn skill

shadcn maintains it in `shadcn-ui/ui` under `skills/shadcn/`. A second skill, `skills/migrate-radix-to-base`, sits next to it. Source: https://github.com/shadcn-ui/ui/tree/main/skills. Install with `pnpm dlx skills add shadcn/ui`. Source: https://ui.shadcn.com/docs/skills

The skill activates when it finds `components.json`. It runs `npx shadcn@latest info --json` at load time to read the framework, Tailwind version, aliases, base library, and installed components. Sources: https://ui.shadcn.com/docs/skills and https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md

It sets `user-invocable: false` and allows only `shadcn@latest` Bash commands. Its rule files are `base-vs-radix`, `chat`, `composition`, `forms`, `icons`, and `styling`. Source: https://github.com/shadcn-ui/ui/tree/main/skills/shadcn

Its theming guidance covers Tailwind v3 and v4. Base library options are `base`, `radix`, or `aria`. Source: https://ui.shadcn.com/docs/skills. The latest `shadcn` CLI on npm is 4.23.0. Source: https://www.npmjs.com/package/shadcn

It has no overlap with the Next bundled docs, which never mention shadcn. The `info --json` call needs a project with `components.json`. Vendor the skill in the same PR that runs `shadcn init`, not before.

### shadcn MCP server

It ships in the CLI, so there is no separate package. Source: https://ui.shadcn.com/docs/mcp

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

Codex needs it added by hand to `~/.codex/config.toml` under `[mcp_servers.shadcn]`. The shadcn CLI can't write that file. Source: https://ui.shadcn.com/docs/mcp

Its tools are `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, and `get_audit_checklist`. Source: https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/mcp.md

shadcn also serves `https://ui.shadcn.com/llms.txt`.

## General UI and design skills

### anthropics/skills frontend-design

Anthropic maintains it. About 193k stars, last push 2026-11-06. Source: https://github.com/anthropics/skills. The path is `skills/frontend-design/SKILL.md`. It pushes distinct visual identity, sets typography rules, lists AI design clichés to avoid, and sets a quality floor for focus states, reduced motion, and responsiveness. It names no framework and doesn't mention Tailwind or shadcn. Source: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md. ChalkApp-UI vendors it.

### pbakaus/impeccable

Paul Bakaus maintains it under Apache-2.0. About 108k stars, pushed the day I checked. Source: https://github.com/pbakaus/impeccable. The skill path is `.agents/skills/impeccable/SKILL.md`, metadata version 4.8.2. That is the path ChalkApp-UI's lock pins. Source: https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/SKILL.md

It has 24 commands, such as `critique`, `audit`, `polish`, `harden`, `typeset`, and `layout`. It also has `npx impeccable detect`, which runs 62 deterministic rules with no LLM. The upstream installer is `npx impeccable install`, but the `skills` CLI path works too, as ChalkApp-UI shows. The README says it "started from" frontend-design. Source: https://github.com/pbakaus/impeccable

Pick one. Impeccable covers frontend-design's ground and adds audit and hardening commands. ChalkApp-UI vendors both, so the two overlap there.

### vercel-labs web-design-guidelines

The path is `skills/web-design-guidelines/SKILL.md`, version 1.0.0. It reviews files against Vercel's Web Interface Guidelines and reports `file:line` findings. Source: https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md

It fetches its rules on every run from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`. The skill hash in `skills-lock.json` won't pin those rules, and the skill needs network access. Both reference repos vendor it.

### Accessibility

`addyosmani/web-quality-skills` has an `accessibility` skill built on WCAG 2.2. MIT. About 3.1k stars, last push 2026-08-24. Install with `npx skills add addyosmani/web-quality-skills --skill accessibility`. The repo also has `core-web-vitals`, `performance`, `best-practices`, `seo`, and `web-quality-audit`. Source: https://github.com/addyosmani/web-quality-skills. It is the most credible standalone a11y skill. It overlaps with the a11y parts of web-design-guidelines and impeccable's `audit`, and with `eslint-plugin-jsx-a11y`, which the repo already runs. Optional.

Deque's official axe MCP server needs a paid Axe DevTools for Web subscription, an API key, and Docker. It is proprietary. Source: https://github.com/dequelabs/axe-mcp-server-public. Not a fit for this project.

## Docs servers

- Context7, from Upstash. MIT. About 65k stars. A remote MCP at `https://mcp.context7.com/mcp` with `resolve-library-id` and `query-docs`. An API key is recommended but not required. It also has a CLI-plus-skill mode through `npx ctx7 setup`. Source: https://github.com/upstash/context7. It is useful for libraries with no bundled docs, like TanStack, react-hook-form, nuqs, and CASL. The API backend is closed source.
- `llms.txt`: nextjs.org, react.dev, and ui.shadcn.com serve one. tailwindcss.com does not. An agent with web fetch needs no server for those three.

I'd skip a docs MCP for Next, since the bundled docs win. Context7 is a call for the TanStack ticket, not this one.

## Libraries this layer seems to be missing

- Drag and drop. A kanban board needs it, and the stack names none. The options are `@dnd-kit` and `@atlaskit/pragmatic-drag-and-drop`. dnd-kit has about 17.8k stars. Its new `@dnd-kit/react` is at 0.5.3, pre-1.0, and the older `@dnd-kit/core` is at 6.3.1. Pragmatic drag and drop has about 12.8k stars and is from Atlassian. Sources: https://github.com/clauderic/dnd-kit, https://www.npmjs.com/package/@dnd-kit/react, and https://github.com/atlassian/pragmatic-drag-and-drop. Neither publishes an agent skill as far as I found. This choice deserves its own ticket.
- Schema validation for forms. react-hook-form needs a resolver, and shadcn's forms rule assumes one. Zod is the usual pick. This doc doesn't verify that.
- Browser testing. Nothing in `package.json` runs tests. `next-dev-loop` covers manual checks, and the Next optimizer skills write `instant()` tests that need a test runner. This doc doesn't pick one.
- Smaller pieces that shadcn's `init` usually pulls in, like an icon set, `cva`, `tailwind-merge`, and a toast library. These arrive with shadcn and don't need a decision.

## Overlap summary

| Item | Overlaps Next bundled docs? | Notes |
| --- | --- | --- |
| Next skills (vercel/next.js) | No, they point at them | Workflows, not knowledge |
| next-devtools-mcp | `nextjs_docs` only | Runtime tools are new |
| react-best-practices | Partly, on server and bundling rules | Compiler-aware |
| composition-patterns | No | React 19 section |
| shadcn skill and MCP | No | Needs `components.json` |
| web-design-guidelines | No | Rules fetched at run time |
| frontend-design and impeccable | No | Overlap each other |
| accessibility (addyosmani) | No | Overlaps jsx-a11y and design skills |
| Tailwind community skills | Partly, on setup | No first-party option |

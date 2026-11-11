# Upstream skill catalogs: mattpocock/skills and pstack

Surveyed on 2026-11-11 against these commits:

- `mattpocock/skills` at `main` = `4ae2317` ([repo](https://github.com/mattpocock/skills/tree/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d))
- `cursor/plugins` at `main` = `5866df5` ([pstack](https://github.com/cursor/plugins/tree/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack))

The baseline is ChalkApp-UI's `skills-lock.json` (local file, `~/projects/chalkApp/ChalkApp-UI/skills-lock.json`). It pins 22 mattpocock skills and 29 pstack skills.

## Summary

- mattpocock publishes 27 skills in its plugin. Since ChalkApp's lock, Matt renamed one skill, removed one, and added six. Source: [.claude-plugin/plugin.json](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.claude-plugin/plugin.json).
- pstack publishes 58 skills. pstack has not removed or renamed any skill in ChalkApp's lock. 29 skills are new to us. Source: [pstack README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/README.md).
- ChalkApp's lock is older than its file date suggests. It still points at `writing-great-skills`, which upstream renamed on 2026-07-31, so its mattpocock entries were last synced before that date. Source: [commit 1fc6573](https://github.com/mattpocock/skills/commit/1fc6573e0e).
- Two names collide across the repos: `tdd` and `teach`. Both repos ship a skill with each name, and they do different things. We can vendor only one of each into `.agents/skills/` without renaming.
- Neither repo has a mobile-only skill. The mobile and ChalkApp-specific skills in ChalkApp's lock all come from other sources. The last table lists them.
- Claude Code installs pstack from a generated copy at `harness/pstack/claude-code/`, not from `pstack/skills/`. ChalkApp's lock pins `pstack/skills/...`. Source: [harness README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/harness/pstack/README.md).

## mattpocock/skills

The repo groups skills into buckets. Only `engineering` and `productivity` ship in the plugin. `misc` is "not promoted in the plugin", and `in-progress` is beta and "can change or disappear without warning". `deprecated` is empty, because Matt deletes a retired skill. Sources: [skills/misc/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/misc/README.md), [skills/in-progress/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/README.md), [skills/deprecated/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/deprecated/README.md).

"User" in the invocation column means the skill sets `disable-model-invocation: true`, so only a typed slash command runs it. Source: [skills/engineering/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/README.md).

### In the plugin

| Path | What it does | Status vs ChalkApp lock | Fits a Next.js app? |
|---|---|---|---|
| `skills/engineering/ask-matt` | User-invoked router that says which skill fits your situation. | Unchanged | Yes |
| `skills/engineering/code-review` | Reviews a diff for repo standards and spec match, in parallel subagents. | Unchanged | Yes |
| `skills/engineering/codebase-design` | Shared vocabulary for deep modules, seams, and testable interfaces. | Unchanged | Yes |
| `skills/engineering/diagnosing-bugs` | Diagnosis loop for hard bugs and perf regressions. | Unchanged | Yes |
| `skills/engineering/domain-modeling` | Builds the domain model in `GLOSSARY.md` and ADRs. | Unchanged | Yes |
| `skills/engineering/grill-with-docs` | Grilling session that also writes the glossary and ADRs. User-invoked. | Unchanged | Yes |
| `skills/engineering/implement` | Builds work from a spec or tickets, with `/tdd` and `/code-review`. | Unchanged | Yes |
| `skills/engineering/implement-spec` | Implements a whole spec on one branch, with subagents across the ready tickets. | New, graduated 2026-09-24 | Yes |
| `skills/engineering/improve-codebase-architecture` | Finds deepening opportunities and shows them as an HTML report. | Unchanged | Yes |
| `skills/engineering/pr` | The shape of a PR body: summary visual, before and after evidence, merge-danger call. | New, graduated 2026-09-24 | Yes. Overlaps pstack's `technical-writing` and its PR playbook. |
| `skills/engineering/prototype` | Throwaway prototype to answer a design or UI question. | Unchanged | Yes |
| `skills/engineering/research` | Researches a question against primary sources and writes a cited Markdown file. | Unchanged | Yes |
| `skills/engineering/retro` | Suggests fixes to the agent's environment after a session. | New, graduated 2026-09-24 | Yes |
| `skills/engineering/setup-matt-pocock-skills` | Sets up the issue tracker, triage labels, and doc layout. Run once per repo. | Unchanged | Yes. The other engineering skills depend on it. |
| `skills/engineering/tdd` | Red-green-refactor, one vertical slice at a time. | Unchanged | Yes. Name collides with pstack `tdd`. |
| `skills/engineering/to-spec` | Turns the conversation into a spec on the tracker. | Unchanged | Yes |
| `skills/engineering/to-tickets` | Breaks a plan into tracer-bullet tickets with blocking edges. | Unchanged | Yes |
| `skills/engineering/triage` | Moves issues through a triage state machine and writes agent briefs. | Unchanged | Yes |
| `skills/engineering/wayfinder` | Plans large work as a map of decision tickets. | Unchanged | Yes. This map uses it. |
| `skills/engineering/wizard` | Generates a bash wizard for steps only a human can do, such as secrets or dashboards. | New, graduated 2026-08-05 | Maybe. Useful for one-off env and CI setup. |
| `skills/productivity/grill-me` | Interview to sharpen a plan. User-invoked. | Unchanged | Yes |
| `skills/productivity/grilling` | Model-invoked version of the grilling interview. | Unchanged | Yes |
| `skills/productivity/handoff` | Compacts the conversation into a handoff doc. | Unchanged | Yes |
| `skills/productivity/teach` | Teaches the user a concept over several sessions, using the directory as state. | Unchanged | Low value for a product repo. Name collides with pstack `teach`. |
| `skills/productivity/to-questionnaire` | Turns a decision you can't answer into a questionnaire for someone else. | New, graduated 2026-07-31 | Maybe |
| `skills/productivity/wait-what` | Re-pitches the last message in plain English with glossary terms. | New, graduated 2026-08-05 | Yes. It is small. |
| `skills/productivity/writing-for-agents` | How to write skills, `AGENTS.md`, and docs agents read. | Renamed from `writing-great-skills` on 2026-07-31. Clean rename, no alias. | Yes |

Sources: descriptions from each `SKILL.md` front matter under [skills/](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/) and from [skills/engineering/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/README.md) and [skills/productivity/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/README.md). Graduation dates come from the first commit touching each path: [pr and retro](https://github.com/mattpocock/skills/commits/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/pr), [implement-spec](https://github.com/mattpocock/skills/commits/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/implement-spec), [wizard](https://github.com/mattpocock/skills/commits/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/wizard), [to-questionnaire](https://github.com/mattpocock/skills/commits/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/to-questionnaire), [wait-what](https://github.com/mattpocock/skills/commits/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/wait-what). The rename is [commit 1fc6573](https://github.com/mattpocock/skills/commit/1fc6573e0e).

The lock also has `implement` and the new `implement-spec`. Both ship. `implement` does one spec or ticket set. `implement-spec` runs a whole spec as a task graph. Source: [skills/engineering/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/README.md).

### Removed since ChalkApp's lock

| Path | What happened | Source |
|---|---|---|
| `skills/engineering/resolving-merge-conflicts` | Matt deleted it on 2026-09-24 with the message "No longer needed". The same commit dropped it from `plugin.json` and `ask-matt`. Nothing replaces it. | [commit daa01d8](https://github.com/mattpocock/skills/commit/daa01d8aa6) |
| `skills/productivity/writing-great-skills` | Renamed to `writing-for-agents`. See above. | [commit 1fc6573](https://github.com/mattpocock/skills/commit/1fc6573e0e) |

### Outside the plugin

None of these are in ChalkApp's lock.

| Path | What it does | Fits a Next.js app? |
|---|---|---|
| `skills/misc/git-guardrails-claude-code` | Adds Claude Code hooks that block dangerous git commands. | Maybe. The global settings may already cover it. |
| `skills/misc/migrate-to-shoehorn` | Replaces `as` in tests with `@total-typescript/shoehorn`. | Only if we adopt shoehorn |
| `skills/misc/scaffold-exercises` | Scaffolds course exercise folders. | No. It is for Matt's courses. |
| `skills/misc/setup-pre-commit` | Sets up Husky, lint-staged, Prettier, typecheck, and tests. | No. This repo already has commit hooks from its scaffold commit. |
| `skills/in-progress/chief-of-staff` | Coordinates subagents toward a long-running goal in one session. | Beta. Skip for now. |
| `skills/in-progress/claude-handoff` | Hands the session to a background agent via `claude --bg`. | Beta, and Claude Code only |
| `skills/in-progress/loop-me` | Grills you into workflow specs over several sessions. | Beta. Skip. |
| `skills/in-progress/setup-ts-deep-modules` | Wires dependency-cruiser so each package exposes only its entry files. | Beta. Maybe later. |
| `skills/in-progress/software-factory` | Vocabulary for designing a software factory. | Beta. Skip. |
| `skills/in-progress/writing-beats` | Article writing, shaped as beats. | No |
| `skills/in-progress/writing-fragments` | Article writing, mining raw fragments. | No |
| `skills/in-progress/writing-shape` | Article writing, shaping material paragraph by paragraph. | No |

Sources: [skills/misc/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/misc/README.md), [skills/in-progress/README.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/README.md), and each skill's front matter.

## cursor/plugins (pstack)

pstack has 58 skills under `pstack/skills/`. Every one of the 29 in ChalkApp's lock is still there, at the same path. Source: [directory listing](https://github.com/cursor/plugins/tree/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/skills).

`poteto-mode` is the entry point. It picks one of 23 playbooks and calls the other skills as steps need them. Source: [pstack README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/README.md).

The README calls pstack Cursor-first. In Claude Code, pstack skips steps that need Cursor-only features such as Bugbot or Automations, with a note. Its default models are Opus 5.5 and Grok. `setup-pstack` writes model choices to `~/.claude/rules/pstack-models.md`. Source: same README.

### Already in ChalkApp's lock

| Path | What it does | Fits a Next.js app? |
|---|---|---|
| `pstack/skills/poteto-mode` | Entry point. Routes a task to a playbook and runs other skills. User-invoked. | Yes. Its lock key is "Poteto Mode", but the front matter `name` is `poteto-mode`. |
| `pstack/skills/blast-radius` | Finds what a small change could break and proves the safety claim by running code. | Yes |
| `pstack/skills/no-comments` | Deletes comments that don't earn their place, through the Comment Sicko agent. | Yes. `AGENTS.md` and the global rules already require it. |
| `pstack/skills/recall` | Rebuilds your recent context on a topic from chat history. | Yes |
| `pstack/skills/technical-writing` | Doc standard for docs, RFCs, readmes, PR bodies, and commits. | Yes |
| `pstack/skills/typescript-best-practices` | TypeScript syntax for the type-system principle. | Yes |
| `pstack/skills/unslop` | Removes AI tells from prose. | Yes. Global rules require it. |
| `pstack/skills/why` | Explains why code is the way it is, by querying the MCP servers it finds. | Yes. Its value depends on which MCP servers we add. |
| 21 `pstack/skills/principle-*` skills | One engineering principle each, indexed by `poteto-mode`. | Yes |

The 21 principles in the lock are: boundary-discipline, build-the-lever, encode-lessons-in-structure, exhaust-the-design-space, experience-first, fix-root-causes, foundational-thinking, guard-the-context-window, laziness-protocol, make-operations-idempotent, migrate-callers-then-delete-legacy-apis, minimize-reader-load, model-the-domain, never-block-on-the-human, outcome-oriented-execution, prove-it-works, redesign-from-first-principles, separate-before-serializing-shared-state, sequence-verifiable-units, subtract-before-you-add, type-system-discipline.

Source for descriptions: the "all skills" and "principles" tables in the [pstack README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/README.md).

### New since ChalkApp's lock

| Path | What it does | Fits a Next.js app? |
|---|---|---|
| `pstack/skills/architect` | Settles caller usage, types, and module shape before code crosses a function boundary. | Yes |
| `pstack/skills/arena` | Runs N parallel attempts at one task and merges the best parts. | Maybe. It is built around several models. |
| `pstack/skills/automate-me` | Drafts your own `-mode` skill from your transcripts. | No. It is personal, not per repo. |
| `pstack/skills/benchmark-checklist` | Vets a measured speedup or regression before you report it. | Maybe, for perf work |
| `pstack/skills/bro` | Restates the last message in plain language. | Yes. It overlaps mattpocock `wait-what`. |
| `pstack/skills/correct` | Mines history for repeated agent mistakes and fixes each with lint, types, tests, or docs. | Maybe |
| `pstack/skills/create-formal-verification-skill` | Verifies one property, such as a race or a state machine, with a formal tool. | Rarely for a UI |
| `pstack/skills/create-verification-skill` | Generates a project-local skill that drives the app like a user. | Yes. A browser verify skill fits a kanban UI. |
| `pstack/skills/figure-it-out` | Designs a playbook when no bundled one fits. | Maybe |
| `pstack/skills/how` | Walks through how a subsystem works. | Yes |
| `pstack/skills/in-your-own-words` | Plays back your goal before the agent starts. User-invoked. | Yes |
| `pstack/skills/interrogate` | Different models try to break a diff, and only proven findings survive. | Maybe. It overlaps mattpocock `code-review`. |
| `pstack/skills/ketchup` | Says what changed in the chat since your last message. | Maybe |
| `pstack/skills/ketchup-video` | `ketchup` as a short subtitled slide video. | No |
| `pstack/skills/maintain-formal-verification-skill` | Updates a formal verification skill after code changes. | Rarely for a UI |
| `pstack/skills/maintain-verification-skill` | Fixes drift in a verify skill's feature map. | Yes, if we adopt `create-verification-skill` |
| `pstack/skills/make-bot-ui` | Builds a page whose buttons wake a Grok Bot over a webhook, with Tailscale. | No. Cursor and Grok specific. |
| `pstack/skills/poteto-help` | Says which pstack skill or playbook fits. User-invoked. | Yes, if we vendor `poteto-mode` |
| `pstack/skills/principle-attack-the-premise` | After two fixes on one premise fail, test the premise directly. | Yes |
| `pstack/skills/principle-explain-the-number` | Find what limits a measured number before trusting it. | Maybe |
| `pstack/skills/principle-test-behavior-not-implementation` | Tests assert what users can observe, not internals. | Yes |
| `pstack/skills/reflect` | Captures what a long task taught as a skill edit. | Maybe |
| `pstack/skills/setup-pstack` | Picks models per role and writes a user-level rule. | Per user, not per repo |
| `pstack/skills/sharpen` | Rewrites a prompt to be deeper before you send it. User-invoked. | Maybe |
| `pstack/skills/show-me-your-work` | Logs decisions to a TSV you can commit. | Maybe |
| `pstack/skills/statechart` | Checks a TLA+ model and draws it as a Mermaid statechart. | Maybe, for drag-and-drop or sync state |
| `pstack/skills/swarm` | Runs N workers over different slices and aggregates one report. | Maybe |
| `pstack/skills/tdd` | Failing test first, only when asked or when the test path is cheap. User-invoked. | Name collides with mattpocock `tdd`, which is model-invoked and fuller. |
| `pstack/skills/teach` | Runs `how` and `why` and weaves one explanation of a change. User-invoked. | Name collides with mattpocock `teach`, which does something else. |

Sources: the "all skills" table and "principles" table in the [pstack README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/README.md). Invocation flags come from the front matter of [pstack/skills/tdd/SKILL.md](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/skills/tdd/SKILL.md), [pstack/skills/teach/SKILL.md](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/skills/teach/SKILL.md), [pstack/skills/poteto-mode/SKILL.md](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/skills/poteto-mode/SKILL.md), and [pstack/skills/interrogate/SKILL.md](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/skills/interrogate/SKILL.md).

### Things to know before pinning pstack

- Claude Code's plugin install reads `harness/pstack/claude-code/`, a generated copy of `pstack/skills`, `pstack/agents`, and some docs. CI fails if the copy goes stale. It has 58 skills, the same as `pstack/skills/`. Source: [harness README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/harness/pstack/README.md).
- `no-comments` depends on the Comment Sicko agent in `pstack/agents/comment-sicko.md`. `poteto-mode` expects `pstack/agents/poteto-agent.md`. A lock that pins only `SKILL.md` paths does not bring these agents. Source: [pstack README](https://github.com/cursor/plugins/blob/5866df557357d005b3c0c9d3da0d9e739b4bdde3/pstack/README.md), section on subagents.
- `poteto-mode` references `deslop`, `control-cli`, and `control-ui`, which ship in `cursor-team-kit`, not pstack. Source: same README, "not shipped here".
- The `automations/benny` pack is Cursor-only and is not a slash skill. Source: same README, "automations".

## Mobile-only and ChalkApp-specific skills

Neither upstream repo has a mobile-only or ChalkApp-specific skill. The ones in ChalkApp's lock all come from other sources. I took these from the lock's `source` and `skillPath` fields. I did not open their upstream repos for this ticket.

| Lock key | Source | Flag |
|---|---|---|
| `expo-design-system` | `expo/skills` | Mobile only (Expo) |
| `react-native-design` | `wshobson/agents` | Mobile only (React Native) |
| `appllama-app-design-skill` | `appllama/appllama-skills` | Probably mobile app design. Not verified. |
| `better-auth-best-practices`, `better-auth-security-best-practices`, `create-auth`, `email-and-password-best-practices`, `organization-best-practices`, `two-factor-authentication-best-practices` | `better-auth/skills` | ChalkApp's auth stack. laneway-api owns auth, so these likely don't apply unless the open auth ticket picks Better Auth. |
| `frontend-design` | `anthropics/skills` | Web. Not mobile. Out of scope here. |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Web. Not mobile. Out of scope here. |
| `impeccable` | `pbakaus/impeccable` | Design skill. Out of scope here. |

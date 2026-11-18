# CI

Every PR to `main` runs the checks below on GitHub Actions. `ci.yml` holds all of them except `PR title`, which has its own workflow because it reruns when the title changes. The ruleset requires two checks: `CI` and `PR title`. `CI` goes green only when every other check in `ci.yml` passed or was allowed to skip.

Each section is headed with the check name GitHub shows on the PR.

## `changes`

Runs `dorny/paths-filter` and decides whether the PR is docs-only. A PR is docs-only when every changed file matches `**/*.md`, `docs/**`, `.agents/**`, `.claude/**` or `skills-lock.json`. On a docs-only PR, the jobs listed in `allowed-skips` skip. `changes` itself never skips, and if it fails, `CI` goes red.

To fix a red run, re-run it. If the filter itself errored, check the patterns under `filters` in `ci.yml`.

## `Lint`

Runs `pnpm lint`, which is ESLint with `--max-warnings 0`. The config sets `formatters: true`, so lint formats code too and there is no separate format check. It includes `eslint-plugin-sonarjs` and a rule that rejects any `process.env.NEXT_PUBLIC_*` name containing `SECRET`, `TOKEN`, `PASSWORD` or `PRIVATE`, because Next inlines those values into the client bundle.

To fix a red run, run `pnpm lint:fix`, fix what it leaves, and push.

## `Typecheck`

Runs `pnpm typecheck`, which is `next typegen` then `tsc --noEmit`.

To fix a red run, run `pnpm typecheck` locally and fix the errors.

## `Knip`

Runs `pnpm knip` to find unused files, exports and dependencies. The `pre-push` hook runs it too, but `git push --no-verify` skips the hook, so CI runs it again.

To fix a red run, delete what Knip reports as unused. If Knip is wrong, add an entry to `knip.json`.

## `Build`

Runs `pnpm build`. It restores and saves `.next/cache`, keyed on the lockfile plus `src/**`, `next.config.*` and `tsconfig.json`. A PR saves its cache in its own `refs/pull/N/merge` scope, so it never overwrites `main`'s.

To fix a red run, run `pnpm build` locally and fix the error.

## `Clean tree`

Runs `pnpm install` and `next typegen`, then fails if `git status --porcelain` prints anything, untracked files included. On failure it prints the status and diff.

It exists because a frozen install deletes stale `minimumReleaseAgeExclude` entries from `pnpm-workspace.yaml` and still exits 0. Left on `main`, a stale entry is a release-age bypass.

To fix a red run, run `pnpm install` on the branch, commit the changes, and push. That includes the case where it removed a stale exclude entry.

`minimumReleaseAge: 1440` makes pnpm wait a day before it installs a new package version. For an urgent advisory whose fix is younger than a day, add `<package>@<version>` to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`, run `pnpm install`, and push both changes. pnpm prunes the entry once the version is old enough, and `Clean tree` then asks for that change to be committed.

## `CodeQL`

Runs CodeQL for `javascript-typescript` with `build-mode: none` and the `security-extended` queries, and uploads the results under the category `/language:javascript-typescript`. `main.yml` uses the same category, so PRs compare against `main`'s baseline.

The job stays green when it finds something. The ruleset's code scanning rule blocks the merge instead. A red `CodeQL` job means the analysis or the upload failed.

To fix a red run, read the failed step's log. A blocked host shows as a failed step. See [Runner hardening](#runner-hardening).

To accept a false positive, dismiss the alert in the code scanning UI with GitHub's reason and a comment. Exclude a rule in config only when it is noisy across the repo.

Keep the category string as it is. Changing it splits the baseline.

## `zizmor`

Runs `zizmorcore/zizmor-action` over the workflow files and fails on any finding.

To fix a red run, read the annotation on the workflow line and fix what it names.

To accept a false positive, add `# zizmor: ignore[<rule>] <reason>` on the line.

## `Audit`

Runs `pnpm audit --audit-level high` over the whole lockfile, dev dependencies included, because dev tools run in CI with the repo token. It runs straight after pnpm setup with no install. A registry outage fails it.

To fix a red run, upgrade the package. If an upgrade can't reach a fixed version, add a pnpm `overrides` entry in `pnpm-workspace.yaml` with a comment naming its removal condition.

The `tinypool: 2.1.2` override is one of these. `eslint-plugin-format` pins oxfmt 0.35.0, which pins a vulnerable `tinypool`. Remove the override once `eslint-plugin-format` allows oxfmt 0.68.0 or later.

To accept a false positive, add the GHSA id to `audit.ignore` in `pnpm-workspace.yaml` by hand, with `# <reason>. Revisit YYYY-MM-DD.` above it. Never run `pnpm audit --ignore`, because it rewrites the file and deletes the comments. The PR that adds the first entry also adds a script that fails CI on a past revisit date. `audit.ignorePrune: true` drops entries whose advisory is gone.

## `Dependency review`

Runs `actions/dependency-review-action` on licenses only. `Audit` owns advisories. The allowed licenses are in `allow-licenses` in `ci.yml`.

To fix a red run, replace the dependency, or confirm its license is fine and allow it.

To accept a false positive, add the package's purl to `allow-dependencies-licenses` with a reason comment. The list already holds the 14 sharp libvips packages. They are LGPL, and the app neither links nor ships them.

## `PR title`

Pipes the PR title into `pnpm exec commitlint` with the repo's `commitlint.config.ts`. The squash merge uses the PR title as the commit message, so it has to pass the same rules as a commit.

To fix a red run, edit the title. The check reruns on the edit, with no new push.

## `CI`

Runs `re-actors/alls-green` over every job in `ci.yml`. It is green when every job passed, or skipped on a docs-only PR. On a code PR, a skip turns it red.

To fix a red run, fix the job it names.

A new job goes in three places in `ci.yml`: `CI`'s `needs`, `notify`'s `needs`, and `allowed-skips` if it skips on docs-only PRs. A job left out of `CI`'s `needs` doesn't gate the merge. A job left out of `notify`'s fails without an alert.

## `notify / Send`

Sends a Telegram alert when a job in `ci.yml` fails on a PR from this repo. It calls `telegram-alert.yml`. It is never a required check. On a Dependabot PR the secrets are missing, so it logs a warning and stays green.

A new job in `ci.yml` goes in `notify`'s `needs` as well as `CI`'s. Without it, the job fails without an alert.

To fix a red run, check that the `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets are set.

## Tests

There is no `Tests` job yet. Nothing in CI notices a `test` script without one, so the PR that adds the first test also adds the job.

The job runs `pnpm test` with no extra arguments. A failing test must exit non-zero, and so must a run that finds zero tests. `--passWithNoTests` and its equivalents are banned. The job skips on docs-only PRs. Add it to `CI`'s `needs`, `notify`'s `needs` and `allowed-skips`.

## `main.yml`

Runs on every push to `main`. `CodeQL` sets the baseline that PRs compare against, with the same category as the PR job. `Warm cache` runs `pnpm install` and `pnpm build` to save the pnpm store and `.next/cache` where PRs can read them. A failure sends a Telegram alert. No other check reruns here.

## Runner hardening

Every job starts with `step-security/harden-runner` in `block` mode. Outbound traffic goes only to the hosts in that job's `allowed-endpoints`. A request to any other host fails the step that made it, and harden-runner lists the blocked host in the job summary.

To add a host, confirm the step really needs it, then add `host:443` to that job's `allowed-endpoints`. Jobs of the same kind share a list across the workflow files, so change them together. `telemetry.nextjs.org` never goes on a list. `NEXT_TELEMETRY_DISABLED` is set instead.

Every `uses:` names a full commit SHA with a `# vX.Y.Z` comment, and the repo setting rejects an unpinned action.

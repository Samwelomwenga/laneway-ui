# CI

Every PR to `main` runs the checks below on GitHub Actions. `ci.yml` holds all of them except `PR title`, which has its own workflow because it reruns when the title changes. The `main` ruleset requires two checks: `CI` and `PR title`. `CI` goes green only when every other check in `ci.yml` passed or was allowed to skip.

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

## `Unit`

Runs `pnpm test`, which is `vitest run` with no extra arguments. It skips on docs-only PRs. Tests sit next to the file they test as `*.test.ts`.

A run that finds zero tests exits non-zero. Keep it that way. Do not add `--passWithNoTests` or anything like it.

To fix a red run, run `pnpm test` locally and fix the failing test or the code it caught.

## `Clean tree`

Runs `pnpm install` and `next typegen`, then fails if `git status --porcelain` prints anything, untracked files included. On failure it prints the status and diff.

It exists because a frozen install deletes stale `minimumReleaseAgeExclude` entries from `pnpm-workspace.yaml` and still exits 0. An entry is stale once its version is no longer in the lockfile. Age doesn't matter. Left on `main`, a stale entry is a release-age bypass.

To fix a red run, run `pnpm install` on the branch, commit the changes, and push. That includes the case where it removed a stale exclude entry.

`minimumReleaseAge: 1440` makes pnpm wait a day before it installs a new package version. For an urgent advisory whose fix is younger than a day, add `<package>@<version>` to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`, run `pnpm install`, and push both changes. pnpm keeps the entry while that version stays in the lockfile. When a later bump moves off it, the install prunes the entry, and `Clean tree` asks for that change to be committed.

## `Secret scan`

Downloads the pinned gitleaks CLI, checks its SHA-256, and runs `gitleaks git --log-opts=origin/main..HEAD` with `.gitleaks.toml`. That covers every commit on the PR. A second step fails if any `.env*` file other than `.env.example` is tracked.

To fix a red run, rotate the secret first. It is already on GitHub. Then rewrite the branch to drop it and force-push. For a tracked `.env` file, `git rm --cached` it.

To accept a false positive, add an `[[allowlists]]` table to `.gitleaks.toml` with a comment above it saying why it's safe. gitleaks refuses to load a table with no `commits`, `paths`, `regexes` or `stopwords`, so don't commit an empty one. Never use an inline `gitleaks:allow`.

To bump gitleaks, change `GITLEAKS_VERSION` and `GITLEAKS_SHA256` together. The hash comes from that release's `checksums.txt` for `linux_x64`.

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

To accept a false positive, add the package's purl to `allow-dependencies-licenses` with a reason comment. The list already holds the 14 sharp libvips packages and the two sonarjs packages. All are LGPL. The app neither links nor ships sharp's libvips, and sonarjs only runs in ESLint.

## `PR title`

Pipes the PR title into `pnpm exec commitlint` with the repo's `commitlint.config.ts`. The squash merge uses the PR title as the commit message, so it has to pass the same rules as a commit.

To fix a red run, edit the title. The check reruns on the edit, with no new push.

## `CI`

Runs `re-actors/alls-green` over every job in `ci.yml`. It is green when every job passed, or skipped on a docs-only PR. On a code PR, a skip turns it red.

To fix a red run, fix the job it names.

A new job goes in three places in `ci.yml`: `CI`'s `needs`, `notify`'s `needs`, and `allowed-skips` if it skips on docs-only PRs. A job left out of `CI`'s `needs` doesn't gate the merge. A job left out of `notify`'s fails without an alert.

## `notify / Send`

Sends a Telegram alert when a job in `ci.yml` fails on a PR from this repo. It calls `telegram-alert.yml`. It is never a required check. Doppler syncs both secrets to Actions secrets and Dependabot secrets, so Dependabot PRs alert too. When a secret is missing, it logs `Telegram secrets missing, failure alert not sent` as a warning and stays green.

A new job in `ci.yml` goes in `notify`'s `needs` as well as `CI`'s. Without it, the job fails without an alert.

To fix a red run, or a missing-secrets warning, check the Doppler syncs for `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. The [Secrets](runbooks/repo-setup.md#secrets) section of the repo-setup runbook has the steps.

## `main.yml`

Runs on every push to `main`. `CodeQL` sets the baseline that PRs compare against, with the same category as the PR job. `Warm cache` runs `pnpm install` and `pnpm build` to save the pnpm store and `.next/cache` where PRs can read them. A failure sends a Telegram alert. No other check reruns here.

## Dependabot

`.github/dependabot.yml` opens weekly update PRs on Monday for npm packages and actions, after a 7-day cooldown. It groups updates: `actions`, `next`, `react`, `tailwind`, and `dev-tooling` for the minor and patch updates of every other dev dependency. Majors outside a group get a PR each. Majors of `@types/node` and `typescript` are ignored.

Nothing auto-merges. pnpm and Node upgrades stay manual.

A Dependabot PR can fail `Clean tree` when its install prunes a stale exclude entry. Fix it like any other `Clean tree` failure.

## Local hooks

`pre-push` runs `pnpm lint`, `pnpm typecheck` and `pnpm knip`, the tracked-`.env` check, and gitleaks over `origin/main..HEAD`. When gitleaks isn't installed it prints a warning and skips the scan. Install it with `brew install gitleaks` or `dnf install gitleaks`, or download it from https://github.com/gitleaks/gitleaks/releases.

| Check                                                                   | Local                    | CI                             |
| ----------------------------------------------------------------------- | ------------------------ | ------------------------------ |
| `Lint`, `Typecheck`, `Knip`                                             | `pre-push`               | yes                            |
| Tracked `.env` files                                                    | `pre-push`               | `Secret scan`                  |
| gitleaks                                                                | `pre-push`, if installed | `Secret scan`                  |
| Commit message                                                          | `commit-msg`             | `PR title` checks the PR title |
| `Build`, `Clean tree`, `CodeQL`, `zizmor`, `Audit`, `Dependency review` | no                       | yes                            |

## Runner hardening

Every job starts with `step-security/harden-runner` in `block` mode. Outbound traffic goes only to the hosts in that job's `allowed-endpoints`. A request to any other host fails the step that made it, and harden-runner lists the blocked host in the job summary.

To add a host, confirm the step really needs it, then add `host:443` to that job's `allowed-endpoints`. Jobs of the same kind share a list across the workflow files, so change them together. `telemetry.nextjs.org` never goes on a list. `NEXT_TELEMETRY_DISABLED` is set instead.

Every `uses:` names a full commit SHA with a `# vX.Y.Z` comment, and the repo setting rejects an unpinned action.

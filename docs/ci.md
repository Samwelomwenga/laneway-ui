# CI

Every PR to `main` runs the checks below on GitHub Actions. `ci.yml` holds them. `CI` goes green only when every other check in `ci.yml` passed or was allowed to skip.

Each section is headed with the check name GitHub shows on the PR.

## `changes`

Runs `dorny/paths-filter` and decides whether the PR is docs-only. A PR is docs-only when every changed file matches `**/*.md`, `docs/**`, `.agents/**`, `.claude/**` or `skills-lock.json`. On a docs-only PR, the jobs listed in `allowed-skips` skip. `changes` itself never skips, and if it fails, `CI` goes red.

To fix a red run, re-run it. If the filter itself errored, check the patterns under `filters` in `ci.yml`.

## `Lint`

Runs `pnpm lint`, which is ESLint with `--max-warnings 0`. The config sets `formatters: true`, so lint formats code too and there is no separate format check.

To fix a red run, run `pnpm lint:fix`, fix what it leaves, and push.

## `CI`

Runs `re-actors/alls-green` over every job in `ci.yml`. It is green when every job passed, or skipped on a docs-only PR. On a code PR, a skip turns it red.

To fix a red run, fix the job it names.

A new job goes in three places in `ci.yml`: `CI`'s `needs`, `notify`'s `needs`, and `allowed-skips` if it skips on docs-only PRs. A job left out of `CI`'s `needs` doesn't gate the merge. A job left out of `notify`'s fails without an alert.

## `notify / Send`

Sends a Telegram alert when a job in `ci.yml` fails on a PR from this repo. It calls `telegram-alert.yml`. It is never a required check. On a Dependabot PR the secrets are missing, so it logs a warning and stays green.

A new job in `ci.yml` goes in `notify`'s `needs` as well as `CI`'s. Without it, the job fails without an alert.

To fix a red run, check that the `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets are set.

## Runner hardening

Every job starts with `step-security/harden-runner` in `block` mode. Outbound traffic goes only to the hosts in that job's `allowed-endpoints`. A request to any other host fails the step that made it, and harden-runner lists the blocked host in the job summary.

To add a host, confirm the step really needs it, then add `host:443` to that job's `allowed-endpoints`. Jobs of the same kind share a list across the workflow files, so change them together. `telemetry.nextjs.org` never goes on a list. `NEXT_TELEMETRY_DISABLED` is set instead.

Every `uses:` names a full commit SHA with a `# vX.Y.Z` comment, and the repo setting rejects an unpinned action.

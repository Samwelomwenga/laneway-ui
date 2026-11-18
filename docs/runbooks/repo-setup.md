# Repo setup

Branch protection and repo settings live in GitHub, not in the code. `docs/rulesets/` holds GitHub's export of both rulesets, so a ruleset change shows up as a diff in a PR. The settings below have no file, and Doppler holds the secrets, so this page is their only record. If you change one by hand, change it here too.

[docs/ci.md](../ci.md) explains each check and how to fix it when it goes red.

## Renaming a required check blocks every PR

The `main` ruleset requires two checks by name: `CI` and `PR title`. If either job's `name:` changes and the ruleset still lists the old name, GitHub waits for a check that never reports. Every open PR stays blocked, the rename PR included.

Renaming any other job in `ci.yml` is safe, because `CI` reports for all of them. Renaming `CI` itself, or the job in `pr-title.yml`, is not.

A PR runs the workflow from its own branch, so the rename PR reports only the new name. Rename in this order:

1. Open the rename PR and wait for the new name to report.
2. In the `main` ruleset, swap the old name for the new one, pinned to the GitHub Actions app, integration id `15368`.
3. Export the ruleset and commit it to the rename PR. See [Ruleset drift](#ruleset-drift).
4. Merge the rename PR.
5. Rebase every other open PR. Until it picks up the new workflow, it reports the old name and stays blocked.

A new required check follows the same order. Add it to the ruleset only after it has reported on a PR. A required check that has never reported blocks every PR.

## Repo settings

Settings, General, Pull Requests:

- Allow squash merging only. Turn off merge commits and rebase merging.
- Default squash commit title: pull request title (`PR_TITLE`). `PR title` checks the title because it becomes the commit on `main`.
- Default squash commit message: pull request description (`PR_BODY`).
- Automatically delete head branches: on.

Settings, Actions, General:

- Require actions to be pinned to a full-length commit SHA: on. `zizmor` catches an unpinned action on the PR. This setting refuses to run one at all.
- Allowed actions: leave at all actions.

Settings, Advanced Security:

- Dependency graph and Dependabot alerts: on. The API turns them on and off together. `Dependency review` needs the graph.
- Dependabot security updates: on, for all severities. Leave the auto-triage rules alone. Version updates come from `.github/dependabot.yml` and need no toggle.
- Code scanning default setup: off. `ci.yml` runs CodeQL in advanced setup, and the two can't run side by side.

## Secrets

`notify / Send` reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. The [`notify / Send`](../ci.md#notify--send) section of the CI docs says what it does. Doppler holds both values and syncs them to GitHub, the same as laneway-api. The workflows never call Doppler.

1. In Doppler, create a project `laneway-ui` with a `ci` config.
2. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` with the values from laneway-api's `ci` config, and nothing else. A sync pushes every secret in its config, so anything else added here lands in GitHub too. Its `docs/runbooks/repo-setup.md` says how the bot and chat were made.
3. In the `ci` config, add a GitHub integration sync to `Samwelomwenga/laneway-ui`, target Actions secrets.
4. Add a second sync from the same config, target Dependabot secrets. A Dependabot run reads only Dependabot secrets, so without this sync its failures send no alert.
5. Check that both secrets appear under Settings, Secrets and variables, in Actions and in Dependabot. Doppler also adds `DOPPLER_CONFIG`, `DOPPLER_ENVIRONMENT` and `DOPPLER_PROJECT`. They hold names, not credentials, and nothing reads them.

A rotated bot token goes in both Doppler projects.

## Rulesets

Settings, Rules, Rulesets, New ruleset, Import a ruleset. Import `docs/rulesets/main.json`, then `docs/rulesets/main-merge-lock.json`. The files are the rules. This page keeps only the reasons for what they leave out.

- No "Require signed commits". It checks every commit on the PR branch, so one unsigned commit blocks the merge. GitHub signs each squash commit it makes, and `main-merge-lock` makes a squash merge the only way into `main`. So `main` ends up signed without the rule.
- No "Require code quality results". GitHub Code Quality is a paid product. With nothing reporting to it, the rule would block every PR.
- No `CODEOWNERS` file. A sole maintainer can't satisfy a code owner rule, and requesting yourself does nothing. Revisit when a second maintainer joins.
- No bypass on `main`. Not even the owner skips its checks.

`main-merge-lock` restricts updates, which alone would stop every merge. So it lets the Repository admin role through, in pull requests only mode. Rulesets stack, so that PR still passes everything in `main`.

In an emergency, the owner turns a ruleset off by hand, then back on. Nobody pushes straight to `main`.

## Ruleset drift

A ruleset change made in the UI doesn't touch the files. Export it and commit it in the same sitting. To check both files against GitHub:

```bash
repo=Samwelomwenga/laneway-ui
strip='del(.id, .node_id, ._links, .created_at, .updated_at, .current_user_can_bypass) | .rules |= sort_by(.type)'
for name in main main-merge-lock; do
  id=$(gh api "repos/$repo/rulesets" --jq ".[] | select(.name == \"$name\") | .id")
  diff <(jq -S "$strip" "docs/rulesets/$name.json") \
    <(gh api "repos/$repo/rulesets/$id" | jq -S "$strip") \
    && echo "$name matches"
done
```

Two "matches" lines and nothing else means the files match. Any diff is drift. Replace the file with GitHub's export, from the ruleset's Export button, and commit it.

## Rollout

User-owned repos get no ruleset dry run, so this order has to work first time. Follow it once.

1. Apply the [repo settings](#repo-settings) and [secrets](#secrets) before the build PR opens.
2. Open one build PR with every workflow, config edit and doc. Fix harden-runner allowlists from its job summaries until it's green. Commits use the `ci:` type.
3. Once `CI` and `PR title` have reported, [import both rulesets](#rulesets). Run the [drift check](#ruleset-drift) and commit GitHub's export to the build PR if it differs.
4. Merge under enforcement. If the code scanning rule blocks for good because `main` has no CodeQL baseline, turn that one rule off, merge, let `main.yml` set the baseline, and turn the rule back on.

   Observed: \_\_\_\_

5. Check that the two critical `tinypool` alerts closed as fixed, `minimatch` and `katex` stay open, and the commit on `main` is a squash with the PR title.
6. Open a test PR. For its first red commit, remove `security-events: write` from the `CodeQL` job. Expect `CI` red, the merge blocked with no bypass offered to the owner, and a Telegram alert. Record what the code scanning rule shows for a failed upload, then revert.

   Observed: \_\_\_\_

7. For the second red commit, add a throwaway route handler that passes a query param to `child_process.exec`. CodeQL reports it as `js/command-line-injection`. Expect `CI` green and the merge blocked by the code scanning rule alone. Revert, then squash merge once green. Squash must be the only option offered.
8. Run `git push origin main` from a local checkout. GitHub must refuse it.
9. Fill in the two results above in a docs-only PR. Its code checks skip and `CI` goes green.
10. The first Dependabot PRs open once `dependabot.yml` reaches `main`. `PR title` passes on them. A `Clean tree` failure from a stale exclude entry is expected, not a rollout bug.

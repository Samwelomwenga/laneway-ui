# laneway-ui

The web client for Laneway, built with Next.js and TypeScript.

## Local development

Doppler holds the env vars. You need the Doppler CLI and a laneway-api running on port 8080.

```sh
pnpm install
doppler setup --project laneway-ui --config dev
doppler run -- pnpm dev
```

## CI

Every PR to `main` runs checks on GitHub Actions, and the `main` ruleset blocks a red PR from merging. See [docs/ci.md](docs/ci.md) for each check and [docs/runbooks/repo-setup.md](docs/runbooks/repo-setup.md) for the settings and rulesets.

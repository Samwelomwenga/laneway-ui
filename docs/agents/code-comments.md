# Code comments

This repo keeps comments lean. The code already says what it does. Write a comment only when the reader would otherwise have to leave the file to learn why the code looks the way it does, and no rename, extract, or type could say it instead.

## What earns a comment

**Behaviour an outside system forces on us.** Say a page wraps a component that calls `useSearchParams()` in `<Suspense>`, because `next build` fails without the boundary. The code shows the boundary but not why it has to be there. A browser bug, a Turbopack loader quirk, or a laneway-api response that sends `""` where you expect `null` are the same kind of fact.

**Coupling nothing compiles against.** If a component depends on the shape of a laneway-api endpoint and no shared type enforces it, name the endpoint. A change in the other repo surfaces here only at runtime, so the comment is the only warning.

**A constraint the type system cannot express.** Link the ADR in `docs/adr/` if one exists.

**The contract of an exported symbol**, when its name and type leave out something a caller needs. A hook that must run inside a provider is one example.

## What does not earn one

- Narration of the next line, banners, and section dividers.
- Commented-out code.
- Changelog entries. Those belong in the commit message.
- A file header that restates the file name or lists its exports.
- A JSX comment that labels a block, such as `{/* Header */}`. Extract a component with that name instead.
- A note on a design choice in our own code. If the choice needs defending, rename or restructure until it doesn't, or record it in an ADR.

A comment that survives only because deleting it feels risky is not earning its place. Delete it, or turn it into a name.

## Ticket references

Do not cite ticket ids, issue links, or spec sections in source comments. Tickets get closed or deleted and the reference rots. The reason goes in the comment itself. The ticket goes in the commit body or PR, where `git blame` finds it.

## Comment Sicko

`/no-comments` spawns Comment Sicko. Its keep-list allows license headers, external-dependency surprises, lint suppressions, public API doc comments, and issue links. This repo accepts that list with one change: issue links are out, for the reason above.

- Narration, banners, and commented-out code die.
- Surprises in our own code are a design smell. Take the `MUST KILL` reshape flag and fix the code.
- `@ts-expect-error` and `eslint-disable` need a real reason. ESLint enforces this with `eslint-comments/require-description`. A suppression over a correctness rule is a bug wearing a comment.

An agent reviewing comments here should read this file first and say it did.

## Vendored agent skills are exempt

No skills are vendored yet. When they are, they live under `.agents/skills/`, installed from upstream repos and pinned by hash in `skills-lock.json`. The `.claude/skills/` entries are symlinks into it.

That code is third-party source. It is out of scope for comment review, style review, and lint, and ESLint already ignores it. Do not review it as ours and do not edit it. Any change diverges from the pinned upstream, and the next skills sync overwrites it.

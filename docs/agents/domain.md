# Domain docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **single-context**, and it sits downstream of laneway-api. laneway-api's `GLOSSARY.md` is the source of truth for domain terms. There is no `GLOSSARY-MAP.md`.

## Before exploring, read these

- laneway-api's `GLOSSARY.md`: https://github.com/Samwelomwenga/laneway-api/blob/main/GLOSSARY.md, or `../laneway-api/GLOSSARY.md` if the sibling checkout exists.
- `GLOSSARY.md` at this repo's root, which holds UI terms only.
- `docs/adr/` in this repo: read ADRs that touch the area you're about to work in.
- laneway-api's `docs/adr/`: https://github.com/Samwelomwenga/laneway-api/tree/main/docs/adr, or `../laneway-api/docs/adr/`, when the work touches what the API decides.

The GitHub URLs are canonical. Cloud and Codex sessions can't see the sibling checkout.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── GLOSSARY.md          ← UI terms only; first line points at laneway-api's glossary
├── docs/adr/
│   └── 0001-<slug>.md   ← numbered from 0001
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in laneway-api's `GLOSSARY.md`. Don't drift to synonyms that glossary explicitly avoids.

- Screen copy and code use the API's word. A board has lists, not columns.
- This repo's `GLOSSARY.md` never redefines an API term. A wish to rename one goes to laneway-api's glossary and its `_Avoid_` lines first.

If the concept you need isn't in either glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`). A UI-only concept goes in this repo's glossary. A domain concept goes in laneway-api's.

## ADRs across the two repos

- This repo's ADRs live in `docs/adr/`, numbered from 0001.
- Cite an API ADR as "laneway-api ADR NNNN" with a link, never as a bare "ADR NNNN", since the numbers overlap.
- A decision that binds both repos gets its ADR in laneway-api, and this repo cites it.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

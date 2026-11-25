# Hugeicons replaces Lucide

Laneway uses Hugeicons' free stroke-rounded set, `@hugeicons/react` with `@hugeicons/core-free-icons`, both MIT. shadcn's Maia preset ships it, so `iconLibrary` in `components.json` names it, and shadcn and ReUI components come out with Hugeicons already in them. Lucide is what stock shadcn looks like, which DESIGN.md rules out. Hugeicons' soft corners match Instrument Sans and the round radii, and Phosphor looked thin beside the 500-weight meta text. Every component file names its icons, so switching sets later touches the whole codebase.

## Consequences

- Never import from `lucide-react`. A component copied from a tutorial gets its icons ported.
- The rendered stroke is 1.5px at every size, so `strokeWidth` is `1.5 * 24 / size`: 2.25 at 16px and 1.8 at 20px. The stock value renders 1px at 16px.
- The free set is stroke only. An on state fills the stroke glyph with `fill="currentColor"` instead of switching to a solid set.

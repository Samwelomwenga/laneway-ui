# Base UI is the only primitive layer

shadcn/ui and ReUI both ship every component on either Radix or Base UI. Laneway uses Base UI everywhere, through a `base-*` style in `components.json`, which picks the primitive for both registries at once. Mixing the two breaks overlays. A Radix modal sets `pointer-events: none` on the body and locks scrolling, so a Base UI popup inside it ignores clicks, and each project calls it the other's bug. Between the two, Base UI is shadcn's default for new projects since July 2026, ships a minor release every month, and has fewer and narrower open accessibility bugs. Radix has had no commits to main since 2026-10-14.

## Consequences

- Never add a component from a `radix-*` style, and never copy Radix examples from a tutorial without porting them.
- The toast is shadcn's Base UI `toast`, which the Radix style doesn't have.

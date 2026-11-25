# The mascot is raster art from masko.ai

Cobble is generated in masko.ai, which makes raster art only: transparent PNG stills, and AI video at 720px exported as WebM and HEVC with alpha. There is no Rive export and its Lottie may not be vector. So the mascot can't react or blend between states in code, and every expression is a separate paid generation that can drift off-model. Moving to a vector or Rive character later means redrawing every expression from scratch.

masko.ai's terms allow commercial use but don't say who owns the output, and they don't say what happens to hosted files when an account closes. Laneway keeps its own copies of every exported file in the repo, never hotlinked.

## Consequences

- Seven expressions plus a neutral base is the cap. A new placement reuses one before anyone generates an eighth.
- Stills are transparent PNGs. The one welcoming clip ships as WebM with an HEVC fallback for Safari, plays once, and rests on its last frame.
- Reduced motion shows the PNG of the clip's last frame and never fetches the video, because neither the player nor the formats handle `prefers-reduced-motion`.
- The mascot is always `aria-hidden` with an empty `alt`. The text beside it carries the message.
- Every generation starts from the approved neutral base as its reference image and the style card in DESIGN.md.

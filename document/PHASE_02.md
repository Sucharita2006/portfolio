# Phase 2 — Design tokens and typography

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 2 · `document/DESIGN_BRIEF.md` "Tokens"
**Commit:** `feat: design tokens, type scale, and base styles`
**Date:** 30 July 2026

---

## What this phase was for

Every colour, face, and size the rest of the site will use, defined once, in one file, and
provably resolving in a browser. No components, no content.

## Files

| File | Change |
| --- | --- |
| `src/app/globals.css` | The full `@theme` block, base styles, and the two motions |
| `src/app/layout.tsx` | Three fonts via `next/font/google` as CSS variables |
| `src/app/tokens/page.tsx` | New. Development-only specimen sheet |
| `src/app/page.tsx` | Scaffold updated to exercise `.shell`, `.font-display`, `text-hero` |
| `document/DESIGN_BRIEF.md` | `muted` amended, with the measured ratios recorded |

## Decisions

**`muted` changed from `#6D7480` to `#676D79`.** Approved in review as open question 1. The
original measures 4.24:1 against `paper` and every use of the token is 11–14px text, so it
could not have reached the Lighthouse 100 that F8 calls non-negotiable. The brief is amended
in place with the reasoning, not silently patched in CSS.

**The type scale uses one `clamp()` instead of breakpoints.**
`--text-hero: clamp(3.5rem, 2.25rem + 3.75vw, 5rem)` spans the brief's 3.5–5rem range and
reaches the ceiling around 1170px. Page padding does the same:
`clamp(1.5rem, 1rem + 2vw, 2.5rem)` for the brief's 1.5→2.5rem. Two fluid rules replace four
breakpoint variants, and neither can drift out of sync with the other.

**A `.shell` class rather than repeating the wrapper.** `mx-auto max-w-5xl px-6 lg:px-10`
would otherwise appear on every section wrapper on the site. One class, and the 64rem
content maximum is stated once.

**`:where([id]) { scroll-margin-top: 5rem }`.** The header is sticky from Phase 4, so `/#work`
would land underneath it. `:where()` holds specificity at zero so any element can override.

**`@media (scripting: none)` unhides `.reveal`.** `.reveal { opacity: 0 }` ships in the initial
HTML. Without this, a reader whose JavaScript never runs — disabled, blocked, or a hydration
error — sees a blank page that is nonetheless full of text to a crawler. The reveal is
decoration; the content is not.

**`text-wrap: pretty` on `p`.** Avoids one-word last lines. Ignored by browsers that lack it,
so it costs nothing.

**`/tokens` is gated, not omitted.** Phase 2's acceptance criteria are visual — Fraunces
rendering with the right axes, every token resolving, a visible focus ring — so they need a
page. Section 7 forbids leftover scaffolding, so the page 404s when `NODE_ENV` is production,
carries `noindex`, and is deleted in Phase 10.

**The specimen sheet computes its own contrast ratios.** Twenty lines of WCAG relative
luminance, inlined in the page rather than put in `src/lib` because it leaves with the page.
It is what caught the `muted` defect, and it means the sheet cannot claim a token passes when
it does not. Each swatch is also split — left half painted by the Tailwind utility, right half
by an inline hex — so a token that failed to compile would show as a visible seam rather than
as nothing.

## Verification

`npm run typecheck` — clean. `npm run lint` — clean. `npm run build` — clean, 5/5 static,
First Load JS 103 kB shared (unchanged from Phase 1; this phase ships no client JavaScript).

**Tokens present in the compiled CSS**, read out of `.next/static/css/*.css`:

```
--color-paper:#f2f3f4      --color-muted:#676d79      --color-marine:#243fa8
--color-ink:#101319        --color-rule-strong:#c3c7cd
--text-hero:clamp(3.5rem,2.25rem + 3.75vw,5rem)
--font-display:var(--font-fraunces),Georgia,serif
```

Utilities emitted and present: `bg-marine`, `bg-muted`, `bg-rule-strong`, `text-hero`,
`text-section`, `.shell`, `.eyebrow`, `.link-underline`, and the `scripting:none` block.

**Fonts.** All three CSS variables reach `<html>` in the served markup:
`class="__variable_ae2eaa __variable_1bc20f __variable_46fe82"`.

**Contrast, computed by the page itself** rather than by hand, against `paper #F2F3F4`:

| Token | Hex | Ratio | Verdict |
| --- | --- | --- | --- |
| `ink` | `#101319` | 16.74:1 | passes body text |
| `ink-soft` | `#3B414C` | 9.24:1 | passes body text |
| `marine` | `#243FA8` | 8.04:1 | passes body text |
| `muted` | `#676D79` | 4.68:1 | passes body text — was 4.24:1 and failing |
| `rule-strong` | `#C3C7CD` | 1.53:1 | hairline, carries no text |
| `rule` | `#DCDEE2` | 1.21:1 | hairline, carries no text |
| `marine-soft` | `#E6E9F6` | 1.09:1 | tint, carries no text |
| `paper-raised` | `#FBFBFC` | 1.07:1 | surface |

**Route behaviour**, against the production build and then the dev server:

| Route | `next start` | `next dev` |
| --- | --- | --- |
| `/` | 200 | 200 |
| `/tokens` | 404, zero bytes | 200, 51 KB, one `h1`, three `h2` |
| `/nope` | 404 | — |

The gate works in both directions: the sheet is reachable while building and unreachable once
deployed.

## A verification failure worth recording

The first pass of this phase reported two results that were both wrong, and the reason is worth
writing down because it would have poisoned every later phase.

`/tokens` appeared to return **200 in production**, and then **404 in development** — exactly
backwards. Neither was real.

1. Killing `npm run dev` in Phase 1 killed the npm wrapper and orphaned its `next dev` child.
   That process stayed alive for eleven minutes, rebuilding `.next` on every file change and
   overwriting the production build underneath it. `next start` was serving development
   artifacts. The compiled output proved it: the guard had been folded to `if (false) {}` and
   the file used `jsxDEV`.
2. The cleanup filter then matched on the command line containing `portfolio_final`, but the
   server had been launched with a relative path, so the filter never matched and reported
   "stopped cleanly" while the process was still running. It kept port 3000, Next quietly fell
   back to 3001, and the request to 3000 hit the still-running **production** server — which
   correctly 404s `/tokens`.

Both results were artefacts of the harness, not the code. The harness now launches `next`
directly rather than through npm, kills by matching the Next binary path, asserts the port is
free before starting and reports which PID owns it, refuses to run `next start` without a
`.next/BUILD_ID`, and aborts the moment the server process exits instead of waiting out a
readiness loop. Every number in the section above was re-measured after that.

The general rule this phase earned: **`next dev` and `next build` share `.next`, so a
production build must be regenerated after any dev run.**

## Needs your eyes

No browser here, so these are the things I cannot check and you can, in about two minutes.
Run `npm run dev` and open `http://localhost:3000/tokens`:

1. **Fraunces variation axes.** The hero specimen should look sharp and slightly narrow — not
   soft or friendly. If `SOFT 0, WONK 1, opsz 120` failed to apply it will look like a generic
   serif. Compare the "Handgloves 0123" line against the section headings.
2. **The nine colour swatches.** Each is split in half. Both halves should be a single flat
   colour with no seam. A visible seam means a token did not compile.
3. **`muted` legibility.** The metadata lines are the smallest text on the site. It passes at
   4.68:1 by measurement, but confirm you find it comfortable.
4. **Focus ring.** Tab through the link, button, and input at the bottom. Each should show a
   2px marine ring at 3px offset.
5. **Underline motion.** Hover the link — the underline should grow from the left over 220ms,
   not fade in.
6. **Reduced motion.** With "reduce motion" enabled in the OS, the underline should snap rather
   than animate.
7. **Hero size at 360px.** `text-hero` floors at 3.5rem, which is what the brief specifies but
   is large on a narrow phone. Worth an early look, since the real hero copy lands in Phase 5.

## Not done in this phase, by design

Header, footer, skip link, content, and every route past `/`. Phases 3 to 10.

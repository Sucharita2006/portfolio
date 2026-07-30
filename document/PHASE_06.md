# Phase 6 — Case studies and about

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 6 · F2 · F7
**Commit:** `feat: case study and about pages`
**Date:** 30 July 2026

---

## What this phase was for

`/work/[slug]` for all four case studies, statically generated with per-page metadata and
previous/next navigation, and `/about` from the profile prose, education, and awards.

## Files

| File | Change |
| --- | --- |
| `src/app/work/[slug]/page.tsx` | Added |
| `src/app/about/page.tsx` | Added |

## Decisions

**`dynamicParams = false`, and it is load-bearing.** Phase 4 found that `notFound()` called from
a prerendered page renders through `<html id="__next_error__">`, a shell that bypasses the root
layout entirely — no header, no footer, fallback fonts. Left at its default, an unknown slug
would invoke this page, the page would call `notFound()`, and the visitor would get that
degraded shell. With it off, unknown slugs never reach the page. Verified below.

**No wraparound on previous/next.** The first case study has no previous and the last has no
next. Wrapping would present four pieces of work as a carousel, which implies a sequence the
brief explicitly rejects — the same reason the index is metrics rather than `01 / 02 / 03`.

**The full stack on the case study, five on the homepage row.** F1 caps the row at five; this is
the page for the reader who wants all eleven.

**`<header>` inside `<article>`, and a second `<nav>`.** The rendered case study has two
`header` elements and two `nav` elements. Both are correct: a `header` nested in an `article` is
scoped to that article and does not become a second banner landmark, and the two navs are
distinguished by `aria-label` — "Primary" and "Case studies" — so a screen reader's landmark
list names them rather than offering "navigation" twice.

**Paragraph keys are a content slice, not an index.** `key={paragraph.slice(0, 48)}` rather than
`key={i}`. The arrays are static so it makes no practical difference today, but an index key on
content that could be reordered is the habit that causes the bug later.

**`/about`'s `h1` is not the word "About".** It reads "Software engineer, mostly backend." from
`profile.role` — a heading that says something rather than naming the route, since the route is
already named in the nav, the title, and the URL.

**Fact notes still live only on the homepage.** The Phase 5 plan was to show them on `/about`;
the design revision moved them into the hero instead, where they fill the space that was empty.
Repeating them here would be the same three lines twice on one site.

## Verification

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean. All four case studies
prerendered via `generateStaticParams`:

```
├ ○ /about                     131 B    103 kB
└ ● /work/[slug]               165 B    106 kB
    ├ /work/open-paws   ├ /work/legitrack-ai   ├ /work/payflow   └ /work/verde
```

**Routes, against the production build:**

| Route | Status | Landmarks | Headings |
| --- | --- | --- | --- |
| `/about` | 200 | header 1, main 1, footer 1, nav 1 | h1 1, h2 2, h3 3 |
| `/work/open-paws` | 200 | header 2, main 1, footer 1, nav 2 | h1 1, h2 4 |
| `/work/verde` | 200 | header 2, main 1, footer 1, nav 2 | h1 1, h2 3 |
| `/work/nope` | **404** | header 1, main 1, footer 1, nav 1 | h1 1 |
| `/resume.pdf` | 200 | — | 43,440 bytes |

`/work/nope` returning 404 **with the full shell and the font variables on `<html>`** is the
Phase 4 finding paying off. Without `dynamicParams = false` that row would show no header, no
footer, and Georgia.

**Previous/next chain**, with no wraparound at either end:

| Page | Previous | Next |
| --- | --- | --- |
| open-paws | — | LegiTrack AI |
| legitrack-ai | Legislative monitoring… | PayFlow |
| payflow | LegiTrack AI | VERDE |
| verde | PayFlow | — |

**Per-page metadata** distinct on every route, canonical present on all four case studies plus
`/about`. Canonicals currently resolve to `http://localhost:3000` because
`NEXT_PUBLIC_SITE_URL` is unset — that is the fallback chain working, and it becomes the real
origin on Vercel.

**Both drafted sections render:** `payflow` now has four `h2` sections including "The part that
was actually hard", `verde` three.

## Findings

**Next's "First Load JS" is not the number a browser downloads, and I have been quoting it as
if it were.** Measured by parsing each page's `<script>` tags and gzipping the referenced chunks
on disk, every route transfers about **144 kB** — roughly 40 kB more than the build report.

The gap is `polyfills-*.js` at 39,961 bytes gzipped, which the build output excludes. Checking
before reporting it as a problem: the tag is
`<script src="/_next/static/chunks/polyfills-…js" noModule="">`. `noModule` means every browser
with ES-module support — everything since roughly 2018 — skips it entirely. So Next's exclusion
is correct and the real modern-browser figure is **about 104 kB on every route**, comfortably
inside the amended 115 kB budget.

Worth recording rather than quietly dropping, because "103 kB" and "144 kB of files exist" are
both true and only one of them is the number that matters.

**`/about` ships the homepage's page chunk.** Its own chunk
(`app/about/page-9bd4a642126f6d37.js`, 153 B) is emitted and correctly listed in
`app-build-manifest.json`, but the generated HTML loads `app/page-f01af6b2525f82e5.js` instead —
the homepage chunk, which contains `Reveal`. `/work/[slug]` correctly loads its own.

Cost is about 4 kB on one route, for code that never executes there because `Reveal` is not
rendered on `/about`. This is Next's chunking, not anything the site does, and there is no fix
available at this layer. Recorded so the per-route figures in the build output are read with
the appropriate suspicion.

**`/about` was inheriting the root `og:title`.** The case studies set their own Open Graph
title; `/about` did not, so a link shared to it presented itself as the homepage. Fixed —
`og:title` now reads "About Sucharita Chattopadhyay".

## Needs your eyes

1. **Read the two drafted sections in context** — `/work/payflow` and `/work/verde`. These are
   the ones assembled from the résumé and they are the paragraphs an interviewer is most likely
   to ask about. The PayFlow one contains an inference of mine, called out in its own commit:
   that a gateway timeout and a card decline look alike at the call site and must not be treated
   alike. If the chain does not actually decide that way, that paragraph is wrong and needs
   rewriting rather than softening.
2. **`/about`'s `h1`** — "Software engineer, mostly backend." Built from `profile.role`. If you
   want different words there, they are yours to choose.
3. **Long case studies at 360px** — Open Paws is the longest page on the site.
4. **Previous/next at the ends.** On `/work/open-paws` the Previous slot is deliberately empty
   so Next stays right-aligned. Confirm that reads as intentional rather than broken.

## Not done in this phase, by design

The contact form and its API (Phase 7), the database and GitHub panel (Phase 8), tests and CI
(Phase 9), sitemap, robots, JSON-LD and the OG image (Phase 10).

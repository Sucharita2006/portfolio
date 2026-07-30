# Phase 4 — Layout shell

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 4 · F8
**Commit:** `feat: site header, footer, and skip navigation`
**Date:** 30 July 2026

---

## What this phase was for

The frame every route renders inside: sticky header, footer, skip link, and a 404 page. Plus
the root metadata, which finally reads from `profile` instead of a placeholder.

## Files

| File | Change |
| --- | --- |
| `src/components/site-header.tsx` | Added |
| `src/components/site-footer.tsx` | Added |
| `src/app/not-found.tsx` | Added |
| `src/app/layout.tsx` | Header, footer, skip link, real metadata |
| `src/app/page.tsx` | Scaffold marker only |

## Decisions

**The wordmark shortens at 360px; the navigation does not.** This is the overflow section 4
warns about, so here is the arithmetic. At 360px, page padding leaves 312px. "Sucharita
Chattopadhyay" is 23 characters of mono at 13px — about 180px. The three nav items plus their
gaps are about 145px. That is 325px into a 312px space.

Something had to give, and it was the name: `profile.shortName` below the `sm` breakpoint,
`profile.name` from `sm` up, both in the markup with one hidden. A shortened name is still a
name; a dropped link is a dropped link. Nav gaps also tighten from `1.5rem` to `1rem` below
`sm`. Roughly 200px of the 312px is used at 360px, which leaves real slack rather than a
result that only just fits.

**`main` keeps `tabIndex={-1}`, and the comment now says why.** Safari and Firefox will not
move focus to a landmark that cannot receive it. Without it the skip link scrolls the page and
leaves focus at the top of the header — which looks like it works and does not. This was set
in Phase 1 specifically so the Phase 4 acceptance criterion could not silently pass.

**`metadataBase` falls back through Vercel rather than to a hardcoded domain.**
`NEXT_PUBLIC_SITE_URL`, then `https://$VERCEL_PROJECT_PRODUCTION_URL`, then
`http://localhost:3000`. The starter defaulted to `https://sucharita.dev`, which drives every
canonical URL, the sitemap, and every Open Graph tag — a domain that may not be owned is the
one wrong value search engines act on. Open question 8's default.

**`alternates.canonical` added.** One line, and it stops the same page being indexed under
query strings and trailing-slash variants.

**The footer keeps "Let's talk."** I had flagged this as duplicated against the homepage
contact section and proposed removing it. On re-reading the brief's wireframe, that line sits
in the closing row, and the footer is the only place it appears on `/about` and the case
studies — removing it would strip the invitation from five of six routes to de-duplicate one.
So it stays, and **Phase 5's homepage contact section must not reuse the words**. Reversing my
own earlier default, recorded rather than quietly dropped.

**External footer links carry `rel="noreferrer noopener"`.** `noreferrer` already implies
`noopener` in current browsers; naming both means the intent survives a reader who only knows
one. Two links qualify — GitHub and LinkedIn. `mailto:` and `/resume.pdf` correctly get
neither.

**No `aria-current` on the active nav item.** Getting it would need `usePathname`, which would
make `SiteHeader` a client component and spend the third of three client budgets on a styling
nicety. Section 6 says a third client component is a signal something is wrong; this would be
that signal. Not required by F8.

**The 404 page lists the real routes.** A dead end is more useful with somewhere to go than
with a lone "go home" link, and the case studies are why anyone is on the site. It reuses the
metric-and-title pairing so the page still looks like the rest of the site rather than like an
error.

**The footer year is a build stamp, not a clock.** `new Date().getFullYear()` runs during static
generation, so a build in 2026 reads 2026 until the next deploy. Next to "Built with Next.js"
that is what the number should mean. Commented so it is not mistaken for a bug later.

## Verification

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean, 5/5 static.
**First Load JS 103 kB, unchanged** — the shell is entirely server-rendered and ships no client
JavaScript. `/_not-found` actually got *smaller*, 991 B to 131 B, since it is now a static
route rather than Next's built-in.

Read out of the built artifacts in `.next/server/app/`, not from a re-encoded copy:

**`/` — 200, 14,065 bytes**

```
<a href="#main" class="sr-only focus:not-sr-only …">   ← first element in <body>
<header class="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-sm">
<nav aria-label="Primary">
<main id="main" tabindex="-1">
```

- landmarks: `header` 1, `main` 1, `footer` 1, `nav` 1 · headings: exactly one `h1`
- title: `Sucharita Chattopadhyay — Software engineer`
- wordmark: both variants present — `sm:hidden">Sucharita` and
  `hidden sm:inline">Sucharita Chattopadhyay`
- nav: `/#work`, `/about`, `/resume.pdf`
- footer: `mailto:sucharita.chatterjee100@gmail.com`, GitHub, LinkedIn, `/resume.pdf`;
  `rel="noreferrer noopener"` on exactly the two external links
- encoding: file decodes as UTF-8, em dash is `\xe2\x80\x94`, `charSet="utf-8"` present

**`/nope` — 404, 18,078 bytes.** Full shell, `header`/`main`/`footer`/`nav` all present, one
`h1`, `<meta name="robots" content="noindex">`, font variables on `<html>`, and all six
internal routes offered.

## Findings

**`notFound()` from a prerendered page renders a degraded shell — and this changes Phase 6.**

The two 404 paths are not equivalent:

| Path | Shell | Layout, fonts, landmarks |
| --- | --- | --- |
| `/nope` — no route matches | `<html class="__variable_…">` | present |
| `/tokens` — the page calls `notFound()` | `<html id="__next_error__">` | **absent** |

Both render the right copy and the right title, but the second bypasses the root layout, so it
has no header, no footer, and falls back to Georgia and system-ui instead of Fraunces and Plex.

For `/tokens` this does not matter — it is unlinked, `noindex`, and deleted in Phase 10. It
matters for **F2**, where an unknown slug must return the 404 page. If `dynamicParams` is left
at its default of `true`, an unknown slug invokes the page, the page calls `notFound()`, and
the visitor gets the unstyled shell. Setting `export const dynamicParams = false` means unknown
slugs never reach the page and resolve through the `/nope` path instead.

I had already proposed `dynamicParams = false` as tidiness. It is not tidiness — it is the
difference between a 404 that looks like the site and one that looks broken. Phase 6 will set
it and the phase document will verify the shell, not just the status code.

**The 404 page links to `/work/*` routes that do not exist until Phase 6.** A consequence of
building in this order, not a defect. Phase 6 resolves it; noted so it is not mistaken for one
in the meantime.

**`/#work` does not resolve yet.** The header nav points at an anchor the homepage does not have
until Phase 5. Same category.

## A second harness failure, and the fix

My first Phase 4 run reported `/nope` and `/tokens` as **404 with a zero-byte body** — which
would have meant the custom 404 was not rendering at all. It was rendering fine. On PowerShell
5.1 a non-2xx response makes `Invoke-WebRequest` raise, and reading the body back off the
exception's response stream returns nothing, so every error page looked empty.

I checked before believing it, which is the only reason this is a footnote instead of a wasted
phase. The harness now fetches with `curl.exe` and reports status and body uniformly, so a 404
body is as readable as a 200 one. This is the second harness defect in three phases and both
produced confident, wrong results — hence reading structure out of `.next/server/app/*.html`
directly wherever it is possible.

Also worth stating plainly: `Résumé` and the em dash appear mangled in my console output. The
served bytes are correct UTF-8, verified at byte level. That one is my terminal, not the site.

## Needs your eyes

`npm run dev`, then:

1. **Tab once on the homepage.** "Skip to content" should appear top-left on a dark ground.
   Press Enter — focus must land inside `<main>`, so the *next* Tab goes to page content and
   not back into the header. This is the acceptance criterion and the one thing I cannot
   actually confirm.
2. **360px in devtools.** The header must not overflow or wrap. The wordmark should read
   "Sucharita"; widen past 640px and it becomes the full name.
3. **Scroll anything.** The header should stay put with a hairline underneath and the content
   blurring gently through it at 85% opacity.
4. **Visit `/nope`.** Should look like the site — header, footer, real type — and offer the
   four case studies.
5. **Click Résumé** in the header and the footer. It opens `public/resume.pdf`; whether it
   opens inline or downloads is not fixed until Phase 10.

## Not done in this phase, by design

The hero, the work index, capabilities, contact, the case studies, `/about`. Phases 5 to 10.

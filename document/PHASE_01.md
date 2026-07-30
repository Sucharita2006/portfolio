# Phase 1 — Scaffold

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 1
**Commit:** `chore: scaffold next 15 with typescript and tailwind v4`
**Date:** 30 July 2026

---

## What this phase was for

A Next.js 15 project that compiles, serves, and builds clean, with nothing in it yet. No
tokens, no fonts, no content, no components. Those are Phases 2 to 4 and mixing them in would
make this commit unreviewable.

## Files added

| File | Purpose |
| --- | --- |
| `package.json` | Scripts and the Phase 1 dependency set |
| `tsconfig.json` | `strict: true`, `@/*` alias, bundler resolution |
| `next.config.ts` | React strict mode, `poweredByHeader: false`, three security headers |
| `postcss.config.mjs` | Tailwind v4 through PostCSS — no `tailwind.config.js`, v4 is CSS-first |
| `.gitignore` | Plus `.vercel`, which the starter omitted |
| `.env.example` | All six variables from section 5.5; the starter listed three |
| `src/app/globals.css` | The Tailwind import only |
| `src/app/layout.tsx` | Minimal `html`/`body`/`main` |
| `src/app/page.tsx` | Minimal root route so `next build` has something to compile |
| `document/` | Both specs moved here, plus the plan, the open questions, and this file |

## Decisions

**The app sits at the repository root, not in `portfolio/`.** The spec's file tree shows a
`portfolio/` directory, but that was describing the repository, not a subdirectory inside it.
At the root, Vercel needs no root-directory override and a fresh clone runs `npm run dev` with
no `cd`.

**Dependencies are installed in the phase that first uses them.** Section 2 lists the complete
set at once; installing `resend` in Phase 1 would leave a reviewer looking at a dependency
with no consumer for six commits. Phase 1 takes `next`, `react`, `react-dom` and the six dev
dependencies. `zod` arrives in Phase 3, `resend` in Phase 7, `drizzle-orm`,
`@neondatabase/serverless` and `drizzle-kit` in Phase 8. The final `package.json` will match
section 2 exactly.

**`next` moved from the starter's 15.3.3 to 15.5.22**, the newest 15.x. Same major line the
spec requires, with the patch-level security fixes. Not 16 — the spec says 15.

**The `lint` script was removed rather than left broken.** The starter declared
`"lint": "next lint"` with no ESLint dependency, no config, and `next lint` deprecated in
Next 15, so the script could only fail. A script that lies is worse than no script. Open
question 3 asks whether to add ESLint properly; if yes, it comes back in the phase that adds
it.

**`layout.tsx` carries a hardcoded title for this phase only.** Section 5.1 says never
hardcode a name into a component, and that rule holds — but `profile.ts` does not exist until
Phase 3. The title is marked with a comment and moves onto `profile` in Phase 3.

**`<main>` already has `tabIndex={-1}`.** The skip link is Phase 4, but Safari and Firefox will
not move focus to a non-focusable landmark, and the Phase 4 acceptance criterion is precisely
"skip link moves focus to `<main>`". Setting it here means Phase 4 has one less thing that can
quietly not work.

## Verification

**`npm run typecheck`** — clean, no output.

**`npm run build`** — clean.

```
▲ Next.js 15.5.22
✓ Compiled successfully in 6.0s
✓ Generating static pages (4/4)

Route (app)                        Size  First Load JS
┌ ○ /                             123 B         103 kB
└ ○ /_not-found                   991 B         103 kB
+ First Load JS shared by all    103 kB
```

**`npm run dev`** — ready in 1.7s, `/` compiles in 2.5s and returns 200, an unknown path
returns 404.

**Security headers present on the response**, confirmed by fetching `/`:

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
```

**Rendered HTML** — one `<main id="main" tabindex="-1">`, one `<h1>`, Tailwind utilities
resolving (`mx-auto max-w-5xl px-6 py-24` present in the class attribute and in the emitted
CSS).

## Findings

**The 100 KB JavaScript budget is already exceeded, by the framework alone.** Section 1.6 caps
client JavaScript at 100 KB gzipped. This scaffold — an empty page — ships 103 kB.

I checked whether Next's reported figures were gzipped or raw rather than assuming: gzipping
the two emitted chunks by hand gives 46,581 B and 54,235 B against Next's reported 46.3 kB and
54.2 kB. They agree, so the 103 kB is gzipped and the constraint is genuinely missed. The
contents are `react-dom` and the App Router runtime; none of it is site code and none of it can
be removed while the spec requires Next 15 App Router. Open question 4 proposes an amendment.

**`npm audit` reports 3 high-severity advisories, all inside `next` itself** — its bundled
`postcss` and the optional `sharp` dependency. `npm audit fix --force` "resolves" them by
downgrading to `next@9.3.3`, which is not a fix. Both surfaces are build-time or image
optimisation; this site uses no `next/image` with remote sources. Nothing to do but note it and
pick up the fix when Next ships one.

## Needs your eyes

There is no browser in this environment, so nothing below has been *seen*, only fetched and
read as HTML:

1. Open `http://localhost:3000` and confirm the page renders. Nothing to judge visually yet —
   there is no styling in this phase by design.

## Not done in this phase, by design

Design tokens, the three fonts, the type scale, content, header, footer, skip link, and every
route past `/`. Phases 2 to 10.

# Implementation plan

**Project:** Portfolio site — Sucharita Chattopadhyay
**Source documents:** `document/BUILD_SPEC.md` (behaviour), `document/DESIGN_BRIEF.md` (appearance)
**Written:** 30 July 2026
**Status:** awaiting owner review

---

## 1. What was reviewed

All three inputs were read completely before this plan was written.

| Input | Contents |
| --- | --- |
| `BUILD_SPEC.md` | 619 lines. Scope, stack, 8 feature specs, data models, repo layout, 9-phase plan. |
| `DESIGN_BRIEF.md` | 166 lines. Anti-patterns, colour and type tokens, layout wireframe, signature device, motion budget, copy rules. |
| `portfolio-starter.zip` | 16 files under `portfolio/`. Both specs (byte-identical to the loose copies), configs, `globals.css`, `layout.tsx`, three components, and the two content files with all prose already written. |

The starter is a partial Phase 1–4 head start: configs, tokens, fonts, header, footer, reveal, and content are done. Missing entirely: every page, every route handler, `lib/`, `db/`, `public/`.

## 2. Repository layout

The Next.js app goes at the **repository root** (`d:\portfolio_final`), not in a `portfolio/`
subdirectory. Vercel then needs no root-directory override, and `npm run dev` works from a
fresh clone with no `cd`.

All project documentation lives in `document/`:

```
d:\portfolio_final\
├── document\
│   ├── BUILD_SPEC.md            moved here from root
│   ├── DESIGN_BRIEF.md          moved here from root
│   ├── IMPLEMENTATION_PLAN.md   this file
│   ├── OPEN_QUESTIONS.md
│   └── PHASE_01.md … PHASE_10.md   one per phase, committed with that phase
├── README.md
├── package.json  tsconfig.json  next.config.ts  postcss.config.mjs
├── public\
└── src\                         as BUILD_SPEC section 6
```

## 3. Corrections and improvements proposed

Everything below is a deviation from, or an addition to, the two specs. Nothing here gets
built without a yes. Items marked **[blocking]** must be resolved before the phase that
needs them; the rest have a stated default.

### A. Contradictions inside the spec that must be resolved

**A1. Static case studies vs. live view counter — [blocking, Phase 8]**
F2 says `/work/[slug]` is static via `generateStaticParams`. F4 says the page records a view
and displays the total. A fully static page cannot do both: a server action cannot run during
render, and a dynamic child would drag the whole route out of static generation.

*Proposed resolution.* Keep the route statically generated with `export const revalidate =
3600`. The count is read from Postgres at generation time, so it can be up to an hour stale —
invisible to a reader, and the alternative costs a database round trip on every request.
`ViewCount` becomes a client component that receives the server-read count as a prop and
calls a `recordView(slug)` server action once on mount, fire-and-forget. This satisfies F4's
"increment happens in a server action, fire-and-forget", keeps the page static, and the third
client component it introduces is one already named in the component inventory — so it is not
the "something belongs on the server" signal section 6 warns about. Added client JS: roughly
20 lines.

**A2. Component count — [not blocking]**
Section 4 lists eleven components; section 6's file tree lists ten files (no `eyebrow.tsx`).
*Default:* `Eyebrow` and `SectionHeading` both live in `section-heading.tsx`. Eleven
components, ten files, both sections satisfied.

**A3. Where does `GitHubPanel` render? — [blocking, Phase 8]**
F1 lists exactly four homepage sections and GitHub is not among them, but F1's rendering note
says the homepage revalidates hourly "because of F5", which places it on the homepage.
*Proposed:* homepage, between Capabilities and Contact, under an eyebrow. See open question 4
for the alternative.

**A4. "The entire row is a link" — [not blocking, Phase 5]**
Wrapping the metric, title, subtitle, period, summary and five stack tags in one `<a>` gives
that link an accessible name roughly forty words long, which is hostile in a screen reader's
link list. *Proposed:* link the title only, and stretch it over the row with an absolutely
positioned `::after`. The whole row stays clickable, the accessible name is just the title.
This is the standard pattern and it will be commented as a deliberate choice.

### B. Defects found in the supplied material

**B1. `muted` fails WCAG AA — [blocking, Phase 2]**
`muted #6D7480` on `paper #F2F3F4` measures **4.24:1**. Section F8 and the design brief both
require 4.5:1 for body text and a Lighthouse accessibility score of 100. `muted` is the colour
of every eyebrow, caption, and metadata line on the site, all at 11–14px, so this is not a
technicality — it is a guaranteed audit failure.

*Proposed:* change the token to **`#676D79`**, which measures **4.68:1** on paper. It is two
steps darker in the same slate hue; side by side the difference is barely perceptible. This
edits a `DESIGN_BRIEF.md` token, which is why it is a question rather than a fix.

Verified as passing, for reference: `ink` 15.9:1, `ink-soft` 9.1:1, `marine` 8.0:1 (focus ring
needs 3:1), white on `marine` 8.9:1.

**B2. `Reveal` hides content when JavaScript does not run — [Phase 5]**
`.reveal { opacity: 0 }` ships in the initial HTML. If the observer never fires — JS disabled,
a hydration error, an old browser — the page is blank to a human while still full of text to a
crawler. *Fix:* add `@media (scripting: none) { .reveal { opacity: 1; transform: none } }` and
never wrap the hero in `Reveal`, so the largest contentful paint is never gated on JS.

**B3. Sticky header eats anchor targets — [Phase 4]**
`/#work` scrolls the `#work` heading underneath the sticky header. *Fix:* `scroll-margin-top`
on anchor targets.

**B4. Skip link focus — [Phase 4]**
`<main id="main">` needs `tabIndex={-1}` for the skip link to reliably move focus in Safari
and Firefox, which is exactly what the Phase 4 acceptance criterion tests.

**B5. `npm run lint` is broken — [Phase 1]**
`package.json` has a `lint` script but the starter has no ESLint dependency and no config, and
`next lint` is deprecated in Next 15. See open question 3.

**B6. `next` is pinned to 15.3.3 — [Phase 1]**
*Default:* move to the latest 15.x patch for the security fixes, staying on 15 as the spec
requires. Not 16 — the spec says 15.

**B7. Enabled button during submit allows double-submit — [Phase 7]**
F3 requires the button stay enabled while pending, which is correct for screen readers but
lets a fast double-click send twice. *Fix:* guard on the pending flag inside the handler,
with a comment saying why the button is not disabled instead.

**B8. Honeypot must not be `type="hidden"` — [Phase 7]**
A hidden input is skipped by many bots and is not what the field is for. *Fix:* a real text
input positioned off-screen with `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`.

**B9. `phone` is in `profile.ts` — [Phase 5]**
*Default:* it is never rendered. A phone number on a public page is a spam magnet; it belongs
on the résumé where a human opens it deliberately. See open question 6.

**B10. "Let's talk." appears twice — [Phase 5]**
`SiteFooter` opens with it and F1's contact section is the same invitation. *Default:* the
homepage contact section owns the line; the footer reduces to links plus the location and
year strip.

**B11. Unused `delay` prop on `Reveal` — [Phase 5]**
Section 5 applies `Reveal` to section entrances only, so nothing staggers. Section 7 forbids
dead code. *Default:* remove the prop unless a use appears.

**B12. Phase 2's temporary token page — [Phase 2, removed Phase 10]**
It has to be re-runnable to be useful, but section 7 forbids leftover scaffolding. *Default:*
build it at `/tokens`, gate it with `if (process.env.NODE_ENV === "production") notFound()`,
exclude it from the sitemap, and delete the file in Phase 10.

**B13. `dynamicParams` — [Phase 6]**
*Default:* `export const dynamicParams = false` so an unknown slug 404s from the static
manifest instead of invoking the page at request time.

### C. Credibility improvements

**C1. The repository has no tests — [blocking, new Phase 9]**
This is the largest single gap. The site's central argument is testing rigour: a 55-test
pytest harness, 100% coverage on two services, 93.75% classification accuracy measured
against a labelled slice. An engineer who opens this repo, believes that, and finds zero
tests has learned something the case studies did not intend to say.

*Proposed:* a small suite over the four pure boundaries — `lib/validation.ts` (schema accepts
and rejects at each edge), `lib/rate-limit.ts` (fourth call in the window is refused, bucket
refills), `lib/hash.ts` (stable, salted, never the raw address), `lib/github.ts` (a malformed
payload narrows to `null`). Fifteen to twenty tests, the parts that are actually worth
testing, no coverage theatre.

Run on **Node's built-in test runner with native TypeScript**, so this adds **zero
dependencies** — `node --test "src/**/*.test.ts"` works as-is on Node 24. Tests import by
relative path since `@/*` is a bundler alias. If type-stripping fights us, the fallback is
`vitest` as one devDependency, which needs a separate yes.

**C2. No CI — [new Phase 9]**
*Proposed:* `.github/workflows/ci.yml` running typecheck, test, and build on every push and
pull request. Zero dependencies, and for someone claiming an infrastructure emphasis a green
check on every commit is worth more than another paragraph saying so.

**C3. Committed SQL migrations rather than `drizzle-kit push` — [Phase 8]**
*Proposed:* `drizzle-kit generate` with the SQL committed under `drizzle/`. Two tables makes
`push` tempting, but "schema design & migrations" is a claim in `profile.skills` and a
reviewer can read a migration file.

**C4. Dynamic Open Graph image instead of a hand-made PNG — [Phase 10]**
Section 6 specifies `public/og.png`. *Proposed:* `src/app/opengraph-image.tsx` using
`next/og`, which ships inside Next and adds no dependency, rendering the hero statement in the
site's own type. It cannot go stale, and it is server-side rendering — the thing the site is
arguing it can do. Cost: one `.ttf` committed for the mono face, because `next/font/google`
does not expose font files to `ImageResponse`. See open question 5.

**C5. Dependencies installed in the phase that first uses them — [all phases]**
Section 2 lists the full dependency set at once. Installing each where it is first used makes
every commit self-contained and every dependency traceable to a feature: Phase 1 `next react
react-dom` + dev deps, Phase 3 `zod`, Phase 7 `resend`, Phase 8 `drizzle-orm
@neondatabase/serverless drizzle-kit`. The final `package.json` matches section 2 exactly.

**C6. `BUILD_SPEC.md` section 0 in a public repository — [Phase 10]**
Section 0 is addressed to an AI agent — "Read this file completely before writing any code",
"Do not invent content". In a repository a hiring manager may open, that framing works against
the site. *Proposed:* keep `DESIGN_BRIEF.md` as-is (it reads as a design document, which is a
credit) and trim `BUILD_SPEC.md` section 0 to a short "how this was built" note before the
repo goes public. Nothing technical is lost.

### D. Small polish

- `alternates.canonical` per route. One line, real SEO value.
- `Content-Disposition: inline` for `/resume.pdf` via `next.config.ts` `headers()`.
- `.gitignore`: add `.vercel`.
- `.env.example`: extend to all six variables in section 5.5; the starter lists three.
- `NEXT_PUBLIC_SITE_URL` falls back to the Vercel deployment URL, not a hardcoded
  `sucharita.dev`, unless that domain is owned (open question 7).
- No `@vercel/analytics`. It is a client script against a sub-100 KB budget, and section 1.5
  is ambiguous about whether it counts as out of scope. Open question 8.
- `x-forwarded-for` parsing takes the first entry with a comment noting it is only trustworthy
  behind Vercel's proxy.
- `IP_HASH_SALT`'s build-time fallback gets a comment stating plainly that a known salt makes
  the hash reversible for an attacker who can guess the address space, so production must set it.

### E. Limits of this environment — read this one

**E1. No browser.** `BUILD_SPEC.md` section 0 rule 7 requires a browser subagent at the end of
every phase to tab through focus states and check three breakpoints. There is no browser
automation tool available in this session. What I will do instead, every phase: run the dev
server, fetch each affected route, and check the rendered HTML for landmark structure, heading
order, `aria-*` attributes, and the responsive classes that govern the 360/768/1440 layouts.
What I cannot do: see it. Every phase document will state exactly what was verified
mechanically and what still needs your eyes, and I will not describe a layout as confirmed
when it was only inferred.

If you want real browser verification, Playwright can be added as a devDependency in Phase 10
— that is open question 9.

**E2. No Lighthouse.** Same reason. Run PageSpeed Insights against the deployed URL in
Phase 10, or Chrome DevTools locally, and paste the numbers — I will fix what they find.

**E3. Vercel and Neon provisioning is yours.** I cannot create the Vercel project, the Neon
database, or the Resend key. The site is built to run with none of them, so this blocks
nothing until Phase 10.

**E4. The sub-100 KB JavaScript budget is not reachable.** Measured, not estimated: the Phase 1
scaffold — one empty page, zero components, zero client code — ships **103 kB gzipped**. That
is `react-dom` plus the App Router runtime and none of it is ours. See open question 4 for the
proposed amendment. I will report the measured number at every phase either way.

## 4. Phase plan

Ten phases. The spec's nine, plus tests and CI inserted as Phase 9. One commit per phase,
including that phase's document. Stop for review after each.

| # | Phase | Builds | Commit |
| --- | --- | --- | --- |
| 1 | Scaffold | Configs, minimal `layout.tsx`/`page.tsx`/`globals.css`, `.env.example`, `git init -b main`, `document/` | `chore: scaffold next 15 with typescript and tailwind v4` |
| 2 | Tokens and type | Full `@theme`, three fonts, base styles, focus ring, reduced motion, gated `/tokens` page | `feat: design tokens, type scale, and base styles` |
| 3 | Content model | `content/profile.ts`, `content/work.ts`, `lib/validation.ts`, `zod` | `feat: content model for profile and case studies` |
| 4 | Layout shell | `SiteHeader`, `SiteFooter`, skip link, `not-found.tsx` | `feat: site header, footer, and skip navigation` |
| 5 | Homepage | Hero, `WorkRow`, `MetricTick`, `StackTags`, `SectionHeading`, `Eyebrow`, `Reveal` wiring | `feat: homepage hero, work index, and capabilities` |
| 6 | Case studies, about | `/work/[slug]`, `/about`, prev/next, per-route metadata | `feat: case study and about pages` |
| 7 | Contact | `lib/hash.ts`, `lib/rate-limit.ts`, `api/contact/route.ts`, `ContactForm`, `resend` | `feat: contact api with validation and rate limiting` |
| 8 | Data and GitHub | `db/`, migrations, `ViewCount`, `recordView`, `lib/github.ts`, `GitHubPanel` | `feat: view counts, submission storage, and github stats` |
| 9 | Tests and CI | `node:test` suites over the four lib boundaries, GitHub Actions workflow | `test: lib unit suites and github actions ci` |
| 10 | Ship | `sitemap.ts`, `robots.ts`, JSON-LD, OG image, `resume.pdf`, README, remove `/tokens`, deploy | `feat: metadata, seo, and production polish` |

### Per-phase protocol

1. Build only what the phase specifies.
2. `npm run typecheck` — must be clean.
3. `npm run build` — must be clean; record the First Load JS number.
4. `node --test` from Phase 9 on.
5. Fetch every affected route from the dev server; inspect the HTML for landmarks, one `h1`,
   heading order, `aria-*`, and the responsive classes.
6. Write `document/PHASE_NN.md`: what was built, every decision and why, every deviation from
   the specs, verification output, and an explicit list of what needs your eyes.
7. One commit with the message above, `document/PHASE_NN.md` included. Push to `main`.
8. Stop.

### Git protocol

`git init -b main`, no other branches. Commit bodies name the spec section satisfied and any
deviation, per section 9's "say why in the commit body". Nothing is pushed until the
repository URL arrives; the first push carries whatever commits exist by then.

## 5. What I will not do

- Write, soften, or extend any prose. The case studies are final. `93.75%`, `60–80%`,
  `3-level`, `55 tests`, `35%` stay exactly as written.
- Add a dependency not listed in section 2 without a yes in writing.
- Build anything in section 1.5's out-of-scope list.
- Report a phase as verified in a way it was not. If I could not see it, the phase document
  says so.

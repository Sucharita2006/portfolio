# Open questions

Fifteen questions. Each has a default I will use if you say nothing, so none of them stall the
build except where marked **blocking**. Answer by number.

---

## Blocking — needed before the phase named

### 1. `muted` fails contrast. Change the token? — needed for Phase 2

`muted #6D7480` on `paper #F2F3F4` measures **4.24:1**. F8 requires 4.5:1 for body text and
Lighthouse accessibility 100. `muted` colours every eyebrow, caption, and metadata line, all
at 11–14px, so this will fail the audit you set as non-negotiable.

- **(a) Change `muted` to `#676D79`** — measures 4.68:1, two steps darker in the same slate
  hue, visually near-identical. Edits one line of `DESIGN_BRIEF.md`. **← recommended**
- (b) Keep `#6D7480` and accept an accessibility score below 100.
- (c) Keep `#6D7480` for decorative use only and introduce a darker token for text — adds a
  token and a rule about which to use where.

### 2. Tests and CI as a new Phase 9? — needed before Phase 9

Adding roughly 18 tests over `validation`, `rate-limit`, `hash`, and `github`, plus a GitHub
Actions workflow running typecheck, test, and build. **Zero new dependencies** — Node 24 runs
TypeScript test files natively.

The reason to do it: the site's argument is that you test things. A reviewer who reads
"55-test pytest harness, 100% coverage" and then finds no tests in the repository they are
looking at draws a conclusion you did not intend.

- **(a) Yes, add Phase 9.** Ten phases total. **← recommended, strongly**
- (b) Yes, but fold the tests into Phases 3, 7, and 8 rather than adding a phase.
- (c) No tests.

If `node --test` with native TypeScript gives trouble, may I add `vitest` as one
devDependency as a fallback? **Default: yes, ask again first.**

### 3. `npm run lint` is broken. Add ESLint or drop the script? — needed for Phase 1

The starter has a `lint` script, no ESLint dependency, no config, and `next lint` is deprecated
in Next 15. As it stands the script fails.

- **(a) Add `eslint` + `eslint-config-next` as devDependencies** with a flat config, wired
  into CI. Two dependencies beyond section 2's list. A code-sample repository with no linter
  reads as an omission. **← recommended**
- (b) Delete the `lint` script. Section 7 only requires typecheck and build.

### 4. The sub-100 KB JavaScript budget is not reachable. Amend it? — needed for Phase 10

Section 1.6 sets a ceiling of 100 KB gzipped of client JavaScript. **Measured on the Phase 1
scaffold — an empty page, no components, no client code at all — the shared bundle is
103 kB gzipped.** Verified rather than assumed: Next reports gzipped figures, and gzipping the
emitted chunks by hand agrees to within 300 bytes (46,581 B and 54,235 B against the reported
46.3 kB and 54.2 kB).

That 103 kB is `react-dom` plus the App Router runtime. There is nothing in it belonging to
this site, and no way to shrink it while the spec requires Next 15 with the App Router. Three
client components will add roughly 3–6 kB on top.

- **(a) Amend section 1.6 to "under 115 KB gzipped, of which under 10 KB is site code."**
  That is the honest version of the same discipline, it is a number you can defend in an
  interview, and it still rules out the animation library and the icon package. **← recommended**
- (b) Keep 100 KB as an aspiration and record the miss in the Phase 10 document.
- (c) Drop the App Router for the Pages Router, which has a smaller floor. Not recommended —
  it costs the server components that F1 and F5 are built on, which is most of the site's
  technical argument.

### 5. Where does the GitHub panel go? — needed for Phase 8

F1 lists four homepage sections and GitHub is not one of them, but F1 says the homepage
revalidates hourly "because of F5".

- **(a) Homepage, between Capabilities and Contact.** Matches the revalidation note. Costs
  ~120px of a page whose job is a 30-second read. **← recommended**
- (b) `/about`, after education and awards. Supplementary content in a supplementary place;
  the homepage stays tight. The homepage then does not need hourly revalidation.
- (c) Both.

---

## Non-blocking — a default is stated, tell me if it is wrong

### 6. Open Graph image: dynamic or static?

- **(a) Dynamic** — `src/app/opengraph-image.tsx` via `next/og`, which is inside Next already.
  Renders the hero statement in the site's own type, cannot go stale, and is server-side
  rendering. Costs one committed `.ttf` (~90 KB) because `next/font/google` does not hand font
  files to `ImageResponse`. **← default**
- (b) Static `public/og.png` exactly as section 6 specifies. I would design and generate it;
  it needs a manual redo if the hero copy ever changes.

### 7. Is `profile.phone` ever rendered?

**Default: no.** A phone number on a public page collects spam calls. It stays on the résumé,
which a human opens deliberately. Say so if you want it on `/about`.

### 8. Do you own `sucharita.dev`?

`layout.tsx` falls back to `https://sucharita.dev` for `metadataBase`, which drives every
canonical URL, the sitemap, and OG tags. If the domain is not yours, that fallback is wrong in
a way search engines act on.

**Default:** fall back to `VERCEL_PROJECT_PRODUCTION_URL`, then `localhost:3000`. Tell me the
real domain when you have it and it becomes the default.

### 9. Vercel Analytics?

Section 1.5 rules out "analytics beyond Vercel's built-in", which could mean either. Vercel Web
Analytics needs the `@vercel/analytics` client script.

**Default: none.** It is a client-side script against a JavaScript budget that is already at
its floor, and it is one more third-party request on a page whose selling point is that it is
fast. Vercel's server-side request logs are free and need no code.

### 10. Playwright for real browser verification in Phase 10?

I cannot see the site. Playwright as a devDependency would let me check focus rings, tab order,
and the three breakpoints for real, and produce screenshots.

Cost: one devDependency plus a ~150 MB browser download, and it never runs in production.

**Default: no** — you check it visually and I fix what you report. Say the word and I add it.

### 11. Résumé PDF

`public/resume.pdf` is referenced from the header, the footer, and `/about`, and does not
exist. Until it does, three links 404.

**Default:** I build the links as specified and Phase 10 lists the missing file as a blocker on
"done". Drop the PDF at `d:\portfolio_final\public\resume.pdf` whenever it is ready.

---

## Content checks — please confirm, I will not change these myself

### 12. Contact email address

`profile.ts` has `sucharita.chatterjee100@gmail.com`. Your account here is
`sahilsahu7978@gmail.com`. The first is what the site will publish and where the contact form
delivers. Confirm it is right.

### 13. `github.com/Sucharita2006`

F5 fetches this account server-side, and two case studies link to
`Sucharita2006/LegiTrack-AI` and `Sucharita2006/PayFlow`. If either repository is private the
link 404s for a visitor. Confirm both are public, or the links come out.

### 14. Open Paws tense

`work.ts` gives the period as "May – Jul 2026". Today is 30 July 2026, so it is ending now or
just ended. `profile.aboutParagraphs` says "The summer of 2026 I spent as an AI engineer
intern" — past tense. If the role is still active, that sentence and the period both want
adjusting. **This is prose, so I will not touch it without your words.**

### 15. Résumé link label

Header and footer use `Résumé` with the accent. Keeping it — just flagging it is deliberate,
since the mono wordmark plus this is what will overflow first at 360px.

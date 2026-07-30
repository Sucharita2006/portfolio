# Open questions

Fifteen questions. Each has a default I will use if you say nothing, so none of them stall the
build except where marked **blocking**. Answer by number.

**Answered in review, 30 July 2026:** 1 (a), 2 (a), 3 (a), 4 (a), 5 (b), 11 supplied, 12
confirmed, 13 both public, 14 role completed. Questions 6–10 and 15 are running on their
stated defaults until told otherwise.

**New, opened after reading the résumé:** 16 (two case studies are missing the section the
spec calls mandatory) and 17 (VERDE's `kind`). Question 16 is blocking Phase 6.

---

## Blocking — needed before the phase named

### 1. `muted` fails contrast. Change the token? — **resolved: (a)**

`muted #6D7480` on `paper #F2F3F4` measures **4.24:1**. F8 requires 4.5:1 for body text and
Lighthouse accessibility 100. `muted` colours every eyebrow, caption, and metadata line, all
at 11–14px, so this will fail the audit you set as non-negotiable.

- **(a) Change `muted` to `#676D79`** — measures 4.68:1, two steps darker in the same slate
  hue, visually near-identical. Edits one line of `DESIGN_BRIEF.md`. **← recommended**
- (b) Keep `#6D7480` and accept an accessibility score below 100.
- (c) Keep `#6D7480` for decorative use only and introduce a darker token for text — adds a
  token and a rule about which to use where.

### 2. Tests and CI as a new Phase 9? — **resolved: (a)**

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

### 3. `npm run lint` is broken. Add ESLint or drop the script? — **resolved: (a)**

The starter has a `lint` script, no ESLint dependency, no config, and `next lint` is deprecated
in Next 15. As it stands the script fails.

- **(a) Add `eslint` + `eslint-config-next` as devDependencies** with a flat config, wired
  into CI. Two dependencies beyond section 2's list. A code-sample repository with no linter
  reads as an omission. **← recommended**
- (b) Delete the `lint` script. Section 7 only requires typecheck and build.

### 4. The sub-100 KB JavaScript budget is not reachable. Amend it? — **resolved: (a)**

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

**Resolved as (a).** The answer given was "use whatever is available on a free tier". Noting
for the record that this budget is not a hosting-tier limit — Vercel's free tier imposes no
JavaScript ceiling, and the 103 kB is React plus the App Router runtime, identical on every
tier. Read as "take what the framework gives and don't pad it", which is (a): section 1.6
becomes **under 115 KB gzipped, of which under 10 KB is site code**. Every phase document
reports the measured number. Say so if you meant something else.

### 5. Where does the GitHub panel go? — **resolved: (b), `/about`**

F1 lists four homepage sections and GitHub is not one of them, but F1 says the homepage
revalidates hourly "because of F5".

- **(a) Homepage, between Capabilities and Contact.** Matches the revalidation note. Costs
  ~120px of a page whose job is a 30-second read. **← recommended**
- (b) `/about`, after education and awards. Supplementary content in a supplementary place;
  the homepage stays tight. The homepage then does not need hourly revalidation.
- (c) Both.

**Consequence of (b):** the homepage no longer has an hourly-revalidating dependency, so it
becomes fully static with no `revalidate` at all, and `/about` takes `export const revalidate =
3600`. F1's "static, revalidated hourly (because of F5)" is amended to plain static.

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

### 11. Résumé PDF — **resolved, supplied**

`public/resume.pdf` is referenced from the header, the footer, and `/about`, and does not
exist. Until it does, three links 404.

**Default:** I build the links as specified and Phase 10 lists the missing file as a blocker on
"done". Drop the PDF at `d:\portfolio_final\public\resume.pdf` whenever it is ready.

---

## Content checks — please confirm, I will not change these myself

### 12. Contact email address — **resolved**

**Resolved.** `sucharita.chatterjee100@gmail.com`. Confirmed twice over: it is the address on
the résumé, and it is the author of the `Initial commit` already on the remote. Also now set as
this repository's local `user.email`, replacing the malformed `sucharita.chatterjee100@.com`
that would have broken commit attribution.

### 13. `github.com/Sucharita2006` — **resolved**

**Resolved: both public.** Links stay as written. Note that PayFlow has a source link only and
no live URL, which matches the résumé — nothing missing there.

### 14. Open Paws tense — **resolved**

**Resolved: the role is completed.** The past tense already in `aboutParagraphs` is therefore
correct, and "May – Jul 2026" is correct for a finished internship. No change made — the
supplied prose was right.

### 15. Résumé link label

Header and footer use `Résumé` with the accent. Keeping it — just flagging it is deliberate,
since the mono wordmark plus this is what will overflow first at 360px.

---

## Opened after reading the résumé, 30 July 2026

### 16. Two case studies are missing the section the spec calls mandatory — **blocking Phase 6**

`BUILD_SPEC.md` F2: *"Each case study includes a section named 'The part that was actually
hard'. That section is the reason the page exists — it is the only place on the site where
engineering judgement is visible rather than asserted. It must not be cut for length."*

Audited all four:

| Case study | Sections | "The part that was actually hard" |
| --- | --- | --- |
| `open-paws` | 4 | present |
| `legitrack-ai` | 4 | present |
| `payflow` | 3 | **missing** |
| `verde` | 2 | **missing** |

So half the case studies are missing the thing the spec identifies as the whole point of the
page. VERDE is also the thinnest entry at two sections against the others' four.

I will not write these. Not because of a rule, but because what was actually hard is knowledge
only you have — the résumé tells me what you built, not what fought back. Anything I invented
here would be exactly the "clever abstraction she did not ask for" that section 9 warns is a
liability in an interview.

- **(a) You write both**, two or three paragraphs each, in the register of the two that exist.
  Best outcome. **← recommended**
- (b) I draft from résumé facts — PayFlow's three-level chain and Redis config cache, VERDE's
  150+ combinations and zero-downtime deploys — and you correct or rewrite. Faster, but you
  must read every line critically before it ships.
- (c) Ship both without the section, as a deliberate exception recorded in the Phase 6
  document.

### 17. Is VERDE a project or a role?

`work.ts` has `kind: "project"` with `org: "AARC — Code for Compassion"`. The résumé lists it
under **Experience** as *"Web Developer (Selected Program Participant), Feb 2026 – Mar 2026"*.

`kind` is not rendered anywhere in F1 or F2, so nothing changes visually today — but the two
documents disagree, and a reader with both open may notice.

**Default: leave it as `"project"`** and change nothing, since the field is unused. Say the
word if you would rather it read as a role, which would also mean giving it a role-style
subtitle like the Open Paws entry has.

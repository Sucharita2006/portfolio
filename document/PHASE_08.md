# Phase 8 — Database, view counts, and GitHub stats

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 8 · F4 · F5 · section 5.2
**Commit:** `feat: view counts, submission storage, and github stats`
**Date:** 30 July 2026

---

## Files

| File | Change |
| --- | --- |
| `src/db/schema.ts` | Added. Two tables |
| `src/db/index.ts` | Added. Connection, `null` without `DATABASE_URL` |
| `src/lib/views.ts` | Added. Read and increment |
| `src/lib/github.ts` | Added. Stats fetch, narrowed at the boundary |
| `src/app/work/[slug]/actions.ts` | Added. `recordView` server action |
| `src/components/view-count.tsx` | Added. Third and final client component |
| `src/components/github-panel.tsx` | Added. Server component |
| `drizzle.config.ts`, `drizzle/0000_*.sql` | Added. Committed migration |
| `src/app/api/contact/route.ts` | Submission persistence |
| `src/app/work/[slug]/page.tsx`, `src/app/about/page.tsx` | Wiring, `revalidate = 3600` |

## Decisions

**How F2 and F4 were reconciled.** They contradict: F2 wants a statically generated page, F4
wants that page to record a visit. The count is read during generation and passed down as a
prop; the only thing that happens in the browser is one fire-and-forget call to a server action.
The page stays static with `revalidate = 3600`, so the number is at most an hour stale — which
nobody can perceive on a view counter, and the alternative is a database round trip on every
request to a page otherwise served from cache.

**`ViewCount` is the third client component, which section 6 says to stop and ask about.** It is
in section 4's inventory, and the reason it must be a client component is structural rather
than stylistic: nothing running at build time can record a visit that has not happened yet. It
contains no fetching, no state, and no loading UI.

**The server action re-checks the slug.** A server action is a public POST endpoint, so `slug`
is untrusted input even though the only caller is our own component. Validating it against the
content array is the difference between a view counter and an open write endpoint.

**The increment is one SQL statement.** `INSERT … ON CONFLICT DO UPDATE SET count = count + 1`.
Two readers arriving together cannot lose a count between a read and a write, because the
addition happens inside the database rather than in this process.

**Views are recorded below the display threshold, only the display waits.** Hiding under 25
means a new page never advertises "3 views"; counting from the first visit means the number is
right when it does appear.

**`pageViews` is keyed on the slug, not a serial id.** There is exactly one row per slug by
definition. A surrogate key would add a column, an index, and a uniqueness constraint to express
what the natural key already says.

**Submissions are stored after the delivery attempt, with the outcome.** Section 5.2's stated
purpose is that a message is not lost to an *email delivery failure* — which is something this
code catches and then records. It does not survive the process dying mid-send; that would need a
write before the attempt and another after, two round trips on every submission to insure
against something that has not happened. The trade is written in the file.

**A storage failure never changes what the sender is told.** The message may already have been
delivered; reporting failure because a row did not insert would be a lie.

**GitHub is narrowed at the boundary and fails silently.** Every field is checked before use, a
repository missing name/url/pushed date is dropped rather than rendered as blanks, and any
failure returns `null` so the section does not render. F5: no spinner, no error state. A section
that apologises for itself is worse than a section that is not there.

**Migrations are generated and committed, not `push`ed.** Two tables makes `push` tempting, but
"schema design & migrations" is a claim on the CV and a reviewer can read a migration file.

## The 66 kB regression, and the guard that now prevents it

`/work/[slug]` went from 106 kB to **173 kB** — a 67 kB jump on a phase that was supposed to add
about 3 kB of client code.

The cause was one import. `ViewCount` is a client component, and it imported
`VIEW_DISPLAY_THRESHOLD` — a single number — from `@/lib/views`. That module imports the Drizzle
client, which imports the Neon driver. Webpack followed the graph and shipped the entire
database layer to the browser: chunk `92`, **66.1 kB gzipped**, referenced in the initial HTML
of every case study page.

Two things about this are worth stating plainly. First, **nothing failed.** Typecheck passed,
lint passed, the build passed, every page rendered correctly. The only symptom was a number in
the build output. Second, my first diagnosis was wrong — I looked in the route's page chunk,
found it was 852 bytes with no Drizzle in it, and had to go looking through every chunk to find
where the weight actually was. `"use server"` stops the *action's* code crossing the boundary;
it does nothing for an ordinary named export sitting in the same module as server-only imports.

The fix was to move the constant into the component. 173 kB → **107 kB**.

Then, because the failure mode was silence, `src/db/index.ts` now begins with
`import "server-only"`. That turns this class of mistake into a build error.

**The guard was verified rather than assumed.** I reintroduced the exact bad import and rebuilt:

```
Failed to compile.
Error: You're importing a component that needs "server-only".
       That only works in a Server Component…
> Build failed because of webpack errors
```

Then removed it and confirmed the build passes again. A safeguard nobody has watched fail is not
a safeguard.

**This is a dependency beyond section 2's list** — `server-only`, which contains no runtime code
and exists only to make this boundary enforceable. Given it just caught a 66 kB silent
regression, I think it earns its place, but it is an addition and it is flagged as one.

## Verification

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean.

**Initial JS, measured from the served HTML** — all inside the 115 kB budget:

| Route | Before this phase | After the leak | Now |
| --- | --- | --- | --- |
| `/` | 106.4 kB | 106.4 kB | **106.4 kB** |
| `/about` | 106.4 kB | 106.4 kB | **106.4 kB** |
| `/work/[slug]` | 104.8 kB | 170.6 kB | **105.3 kB** |

No client chunk anywhere in the build contains `neondatabase` or `pg-core`.

**With no `DATABASE_URL` and no `GITHUB_TOKEN` — the fresh-clone configuration:**

| Check | Result |
| --- | --- |
| `/`, `/about`, `/work/open-paws` | all 200 |
| Case study content renders | yes |
| View counter | renders nothing, as specified |
| `/about` landmarks and headings | h1 1, h2 3, h3 3 |

**The GitHub panel works against the live API, unauthenticated.** Fetched at build:

```
8 public repositories · 0 followers · @Sucharita2006
  portfolio                   TypeScript · pushed 30 Jul 2026
  PayFlow                     TypeScript · pushed 10 Jul 2026
  Email-Outreach-Automation   Python     · pushed 30 May 2026
```

That also confirms question 13 from the other direction: `PayFlow` is public and reachable. The
first entry is this repository, which is a pleasing accident rather than a design.

**Migration** generated to `drizzle/0000_lush_joystick.sql`, matching section 5.2 column for
column — `contact_submissions` with 8 columns, `page_views` with 3, both timestamps
`with time zone`.

## What is still unverified

**The connected path.** Everything above tests the degraded path. That views actually increment
and submissions actually persist has *not* been demonstrated, because there is no database yet.
Setup steps are in the accompanying message; once `DATABASE_URL` is in `.env.local`, this is
what needs confirming:

1. `npm run db:migrate` creates both tables.
2. Loading a case study inserts a row in `page_views` and a reload increments it.
3. Submitting the contact form inserts a row in `contact_submissions` with `email_sent` false
   (no Resend key) and an `ip_hash` that is a 64-character hex string, not an address.
4. Setting a page's count above 25 makes the counter appear.

## Needs your eyes

1. **`/about`, bottom of the page** — the GitHub section, with three real repositories.
2. **A case study, scrolled to the end.** The counter is invisible until a database exists and
   the count passes 25, so an empty space there is correct for now.
3. **Whether `0 followers` should be shown at all.** It is honest and it is real, and a reader
   may still read it as a weaker signal than showing nothing. One line to drop if you prefer.

## Not done in this phase, by design

Tests and CI (Phase 9); sitemap, robots, JSON-LD, the OG image, README and deployment
(Phase 10).

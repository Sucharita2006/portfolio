# Build specification — Portfolio site

**Owner:** Sucharita Chattopadhyay
**Companion document:** `DESIGN_BRIEF.md` (visual system — read it too)
**Status:** ready to build

---

## 0. How the agent should use this document

Read this file completely before writing any code. Then read
`DESIGN_BRIEF.md`. Do not begin implementation until both are read.

**Rules of engagement:**

1. **Work phase by phase.** Section 8 defines nine phases. Complete one phase,
   stop, and let the owner review before starting the next. Do not run ahead.
2. **One commit per phase**, using the message given in that phase. Do not
   squash phases together and do not commit the whole project at once.
3. **This document is the source of truth for behaviour.
   `DESIGN_BRIEF.md` is the source of truth for appearance.** If a request in
   chat conflicts with either document, say so and ask rather than silently
   choosing.
4. **Do not invent content.** All copy, project descriptions, metrics, and
   biography live in `src/content/`. If a page needs text that isn't there,
   stop and ask the owner. Never write a placeholder claim about her
   experience, never generate a fake metric, never write filler prose about her
   skills.
5. **Do not add dependencies** beyond those listed in section 2 without asking.
   No UI kit, no animation library, no icon package, no state manager.
6. **The owner must be able to explain every line.** Prefer the obvious
   implementation over the clever one. When a non-obvious technique is
   genuinely warranted, add a short comment explaining why — not what.
7. **Use the browser subagent at the end of each phase.** Load the affected
   route, tab through every interactive element to verify focus states, and
   check the layout at 360px, 768px, and 1440px. Report what you saw.
8. **After each phase, run `npm run typecheck` and `npm run build`.** A phase
   isn't done until both pass clean.

**What "done" means for this project:** a hiring manager opens the site on a
phone, understands within thirty seconds what this person builds, and can open
the repository and read code that looks like an engineer wrote it deliberately.

---

## 1. Project overview and scope

### 1.1 What this is

A personal portfolio and case-study site for a computer science undergraduate
applying to software engineering internships and new-grad roles, with a backend
and infrastructure emphasis.

The site is itself part of the application. Recruiters will read the deployed
page; engineers will open the repository. It therefore has two jobs at once: it
must communicate the work clearly, and it must be defensible as a code sample.

### 1.2 Primary audience

Engineering hiring managers and technical recruiters, screening quickly.
Secondary audience: engineers on an interview panel who open the repo before a
call.

### 1.3 Goals

- Communicate four pieces of real work with enough technical depth that a
  reader can evaluate engineering judgement, not just a list of tools.
- Demonstrate server-side competence in the site's own construction — the site
  should not be a static page pretending to be an application.
- Load fast, work on a phone, and stay fully usable with a keyboard.
- Look designed rather than templated. See `DESIGN_BRIEF.md` section "Do not
  build".

### 1.4 In scope

- Four routes: home, about, per-project case study, plus a résumé PDF
- A contact form backed by a real API route with validation and rate limiting
- Live GitHub statistics fetched server-side and cached
- Per-case-study view counters
- SEO metadata, Open Graph tags, sitemap, robots
- Deployment to Vercel from GitHub

### 1.5 Out of scope

Do not build any of these, even if they seem like a natural addition:

- A blog or CMS
- Authentication or any admin interface
- Dark mode toggle (the palette is designed for light; a rushed dark variant
  looks worse than none)
- Comments, likes, reactions, guestbook
- Analytics beyond Vercel's built-in
- Internationalisation
- A chatbot that answers questions "as Sucharita"
- Any three-dimensional or canvas-based hero graphic

### 1.6 Constraints

- Must deploy on Vercel's free tier
- Must run locally with zero environment variables configured
- Total JavaScript shipped to the client should stay under 100 KB gzipped
- No client-side data fetching on initial render

---

## 2. Tech stack

| Layer | Choice | Why this and not the alternative |
| --- | --- | --- |
| Framework | Next.js 15, App Router | Server components mean the content and GitHub stats render on the server with no client fetch. Also the framework the owner already uses professionally. |
| Language | TypeScript, `strict: true` | The repo is a code sample. Untyped JavaScript undercuts the claim. |
| Styling | Tailwind CSS v4 | CSS-first config via `@theme` keeps design tokens in one file rather than split between a JS config and a stylesheet. |
| Fonts | `next/font/google` — Fraunces, IBM Plex Sans, IBM Plex Mono | Self-hosted at build time, no layout shift, no external request. |
| Validation | zod | Shared schema between the client form and the API route — one definition, two consumers. |
| Database | Neon Postgres + Drizzle ORM | Only for view counts and contact submissions. Serverless-friendly, and Drizzle's schema is readable as documentation. |
| Rate limiting | In-memory token bucket, upgradeable to Upstash Redis | Honest default. See section 5.3 — the limitation is documented rather than hidden. |
| Email | Resend | Simple API, generous free tier, degrades gracefully when unconfigured. |
| Hosting | Vercel | First-class Next.js support, atomic deploys, preview URLs per branch. |

**Dependencies, complete list:**

```
next react react-dom zod resend drizzle-orm @neondatabase/serverless
```

**Dev dependencies:**

```
typescript @types/node @types/react @types/react-dom
tailwindcss @tailwindcss/postcss drizzle-kit
```

Nothing else. No `framer-motion` — the two animations in this design are eight
lines of CSS. No icon library — the site uses four icons at most, inline as
SVG. No `clsx` — template literals are sufficient at this size.

---

## 3. Feature specifications

### F1 — Homepage

**Route:** `/`
**Rendering:** static, revalidated hourly (because of F5)

Sections in order:

1. **Hero.** Two-line display statement from `profile.heroLead` and
   `profile.heroTrail`, one body paragraph from `profile.heroBody`, and a row
   of three facts from `profile.facts` set in mono. No photo, no buttons, no
   call-to-action pair. The statement is the call to action.
2. **Selected work.** An eyebrow label, then four rows from `content/work.ts`.
   Each row: metric column on the left (see Signature in the design brief),
   then title, subtitle, period, one-line summary, and up to five stack tags.
   The entire row is a link to `/work/[slug]`. Rows are separated by hairlines,
   not wrapped in cards.
3. **Capabilities.** Six groups from `profile.skills` as headed lists. Plain
   text. No bars, no percentages, no logos, no icons.
4. **Contact.** The form from F3, with the alternative channels beside it.

Acceptance: a reader who scrolls the homepage and opens nothing else knows what
she builds, where she's worked, and how to reach her.

### F2 — Case study pages

**Route:** `/work/[slug]`
**Rendering:** static via `generateStaticParams`

Reads `getWork(slug)` from `content/work.ts`. Calls `notFound()` for an unknown
slug. Implements `generateMetadata` so each page has its own title and
description.

Page structure: back link, metric and period, display title, subtitle, summary,
external links (live site and source, when present), full stack list, then the
`sections` array rendered as heading plus paragraphs. Ends with previous/next
navigation between case studies and the view counter from F4.

Each case study includes a section named "The part that was actually hard".
That section is the reason the page exists — it is the only place on the site
where engineering judgement is visible rather than asserted. It must not be cut
for length.

### F3 — Contact form

**Client:** `src/components/contact-form.tsx`
**Server:** `POST /api/contact`

Fields: name, email, message, plus a hidden `website` honeypot field.

Behaviour:

- Validates on the client against the shared zod schema before sending, so
  errors appear without a round trip
- Submits as JSON; the button enters a pending state and is not disabled
- Success replaces the form with a confirmation; failure shows the reason and
  keeps what was typed
- Never use a raw `<form action>` post — this is a JSON API

Server behaviour is specified in section 5.3.

### F4 — View counters

Each case study records a view and displays the total. Increment happens in a
server action, fire-and-forget, and a failure must never break the page — wrap
it and swallow. Display as `1,284 views` in mono; hide entirely below 25 views
so a new page doesn't advertise `3 views`.

### F5 — GitHub statistics

Server-side fetch of the GitHub REST API for `Sucharita2006` at build and on
revalidation (`next: { revalidate: 3600 }`). Displays public repository count,
followers, and the three most recently pushed repositories with language and
description.

Must fail silently. If GitHub is down, rate-limits, or returns an unexpected
shape, the section does not render and the rest of the page is unaffected.
Never render a spinner or an error state for this — it is supplementary.

### F6 — Résumé

`public/resume.pdf`, linked from the header, footer, and about page. Set
`Content-Disposition: inline` so it opens in the browser rather than
downloading.

### F7 — SEO and metadata

Per-route `title` and `description`. Open Graph and Twitter card tags.
`app/sitemap.ts` and `app/robots.ts` generated from the work array. A
`Person` JSON-LD block on the homepage with `name`, `url`, `sameAs`
(GitHub, LinkedIn), `alumniOf`, and `knowsAbout`.

### F8 — Accessibility

Non-negotiable, verified before the project is called finished:

- Every interactive element has a visible focus ring (`marine`, 2px, 3px
  offset)
- Skip-to-content link, revealed on focus
- Landmarks: one `<header>`, one `<main>`, one `<footer>`, one `<h1>` per page
- Colour contrast at least 4.5:1 for body text, 3:1 for large text
- `prefers-reduced-motion` disables both animations
- Form inputs have real `<label>` elements, not placeholder-only labelling
- Errors are announced via `aria-live="polite"`
- Lighthouse accessibility score of 100

---

## 4. Frontend specification

The complete visual system is in `DESIGN_BRIEF.md`. Condensed here so this
document stands alone:

**Palette.** `paper #F2F3F4`, `paper-raised #FBFBFC`, `ink #101319`,
`ink-soft #3B414C`, `muted #6D7480`, `rule #DCDEE2`, `rule-strong #C3C7CD`,
`marine #243FA8`, `marine-soft #E6E9F6`. Cool, near-monochrome, one accent.
`marine` is reserved for links, focus rings, and metric ticks — it never fills
a block.

**Type.** Fraunces for display only (`SOFT 0, WONK 1, opsz 120`). IBM Plex Sans
for body. IBM Plex Mono for metrics, eyebrows, and the header wordmark. Scale:
hero 3.5–5rem fluid, section heads 1.75rem, body 1rem at 1.65 line height,
eyebrow 0.6875rem uppercase with 0.14em tracking.

**Layout.** Max content width 64rem, page padding 1.5rem rising to 2.5rem at
large sizes. Left-aligned throughout; nothing is centred below the hero.
Sections separated by hairline rules and roughly 6rem of vertical space.

**Signature element.** Work items are indexed by their own hardest metric —
`100%`, `60–80%`, `3-level`, `150+` — in mono against a short hairline tick,
not by `01 / 02 / 03`. The projects are not a sequence; numbering them would be
decoration imitating structure. This is the one memorable device on the page.
Keep everything around it quiet.

**Motion.** Exactly two. A fade with 14px rise on scroll entrance (520ms,
`cubic-bezier(0.22, 0.61, 0.36, 1)`), and a link underline growing from the
left on hover (220ms). Both disabled under `prefers-reduced-motion`. Add
nothing further.

**Component inventory.** `SiteHeader`, `SiteFooter`, `Reveal`, `WorkRow`,
`MetricTick`, `SectionHeading`, `Eyebrow`, `StackTags`, `ContactForm`,
`ViewCount`, `GitHubPanel`. Eleven components. If you find yourself creating a
twelfth, ask first.

**Responsive.** Single column below 768px. The metric column stacks above the
title rather than shrinking. Test at 360px — the header wordmark is a full
name and will be the first thing to overflow.

---

## 5. Data models

### 5.1 Content types

Already defined in `src/content/`. Do not modify these shapes without asking.

```ts
type WorkKind = "role" | "project";

type Section = {
  heading: string;
  body: string[];
};

type WorkItem = {
  slug: string;
  title: string;
  subtitle: string;
  kind: WorkKind;
  org?: string;
  period: string;
  metric: { value: string; label: string };  // the signature element
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];
  sections: Section[];
};
```

`profile` in `src/content/profile.ts` is a `const` object exported with its
inferred type. Read fields from it; never hardcode a name, email, or number
into a component.

### 5.2 Database schema

Two tables. Drizzle definitions in `src/db/schema.ts`.

```ts
// Contact submissions. Retained so a message is never lost to an email
// delivery failure.
contactSubmissions {
  id          serial      primary key
  name        text        not null
  email       text        not null
  message     text        not null
  ipHash      text        not null   // sha256(ip + salt), never the raw address
  userAgent   text
  emailSent   boolean     not null default false
  createdAt   timestamp   not null default now()
}

// One row per case study, incremented on view.
pageViews {
  slug        text        primary key
  count       integer     not null default 0
  updatedAt   timestamp   not null default now()
}
```

Store a salted hash of the IP address, not the address itself. It is needed for
abuse investigation and nothing else, and storing the raw value is a liability
with no upside.

Both features must degrade when `DATABASE_URL` is absent: the contact route
skips persistence and still attempts delivery; the view counter returns null
and renders nothing. The site runs with no database configured.

### 5.3 API contract

```
POST /api/contact
Content-Type: application/json

Request:
  { name: string, email: string, message: string, website?: string }

Constraints (zod, shared with the client):
  name     2–100 characters, trimmed
  email    valid address, max 200
  message  20–4000 characters, trimmed
  website  must be empty — honeypot

Responses:
  200  { ok: true }
  400  { ok: false, error: string, fields?: Record<string, string> }
  429  { ok: false, error: "Too many messages. Try again in an hour." }
  500  { ok: false, error: "Message couldn't be sent. Email directly at …" }
```

Rate limit: 3 submissions per IP per hour, token bucket keyed on the hashed IP.

The in-memory implementation resets on cold start and is per-instance, so it is
not a real limit across a serverless fleet. **Write that in a comment in the
file.** It is adequate for a portfolio's traffic, and a reader who notices the
limitation should find that you noticed it first. Leave a documented upgrade
path to Upstash Redis.

Honeypot handling: if `website` is non-empty, return `200 { ok: true }` without
sending anything. A bot that gets an error learns to try again.

### 5.4 GitHub response shape

Narrow the API response to only what is used, and validate at the boundary:

```ts
type GitHubStats = {
  publicRepos: number;
  followers: number;
  recent: { name: string; description: string | null;
            language: string | null; url: string; pushedAt: string }[];
} | null;   // null on any failure — callers render nothing
```

### 5.5 Environment variables

All optional. The site runs with none of them.

| Variable | Effect when absent |
| --- | --- |
| `DATABASE_URL` | No persistence, no view counts. Site works. |
| `RESEND_API_KEY` | Contact form logs to the server console instead of emailing. |
| `CONTACT_TO_EMAIL` | Falls back to the address in `profile.ts`. |
| `GITHUB_TOKEN` | 60 requests/hour instead of 5000. Fine at hourly revalidation. |
| `NEXT_PUBLIC_SITE_URL` | Metadata falls back to a default origin. |
| `IP_HASH_SALT` | A build-time constant is used. Set it in production. |

---

## 6. Repository structure

```
portfolio/
├── DESIGN_BRIEF.md
├── BUILD_SPEC.md              this file
├── README.md
├── .env.example
├── .gitignore
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── drizzle.config.ts
├── package.json
├── public/
│   ├── resume.pdf
│   └── og.png
└── src/
    ├── app/
    │   ├── layout.tsx          fonts, metadata, skip link, header, footer
    │   ├── globals.css         @theme tokens and base styles
    │   ├── page.tsx            homepage
    │   ├── not-found.tsx
    │   ├── sitemap.ts
    │   ├── robots.ts
    │   ├── about/
    │   │   └── page.tsx
    │   ├── work/
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   └── api/
    │       └── contact/
    │           └── route.ts
    ├── components/
    │   ├── site-header.tsx
    │   ├── site-footer.tsx
    │   ├── reveal.tsx          client — intersection observer
    │   ├── work-row.tsx
    │   ├── metric-tick.tsx
    │   ├── section-heading.tsx
    │   ├── stack-tags.tsx
    │   ├── contact-form.tsx    client
    │   ├── view-count.tsx
    │   └── github-panel.tsx
    ├── content/
    │   ├── profile.ts          bio, facts, skills, education, awards
    │   └── work.ts             four case studies
    ├── db/
    │   ├── index.ts            connection, null when DATABASE_URL absent
    │   └── schema.ts           drizzle tables
    └── lib/
        ├── github.ts           stats fetch, revalidate 3600
        ├── rate-limit.ts       token bucket
        ├── hash.ts             salted IP hashing
        └── validation.ts       shared zod schemas
```

Server components by default. Only `reveal.tsx` and `contact-form.tsx` carry
`"use client"`. If a third client component appears, that is a signal something
is being done on the client that belongs on the server — stop and ask.

---

## 7. Definition of done

Before the project is considered finished:

- `npm run build` and `npm run typecheck` pass with no errors or warnings
- Lighthouse on the deployed homepage: performance ≥ 95, accessibility 100,
  best practices 100, SEO 100
- Every route reachable and correct at 360px, 768px, and 1440px
- Full keyboard traversal of every page with a visible focus ring throughout
- The contact form succeeds with valid input and shows a useful message on
  every failure path
- The site runs correctly from a fresh clone with an empty `.env.local`
- No `TODO`, no commented-out code, no `console.log` outside deliberate
  server-side logging
- No text anywhere on the site that the owner did not write or approve

---

## 8. Phase-by-phase build plan

Nine phases. Complete one, verify against its acceptance criteria, commit with
the given message, then stop for review.

### Phase 1 — Scaffold

Initialise Next.js 15 with TypeScript, App Router, and `src/`. Configure
Tailwind v4 via PostCSS. Add `tsconfig` path alias `@/*`. Add scripts,
`.gitignore`, `.env.example`. Verify `npm run dev` serves the default page.

*Acceptance:* dev server runs, `npm run build` passes, repository initialised.
*Commit:* `chore: scaffold next 15 with typescript and tailwind v4`

### Phase 2 — Design tokens and typography

Write `globals.css` with the `@theme` block from section 4. Load the three
fonts in `layout.tsx` via `next/font/google` with CSS variables. Add base
styles, the `.font-display` variation settings, focus ring, selection colour,
and the reduced-motion block. Build a temporary page rendering the type scale
and every colour token to check them in the browser.

*Acceptance:* Fraunces renders with the correct variation axes; every token
resolves; focus ring is visible on a test link.
*Commit:* `feat: design tokens, type scale, and base styles`

### Phase 3 — Content model

Add `src/content/profile.ts` and `src/content/work.ts` (both supplied — do not
rewrite the prose). Add `src/lib/validation.ts` with the zod schemas from
section 5.3. Confirm types compile and `getWork` resolves all four slugs.

*Acceptance:* `npm run typecheck` clean, all four slugs resolve.
*Commit:* `feat: content model for profile and case studies`

### Phase 4 — Layout shell

Build `SiteHeader`, `SiteFooter`, the skip link, and `not-found.tsx`. Header is
sticky with a hairline border and a backdrop blur. Wire navigation to `/#work`,
`/about`, and the résumé.

*Acceptance:* shell renders on every route; header does not overflow at 360px;
skip link appears on first Tab and moves focus to `<main>`.
*Commit:* `feat: site header, footer, and skip navigation`

### Phase 5 — Homepage

Build the hero, then `WorkRow`, `MetricTick`, `StackTags`, `SectionHeading`,
and `Eyebrow`. Assemble the work index and the capabilities section. Add the
`Reveal` component and apply it to section entrances only — not to individual
list items.

*Acceptance:* homepage matches the wireframe in the design brief; metric column
stacks above the title below 768px; scroll reveal fires once per section and is
disabled under reduced motion.
*Commit:* `feat: homepage hero, work index, and capabilities`

### Phase 6 — Case studies and about

Build `/work/[slug]` with `generateStaticParams` and `generateMetadata`.
Render sections, links, stack, and previous/next navigation. Build `/about`
from `profile.aboutParagraphs`, `education`, and `awards`.

*Acceptance:* all four case studies render; an unknown slug returns the 404
page; each has a distinct document title.
*Commit:* `feat: case study and about pages`

### Phase 7 — Contact API

Build `src/lib/hash.ts`, `src/lib/rate-limit.ts`, and
`app/api/contact/route.ts` per section 5.3. Build `ContactForm` against the
shared schema. Include the honeypot. Include the comment documenting the
in-memory rate limiter's real-world limitation.

*Acceptance:* valid submission returns 200; a short message returns 400 with a
field error; a fourth submission within the hour returns 429; the route works
with `RESEND_API_KEY` unset; the form is fully keyboard operable and errors are
announced.
*Commit:* `feat: contact api with validation and rate limiting`

### Phase 8 — Database and GitHub panel

Add `drizzle.config.ts`, `src/db/schema.ts`, and `src/db/index.ts` returning
null when `DATABASE_URL` is absent. Wire contact persistence and the view
counter. Build `src/lib/github.ts` and `GitHubPanel`.

*Acceptance:* with no `DATABASE_URL`, every page renders and the form still
works; with one configured, views increment and submissions persist; GitHub
failure renders nothing rather than an error.
*Commit:* `feat: view counts, submission storage, and github stats`

### Phase 9 — Polish and ship

Add `sitemap.ts`, `robots.ts`, JSON-LD, the OG image, and `resume.pdf`. Run the
browser subagent over every route at all three breakpoints. Run Lighthouse.
Fix what it finds. Write the README. Deploy to Vercel and connect the domain.

*Acceptance:* everything in section 7.
*Commit:* `feat: metadata, seo, and production polish`

---

## 9. Notes for the agent on judgement

The owner has explicitly rejected work that reads as template output. The
failure mode to avoid is not ugliness — it is genericness. When you have a
choice between the expected solution and one derived from this specific brief,
take the second, and say why in the commit body.

Two things you must not do quietly:

**Do not soften the technical writing.** The case studies contain specific
claims — 93.75% classification accuracy, a 60–80% cost reduction, a three-level
fallback chain. These are load-bearing. Do not generalise them into smoother
prose.

**Do not add anything the owner cannot defend.** Every line of this repository
will be read by someone who may ask her about it in an interview. A clever
abstraction she did not ask for is a liability, not a gift. When in doubt,
write the plainer version.

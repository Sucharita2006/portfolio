# Portfolio design brief

Feed this to the agent before asking for any UI. It exists to stop the model
defaulting to the generic developer-portfolio look.

## Subject

Sucharita Chattopadhyay. Computer science undergrad at VIT-AP (2028), AI
engineer intern at Open Paws. Backend and applied AI: FastAPI, Python,
TypeScript, RAG pipelines, test harnesses, data ingestion that survives bad
upstream data.

**Audience:** engineering hiring managers and recruiters screening for SWE
internships and new-grad roles. They will spend 30 seconds on the homepage
before deciding whether to open a case study.

**The page's single job:** convince a technical reader that this person ships
things that stay correct under failure.

## Do not build

These are the three looks AI reaches for unprompted. All are banned here:

1. Warm cream background (#F4F1EA-ish) + high-contrast serif + terracotta
   accent (#D97757-ish).
2. Near-black background + one acid-green or vermilion accent.
3. Broadsheet pastiche — hairline rules everywhere, zero border radius,
   dense newspaper columns.

Also banned, specifically:

- `Hi, I'm Sucharita 👋`
- Skill bars with percentages, radar charts of competence, "React ●●●●○"
- A grid of technology logos
- Animated particle / gradient-mesh / aurora backgrounds
- Stat counters that tick up on scroll
- `01 / 02 / 03` numbering on projects (see Signature below for why)
- Glassmorphism cards
- Inter as the body face
- The words: passionate, journey, enthusiast, cutting-edge, leveraging,
  seamless, tech stack as a noun phrase in the hero

## Tokens

### Color

Cool slate, near-monochrome, one accent used sparingly. Deliberately not warm.

| Token         | Hex       | Use                                       |
| ------------- | --------- | ----------------------------------------- |
| `paper`       | `#F2F3F4` | Page background                           |
| `paper-raised`| `#FBFBFC` | Cards, raised surfaces                    |
| `ink`         | `#101319` | Primary text                              |
| `ink-soft`    | `#3B414C` | Secondary text                            |
| `muted`       | `#676D79` | Metadata, captions                        |
| `rule`        | `#DCDEE2` | Hairlines                                 |
| `rule-strong` | `#C3C7CD` | Emphasised dividers                       |
| `marine`      | `#243FA8` | Links, focus rings, metric ticks. Only.   |
| `marine-soft` | `#E6E9F6` | Rare tint behind the accent               |

The accent appears on interactive elements and metric ticks. It never fills a
hero, a button block, or a section background.

> **Amended in review, 30 July 2026.** `muted` was `#6D7480`. Measured against
> `paper`, that is 4.24:1, and every use of the token is 11–14px text, so it
> fails the 4.5:1 floor the quality section sets. `#676D79` is 4.68:1 — two
> steps darker in the same hue.
>
> Ratios against `paper`, computed by `/tokens` rather than by hand: `ink`
> 16.74:1, `ink-soft` 9.24:1, `muted` 4.68:1, `marine` 8.04:1. White on
> `marine` is 8.93:1. `rule` 1.21:1, `rule-strong` 1.53:1 and `marine-soft`
> 1.09:1 are hairlines and tints — decorative, never carrying text.

### Type

| Role    | Face          | Notes                                                     |
| ------- | ------------- | --------------------------------------------------------- |
| Display | Fraunces      | Variable. `SOFT 0, WONK 1, opsz 120` — sharp, not friendly |
| Body    | IBM Plex Sans | 400/500/600                                                |
| Data    | IBM Plex Mono | Metrics, eyebrows, labels, the header wordmark             |

Plex Sans and Plex Mono are siblings, which ties the prose and the numbers
together — appropriate for someone whose work is measured in coverage
percentages and p99s. Fraunces carries the personality and is used *only* for
the hero statement, section openers, and case-study titles.

Scale: hero 3.5–5rem, section heads 1.75rem, body 1rem/1.65, eyebrow 0.6875rem
mono uppercase with 0.14em tracking.

### Layout

680–1024px content column, generous left-aligned whitespace, no centred text
below the hero.

```
┌──────────────────────────────────────────────────────┐
│ Sucharita Chattopadhyay      Work  About  Résumé     │  sticky, hairline
├──────────────────────────────────────────────────────┤
│                                                      │
│   I build backends that hold up                      │  Fraunces, 2 lines
│   when the data misbehaves.                          │
│                                                      │
│   [body paragraph, max 52ch]                         │
│   9.79 CGPA · 200+ DSA · 2028                        │  mono facts row
│                                                      │
├──────────────────────────────────────────────────────┤
│ SELECTED WORK                                        │  eyebrow
│                                                      │
│  100%    │ Legislative monitoring for animal advoc.  │
│  ────    │ AI Engineer Intern, Open Paws · 2026      │
│  coverage│ [one-line summary]         FastAPI Python │
│          │                                           │
│  60–80%  │ LegiTrack AI                              │
│  ────    │ 50 state legislatures · live              │
│  cost cut│ [one-line summary]      FastAPI React NLTK│
│                                                      │
├──────────────────────────────────────────────────────┤
│ CAPABILITIES  (grouped lists, no bars, no logos)     │
├──────────────────────────────────────────────────────┤
│ Let's talk.                    Email GitHub LinkedIn │
└──────────────────────────────────────────────────────┘
```

### Signature

**Each work item is indexed by its own hardest number**, set in Plex Mono in a
left column against a short hairline tick, instead of by a sequence number.

`100%` / `60–80%` / `3-level` / `150+`

Rationale, and hold the agent to it: the projects are not a sequence, so
`01 / 02 / 03` would be decoration pretending to be structure. The metric is
information the reader wants anyway, and it makes the index itself the argument
— this person measures things. This is the one bold move on the page. Everything
else stays quiet.

### Motion

One entrance animation: fade + 14px rise on scroll, 520ms, cubic-bezier(0.22,
0.61, 0.36, 1). One hover: underline growing from the left on links, 220ms.
Nothing else. `prefers-reduced-motion` disables both.

## Pages

- `/` — hero, selected work index, capabilities, contact
- `/work/[slug]` — case study: context, what I built, the part that was actually
  hard, outcome. Content is in `src/content/work.ts`.
- `/about` — longer prose, education, awards
- `/resume.pdf` — static file in `public/`

## Backend surface

The point is to demonstrate server-side work, not just styling:

- `app/api/contact/route.ts` — zod validation, rate limiting, Resend delivery,
  graceful degradation to console logging when `RESEND_API_KEY` is absent
- GitHub stats fetched server-side with `revalidate: 3600` (ISR), not a client
  fetch that flashes on load
- Optional: Postgres via Neon + Drizzle for per-case-study view counts

## Quality floor

Responsive to 360px. Visible keyboard focus on every interactive element. Skip
link. Semantic landmarks. Real `<title>` and OG tags per page. Lighthouse
accessibility 100 before you call it done.

## Copy rules

Sentence case everywhere. Active voice. No exclamation marks. Specific over
clever — "cut LLM API costs 60–80% with a keyword pre-filter" beats "optimised
AI workflows". Every claim on the site should be one a hiring manager could ask
you to defend, and you should want them to.

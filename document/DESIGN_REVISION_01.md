# Design revision 1 — after the first look at the rendered page

**Commit:** `style: rework display type, work-row hierarchy, and capabilities legibility`
**Date:** 30 July 2026
**Trigger:** owner reviewed screenshots of the Phase 5 homepage — "it is not that great" —
and released me from the brief where the brief was making it worse.

---

## What was actually wrong

Three problems, only one of which was taste.

**1. `opsz 120` was the root cause of most of it.** Fraunces' optical-size axis controls stroke
contrast. At 120 it sits at its display extreme: hairline thins, didone contrast. Two
consequences, one aesthetic and one structural.

The aesthetic one: at hero size it read as fashion editorial. Elegant, and wrong for someone
whose argument is that her systems survive bad data.

The structural one is worse. The same setting was used on the 1.375rem work titles, where those
hairlines thinned out until *the titles were visually lighter than the summary text beneath
them*. The most important line in each row was the least prominent thing in it. That is an
inverted hierarchy, not a preference.

**2. Capabilities was unreadable.** Items were separated by whitespace, and the items themselves
contain whitespace. "Data structures & algorithms Object-oriented programming DBMS" is one
undifferentiated string. Whitespace cannot delimit a list whose members contain whitespace.

**3. The page was flat and half-empty.** `paper-raised` was defined and never used, so eight
screens ran at one unbroken grey. The hero used a little over half the 64rem column and left
the rest blank, because the three facts were one short inline line.

## Changes

### Type

| | Before | After |
| --- | --- | --- |
| Display axes | `opsz 120`, weight 400 | `opsz 48`, weight 500 |
| Small display | *(same as above)* | new `.type-display-sm` — `opsz 16`, weight 600 |
| Hero size | `clamp(3.5rem, …, 5rem)` | `clamp(3rem, …, 4.5rem)` |
| Hero leading | 1.02 | 1.08 |
| Work title | 1.375rem display | 1.5rem `.type-display-sm` |

Splitting display type into two optical sizes is the substantive fix. A face set for 72px does
not survive being shrunk to 24px — that is what the `opsz` axis exists to solve, and using one
value for both sizes wasted it. Hero keeps enough contrast to have character; headings get a
setting that holds together small.

The hero also came down half a step at both ends. At 5rem it dwarfed everything under it, and
the drop from 5rem straight to 1rem body was a hole rather than a hierarchy. 3.5rem was also
punishing at 360px.

**Deviation from the brief:** it specifies `SOFT 0, WONK 1, opsz 120` and a 3.5–5rem hero.
`SOFT 0` and `WONK 1` are kept — they are what stop Fraunces reading as a generic transitional
serif. `opsz` and the scale are changed for the reasons above.

### Work rows

Title up to 1.5rem at the small optical size and weight 600, so it outranks its own summary.
Summary down to 0.9375rem with relaxed leading. Metric column widened from 7.5rem to 9rem so
`60–80%` and `3-level` stop crowding, the value up to 1.75rem with tightened tracking, and the
tick from 1px×2rem to 2px×2.5rem so it registers as a mark rather than a hairline.

Subtitles moved to a new `.eyebrow-meta` at `0.07em` tracking. `0.14em` is right for
"SELECTED WORK" and turns "LEGISLATION INTELLIGENCE ACROSS 50 STATE LEGISLATURES · 2026" into
a smear.

### Capabilities

Middot separators via `.dot-list`, generated with `::before` so the separator stays out of the
accessibility tree — it is punctuation, not content, and a screen reader should not read
"dot" fifty-six times.

The section also became the one raised surface on the site: a full-bleed `paper-raised` band
with hairlines top and bottom. `#FBFBFC` against `#F2F3F4` is barely a shade, which is the
point — it gives the longest section an edge without introducing a card.

### Hero facts

Now three hairline-ruled columns carrying value, label, and the `note` that was previously
unused. **This reverses my Phase 5 decision** to hold the notes back for `/about` on the
grounds they would compete with the hero. Seeing it rendered, the opposite was true: the hero
left half the column empty and the notes are the substance that fills it. "branch rank holder"
is the part of "9.79" a reader actually wants. Ruled columns also echo the metric ticks below,
so the page has one rhythm instead of two.

## A collision found while verifying

The compiled CSS contained **two `.font-display` rules**. Tailwind v4 generates a `font-display`
utility from the `--font-display` theme key, and my hand-written class had the same name.

It worked — the two rules set different properties, so nothing was lost — but a custom class
silently shadowing a generated utility is a bug waiting for a version bump. Both classes are
renamed to `.type-display` / `.type-display-sm`. The theme variable keeps its name; only the
class changed. Verified: one `.font-display` rule in the output now, and both new classes emit
their full variation settings.

## Verification

`typecheck`, `lint`, `build` all clean. **106 kB First Load JS, unchanged** — every change here
is CSS, and CSS does not count against the JavaScript budget. Heading structure still
`h1=1, h2=2, h3=12` with no level skipped.

Rendered and confirmed: `h1` carries `type-display text-hero`, work titles carry
`type-display-sm`, eight `dot-list` lists, four `eyebrow-meta` subtitles, the `paper-raised`
band present, and all three facts rendering value, label and note.

## Still needs your eyes

1. **The hero.** This is the change with the most riding on it. It should now read solid and
   confident rather than delicate. If it has gone too far the other way — heavy, blunt — the
   dial is `opsz` and `font-weight` in `.type-display`, and I would rather hear "too heavy"
   than leave it where it was.
2. **Work titles against their summaries.** The title must now clearly outrank the paragraph
   under it. That was the actual defect.
3. **The capabilities band.** Judge whether the raised shade is too subtle to be worth having.
   If you cannot see it at all, it should either strengthen or come out — a difference nobody
   perceives is just a rule nobody can explain.
4. **The facts row** with its notes, and whether it fills the space or merely occupies it.

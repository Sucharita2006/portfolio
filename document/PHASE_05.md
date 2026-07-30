# Phase 5 — Homepage

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 5 · F1 · `DESIGN_BRIEF.md` "Signature"
**Commit:** `feat: homepage hero, work index, and capabilities`
**Date:** 30 July 2026

---

## What this phase was for

The page the thirty seconds are spent on: hero, the work index with its metric ticks, and
capabilities. The contact section is F3 and arrives in Phase 7.

## Files

| File | Change |
| --- | --- |
| `src/components/section-heading.tsx` | Added. `SectionHeading` and `Eyebrow` |
| `src/components/metric-tick.tsx` | Added |
| `src/components/stack-tags.tsx` | Added |
| `src/components/work-row.tsx` | Added |
| `src/components/reveal.tsx` | Added, minus the unused `delay` prop |
| `src/app/page.tsx` | The homepage |

## Decisions

**The hero is not wrapped in `Reveal`.** It is the largest contentful paint, and gating it
behind an intersection observer delays the one paint the performance budget is measured on — in
order to animate something already on screen before anyone can scroll. `Reveal` goes on the two
sections below the fold, and on section entrances only, never on individual rows.

**`SectionHeading` renders `h2`, not `p`.** The brief calls these eyebrows and the spec calls
them labels, but they are the section's heading in every sense except size. As paragraphs, the
page would go `h1` → `h3` and a screen reader's heading list — a primary means of navigation —
would show the homepage as one undivided block. `Eyebrow` stays a `p` for genuine labels, so
sharing the styling does not force everything into the outline.

**The whole row is clickable but only the title is the link.** F1 says "the entire row is a
link". Implemented literally, that anchor's accessible name would be the metric, title,
subtitle, period, summary and five tags — roughly forty words, announced in full every time a
screen reader lists the page's links. Instead the anchor stretches over the row with an
absolutely positioned `::after`: the pointer target is the whole row, the accessible name is
the title alone. The focus ring stays on the title for the same reason — a ring around an
entire row tells you less about where you are, not more.

**`StackTags` renders plain mono text, not pills.** Eleven bordered chips on a page whose
argument is hairlines and restraint would read as a logo grid without the logos. Case is
preserved rather than uppercased, because "FastAPI", "pgvector" and "Next.js" carry information
in their capitalisation that "FASTAPI" discards.

**The metric tick is `aria-hidden`.** It is a one-pixel rule; the value and its label already
say everything a reader needs. It is also the only non-interactive use of `marine` on the site,
which is what the brief reserves it for.

**Eight capability groups, rendered in two columns.** Flagged in Phase 3 and settled here. F1
says six; `profile.skills` has eight after the résumé added CS foundations and Security. Cutting
two groups to match a count in the spec would delete the terms a new-grad screen greps for. Two
columns from `sm` up means eight groups occupy four rows, which is roughly the vertical space
six groups in one column would have taken. **F1's "six groups" is amended to eight.**

**The homepage is fully static, with no `revalidate`.** F1 specified hourly revalidation
"because of F5", and F5 moved to `/about` in review. There is now no time-varying data on this
page, so revalidating it would re-render identical HTML on a timer.

**Fact notes are not shown in the hero.** `profile.facts` carries a `note` on each — "branch
rank holder", "Java, LeetCode + GFG", "B.Tech CSE, VIT-AP". Three facts with three footnotes
would compete with the hero statement, which the brief says everything must stay quiet around.
They render on `/about` in Phase 6, where there is room to read them.

## Verification

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean, 5/5 static.

**First Load JS: 106 kB on `/`, up from 103 kB.** The 3 kB is `Reveal`, the first client
component on the site. Page-specific code is 475 B. Against the amended budget — under 115 kB
total, under 10 KB of it site code — that is 106 kB with about 3.5 kB of ours.

Read out of `.next/server/app/index.html`:

```
headings   : h1=1  h2=2  h3=12
landmarks  : header=1 main=1 footer=1 nav=1 section=3
h1         : "I build backends that hold up" | "when the data misbehaves."
h2         : Selected work · Capabilities
anchors    : #work ✓   #capabilities ✓
```

Twelve `h3` is four work titles plus eight capability groups. Outline is `h1` → `h2` → `h3`
with no level skipped.

**All four work rows**, each with a stretched link, a marine tick, and exactly five tags:

| Metric | Link | Title | Tags shown |
| --- | --- | --- | --- |
| `100%` | `/work/open-paws` | Legislative monitoring for animal advocacy | 5 of 11 |
| `60–80%` | `/work/legitrack-ai` | LegiTrack AI | 5 of 8 |
| `3-level` | `/work/payflow` | PayFlow | 5 of 6 |
| `150+` | `/work/verde` | VERDE | 5 of 6 |

F1's five-tag limit holds on every row; the full list appears on the case study page.

**Facts row:** `9.79 CGPA` · `200+ DSA solved` · `2028 Batch`.

**Capabilities:** eight groups — Languages, CS foundations, Backend & API design, Reliability &
testing, Security, Applied AI, Infrastructure & delivery, Frontend. Ampersands correctly
escaped as `&amp;` in the markup.

## A note on my own verification

Two figures in my first pass of this check were wrong, both from regex rather than from code.
The row-splitting pattern terminated at the first nested `</li>`, which reported four stack
tags per row instead of five, and the console renders the en dash in `60–80%` and the é in
`Résumé` as replacement characters. Neither was real: targeting the `StackTags` list directly
gives five tags on every row, and the served bytes are valid UTF-8, verified at byte level in
Phase 4.

Worth stating because a checking tool that is wrong in the same direction twice is worth
distrusting, and because "the site truncates your tech stack" would have been a plausible bug
to go and fix.

## Needs your eyes

This phase is the one where the design either works or does not, and I cannot see any of it.

1. **The hero at 360px.** `text-hero` floors at 3.5rem, per the brief. "I build backends that
   hold up" will wrap; the question is whether it wraps gracefully or leaves an orphan. This is
   the single most important thing to look at.
2. **Does the metric column read as the index?** It is the one bold move on the page. If the
   `100% / 60–80% / 3-level / 150+` column does not immediately read as "this person measures
   things", the device has not landed and the sizing needs revisiting.
3. **Metric stacking below 768px.** The column should stack *above* the title, not shrink.
4. **Hover a work row anywhere** — not just the title. The whole row should be clickable and the
   title's underline should grow from the left. Then Tab to it: the ring should sit on the
   title only.
5. **Eight capability groups.** Two columns from 640px. Judge whether this is too much page —
   it is the section most likely to be over-long, and trimming is a content decision.
6. **Scroll past the hero.** Work and capabilities should fade and rise once each. If anything
   staggers row by row, that is wrong.
7. **"2028 Batch"** in the facts row reads a little oddly next to "9.79 CGPA" and "200+ DSA
   solved". The brief's wireframe shows a bare "2028". Changing it means editing
   `profile.facts[2].label`, which is your copy, so I have left it.

## Not done in this phase, by design

The contact section — F3 is Phase 7, and the homepage will gain it then. Case studies and
`/about` are Phase 6.

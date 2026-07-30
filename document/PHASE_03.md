# Phase 3 — Content model

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 3 · sections 5.1 and 5.3
**Commit:** `feat: content model for profile and case studies`
**Date:** 30 July 2026

---

## What this phase was for

The single source of every piece of text on the site, plus the one validation schema the
contact form and the contact API will both use. No rendering.

## Files

| File | Change |
| --- | --- |
| `src/content/work.ts` | Added. Byte-identical to the supplied starter — no prose altered |
| `src/content/profile.ts` | Added, then enriched from the résumé |
| `src/lib/validation.ts` | Added. Shared zod schemas |
| `public/resume.pdf` | Added from `UpdatesResume_Sucharita.pdf` |
| `package.json` | `zod@^4` |

## Decisions

**`work.ts` is byte-identical to the starter.** Verified with `diff`, not by eye. Section 9 is
explicit that the case-study claims are load-bearing — 93.75% accuracy, 60–80% cost reduction,
a three-level fallback chain, 55 tests — so nothing was tightened, smoothed, or reworded.

**`zod@4` rather than the starter's `^3.25.42`.** This schema is imported by the contact form,
so it ships to the browser and counts against the JavaScript budget; zod 4's core is materially
smaller than v3's. The non-deprecated `z.email()` form is used rather than
`z.string().email()`, which still works in v4 but is on its way out.

**`profile.skills` went from six groups to eight.** The résumé has seven skill groups and
`profile.ts` had six, and the two that had no home here were **CS foundations** (data
structures and algorithms, OOP, DBMS, operating systems, computer networks, SDLC, Agile/Scrum)
and **Security** (secure coding, JWT auth, HTTPS/TLS, Pydantic input validation, secrets
management). Those are precisely the terms a new-grad screen greps for, and dropping them to
preserve a count in the spec would have been the wrong trade. Existing groups also picked up
résumé items they were missing: HTTP request lifecycle, event-driven processing, test harness
design, code reviews, fault-tolerant pipelines, systematic debugging, performance
optimisation, and zero-downtime deploys.

Fifty-six items across eight groups. **This is a deviation from F1's "six groups from
`profile.skills`"** and it changes how much vertical space the homepage capabilities section
occupies. Phase 3 is the data layer, so the rendering decision belongs to Phase 5 — flagged
there rather than settled here.

**Education dates made precise** from the résumé: `Aug 2024 – Jul 2028` for VIT-AP, where the
starter had `2024–2028`. Everything else in `education` and `awards` already matched.

**`aboutParagraphs` unchanged.** The Open Paws role is completed, which was question 14, so the
past tense the starter already used is correct and nothing needed adjusting.

**Validation messages are written for the reader, not the developer.** Each `z.string()` takes
an explicit `error`, because zod's default for a missing field is "Invalid input: expected
string, received undefined" — a sentence for a developer that would otherwise reach a visitor
through the 400 response. `fieldErrors()` collapses the issue list to one message per field;
showing someone three reasons their name is wrong is not more helpful than one.

**The honeypot is declared in the schema but deliberately not enforced by it.** `website` must
be empty, and the schema says so — but validating it there would answer a bot with 400, and a
bot that receives 400 learns the field is a trap and comes back without it. Section 5.3 requires
200. So the route checks the honeypot on the raw body *before* validation runs; the schema
carries the constraint as documentation and the route is where it is acted on. Both the comment
in the file and this paragraph exist because the ordering is the whole mechanism and is easy to
get backwards.

## Verification

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean, 5/5 static.

**First Load JS still 103 kB**, unchanged. zod is in the dependency tree but nothing imports it
into a client component yet, so none of it has reached the browser. That happens in Phase 7 and
is where the budget number will first move.

**All four slugs resolve**, and `getWork` on an unknown slug returns `undefined`:

```
open-paws     -> resolved   metric=100%     test coverage on delivery
legitrack-ai  -> resolved   metric=60–80%   reduction in LLM API cost
payflow       -> resolved   metric=3-level  gateway fallback chain
verde         -> resolved   metric=150+     menu combinations modelled
getWork('nope') -> undefined
```

**Content shape:** 8 skill groups / 56 items · 3 education entries · 3 awards · 3 facts.

**Schema exercised at every boundary in section 5.3**, not just the happy path:

| Input | Result |
| --- | --- |
| valid | accepted, email trimmed |
| name 1 char / 100 / 101 | rejected / accepted / rejected |
| whitespace-only name | rejected — trim runs before the length check |
| `nope` as email | rejected |
| email 200 chars / 201 | accepted / rejected |
| message 19 / 20 / 4000 / 4001 | rejected / accepted / accepted / rejected |
| 18 chars padded to 20 with spaces | rejected — trim runs before the length check |
| `{}` and all-`null` | rejected, with the human messages, no zod internals |

**`public/resume.pdf` serves:** 200, `application/pdf`, 43,440 bytes, `%PDF-` magic bytes
intact. `Content-Disposition: inline` arrives in Phase 10.

## Findings

**Two of four case studies are missing the section the spec calls mandatory.** F2: *"Each case
study includes a section named 'The part that was actually hard' … It must not be cut for
length."* `payflow` has three sections and `verde` two, and neither includes it. `open-paws`
and `legitrack-ai` do.

This is the most consequential gap in the project so far. The spec says that section is the
only place engineering judgement is visible rather than asserted, which means half the case
studies currently assert rather than show. I have not written them and will not: what was
actually hard is knowledge only the owner has, and the résumé records what she built, not what
fought back. Open question 16, blocking Phase 6.

**The résumé and the site disagree on spelling convention.** The supplied prose is British
throughout — organisation, normalised, personalised, modelled, labelled. The résumé is
American — optimization, personalized, normalized. Both are internally consistent, so nothing
is wrong, but a reader with both open may notice. New skill items were written British to match
the site. Not worth changing either document; recorded so the choice is visible.

**The résumé lists AARC under Experience, `work.ts` marks VERDE as a project.** `kind` is
rendered nowhere in F1 or F2, so this changes nothing today. Open question 17, default is to
leave it.

**`public/resume.pdf` publishes a phone number.** It is crawlable from both the site and the
repository. That is what a résumé is for, so it is not an objection — but it does mean question
7's decision to keep `profile.phone` off the page buys less privacy than it appears to. Noted
in question 11.

**A note for Phase 9.** Running a `.ts` file through Node directly works — native type
stripping handled `work.ts`, `profile.ts`, and `validation.ts` with no tooling, which confirms
the zero-dependency test plan. One wrinkle: Node warns
`MODULE_TYPELESS_PACKAGE_JSON` because `package.json` has no `"type": "module"`. Naming test
files `.test.mts` sidesteps it without touching `package.json`, at the cost of adding
`**/*.mts` to the tsconfig `include`. Decided in Phase 9.

## Needs your eyes

1. **The eight skill groups.** Read `src/content/profile.ts` and cut anything you would not
   want to be asked about in an interview. Every item there is a thing a panel may probe. This
   matters more than the count.
2. **Question 16** — the two missing "actually hard" sections. Phase 6 needs an answer.
3. **The LinkedIn URL.** Still `linkedin.com/in/sucharita-chattopadhyay-500b572b4`, which the
   résumé confirms is current. The suggestion to shorten it to a custom slug stands; it would
   change `profile.ts` and the Phase 10 JSON-LD `sameAs`.

## Not done in this phase, by design

Header, footer, skip link, every page, the contact route, and the database. Phases 4 to 10.

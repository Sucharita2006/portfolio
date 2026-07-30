# Phase 7 — Contact API and form

**Spec:** `document/BUILD_SPEC.md` section 8, Phase 7 · F3 · section 5.3
**Commit:** `feat: contact api with validation and rate limiting`
**Date:** 30 July 2026

---

## What this phase was for

`POST /api/contact` with validation, rate limiting, and graceful degradation, and the client
form that talks to it — both validating against the one schema written in Phase 3.

## Files

| File | Change |
| --- | --- |
| `src/lib/hash.ts` | Added. Salted IP hashing and proxy-header address extraction |
| `src/lib/rate-limit.ts` | Added. Token bucket |
| `src/app/api/contact/route.ts` | Added |
| `src/components/contact-form.tsx` | Added. Second client component |
| `src/app/page.tsx` | Contact section, completing F1 |
| `package.json` | `resend@6.18.1` |

## Decisions

**The honeypot is read before validation, and that ordering is the whole mechanism.** Validating
first would answer a bot with 400, and a bot that receives 400 learns the field is a trap and
comes back without it. One that receives 200 believes it succeeded and goes away. So `website`
is read off the raw body and the route returns `{ ok: true }` having sent nothing. Verified: a
submission with the honeypot filled returned 200 and produced **no** delivery log line.

**Rate limiting runs after validation, not before.** A visitor who mistypes their address three
times should not be locked out for an hour over three requests that never sent anything. The
cost is that invalid payloads are unmetered, which is acceptable because rejecting one is a
schema parse with no I/O, no email, and no database write behind it. Stated in the file so the
trade is visible rather than accidental.

**The limiter sweeps.** A `Map` keyed on hashed addresses grows for the lifetime of the
instance — a slow memory leak wearing a rate limiter's clothes. Above 10,000 tracked keys, full
buckets are dropped before inserting; a refilled bucket is indistinguishable from a key never
seen, so discarding it loses nothing.

**`take(key, now)` takes the clock as a parameter.** Otherwise testing the refill window means
sleeping through an hour. Phase 9 depends on this.

**The in-memory limitation is documented in the file, as section 5.3 requires.** It resets on
cold start and is per-instance, so on a serverless fleet the real ceiling is three per hour
*per instance*. It is kept because it stops the ordinary case — one person or one naive script
— for zero dependencies and zero network calls. The upgrade path to Upstash Redis is written
down, and the bucket arithmetic lives behind a function specifically so that swap touches one
file.

**Salted hash, never the raw address**, with the fallback salt's weakness spelled out: a known
salt makes the hash reversible to anyone willing to walk the address space. It exists so the
site runs from a fresh clone with no environment; production sets `IP_HASH_SALT`.

**`x-forwarded-for` is treated as a suggestion.** The first entry is taken because that is
correct behind Vercel's edge network. Behind anything else the header is client-controlled and
therefore a lie waiting to happen — acceptable here, because the only thing keyed on it is a
courtesy rate limit, not authorisation. Commented as such.

**The submit button stays enabled while sending.** F3 requires it, and it is right: a control
that leaves the tab order mid-interaction strands keyboard and screen-reader users. Double
submission is prevented by a `useRef` guard instead — a ref rather than state, so it is correct
on the very next event rather than after a re-render.

**`noValidate` on the form.** The browser's own validation bubbles would disagree with the zod
schema in front of a visitor. One source of truth for what counts as valid.

**Honeypot is an off-screen real input, not `type="hidden"`.** Many bots skip hidden inputs and
fill everything else. `aria-hidden`, `tabIndex={-1}` and `autoComplete="off"` keep it away from
humans, assistive technology, and password managers — the last one matters, because a manager
filling it would get a real person silently ignored.

## The budget problem, and the fix

Importing the shared schema into the form put **zod in the initial bundle of every route**, and
the homepage went from 106 kB to **123 kB** — past the 115 kB agreed in question 4.

Measured rather than guessed: zod is **15.4 kB gzipped**, isolated in chunk `653`. Worse, that
chunk loaded on `/about` and the case studies too, which have no form on them.

Three options were available. Hand-rolling client-side checks would break section 2's "one
definition, two consumers", which is the entire reason zod is in the stack. Switching to
`zod/mini` would save perhaps half of it at the cost of a functional API the owner then has to
explain. The third is that **nobody needs a validator until they touch the form**.

So the schema is imported dynamically, the promise cached at module scope, and the fetch
started on the first focus of any field. F3 still holds exactly — errors appear without a round
trip to the API, because the module is in memory long before anyone finishes typing a
twenty-character message.

| | Initial JS, modern browser |
| --- | --- |
| Static import of the schema | 121.8 kB on every route |
| Dynamic import on first focus | **106.4 kB** on `/` and `/about`, 104.8 kB on case studies |

Confirmed: the zod chunk is present on disk and **not referenced in the served HTML** of any
route. Everything is back inside the budget.

## Verification

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean. Homepage First Load
JS 108 kB reported, 106.4 kB measured.

**Every response path in section 5.3, exercised against the production build:**

| Request | Status | Body |
| --- | --- | --- |
| valid | 200 | `{"ok":true}` |
| 5-character message | 400 | field error on `message` |
| `nope` as email, 1-character name | 400 | field errors on **both** `name` and `email` |
| honeypot filled | 200 | `{"ok":true}` — and no delivery attempted |
| 2nd and 3rd valid | 200 | `{"ok":true}` |
| **4th valid within the hour** | **429** | `Too many messages. Try again in an hour.` |
| body that is not JSON | 400 | `Expected a JSON body.` |

`Retry-After: 1200` on the 429 — 1,200 seconds is twenty minutes, which is exactly one token
at three per hour. The refill maths is right.

**Degradation with `RESEND_API_KEY` unset:** the route validated, rate-limited, and returned
200, logging instead of delivering. Exactly **three** `[contact]` log lines for the three
accepted messages — the honeypot submission produced none, which is the proof it short-circuited
before delivery rather than merely returning the right status.

**Rendered form:** four real `<label for>` elements (no placeholder-only labelling), an
`aria-live="polite"` region, the honeypot off-screen with `aria-hidden="true"`, and a submit
button reading "Send message".

## Needs your eyes

1. **Tab through the form.** Name → Email → Message → Send. The honeypot must never receive
   focus. Every field should show the marine ring.
2. **Submit it empty**, then with a two-word message. Errors should appear under the right
   fields and the count should be announced.
3. **Submit something valid.** With no `RESEND_API_KEY` it will succeed and the form is replaced
   by a confirmation. The message appears in your `npm run dev` console.
4. **Then submit three more.** The fourth should be refused with the rate-limit message.
5. **Set `RESEND_API_KEY`** in `.env.local` when you want real delivery. Resend needs a verified
   domain to send from anything other than its own test address — until then set
   `CONTACT_FROM_EMAIL=onboarding@resend.dev`, which only delivers to your own account address.

## Not done in this phase, by design

Contact submissions are not yet persisted — that is Phase 8, along with view counts and the
GitHub panel. Until then a delivery failure loses the message, which is precisely why
section 5.2 wants the table.

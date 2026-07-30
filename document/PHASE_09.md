# Phase 9 — Tests and CI

**Added to the spec's nine phases in review** (open question 2)
**Commit:** `test: lib unit suites and github actions ci`
**Date:** 30 July 2026

---

## Why this phase exists

The site's central argument is that this person tests things: a 55-test pytest harness, 100%
coverage on two services, 93.75% classification accuracy measured against a labelled slice
rather than by feel. An engineer who reads that, believes it, opens the repository, and finds
no tests has learned something the case studies did not intend to say.

## Files

| File | Change |
| --- | --- |
| `src/lib/github-parse.ts` | Added. The pure boundary check, split out of `github.ts` |
| `src/lib/github.ts` | Reduced to the fetch |
| `src/lib/validation.test.mts` | Added |
| `src/lib/rate-limit.test.mts` | Added |
| `src/lib/hash.test.mts` | Added |
| `src/lib/github-parse.test.mts` | Added |
| `.github/workflows/ci.yml` | Added |
| `package.json`, `tsconfig.json` | `test` script, `.mts` in `include` |

**Zero new dependencies.** Node 24 runs the test runner and TypeScript natively, so a repository
that argues for testing does not have to install a testing framework to do it.

## Decisions

**`.test.mts`, not `.test.ts`.** Phase 3 found that running a `.ts` file under Node warns
`MODULE_TYPELESS_PACKAGE_JSON`, because `package.json` has no `"type": "module"`. Adding that
field to a Next project to quiet a warning is a change with a blast radius; an explicit `.mts`
extension says "this is an ES module" per-file and costs one line in `tsconfig.include`.

**`github.ts` was split.** It imported `@/content/profile`, and the `@/` alias is a bundler
convention that plain Node does not resolve — so the module could not be imported by a test at
all. Rather than rewire the alias or install a resolver, the part worth testing moved into
`src/lib/github-parse.ts`, which imports nothing.

That is better code independently of the test. The parsing is where the interesting failure
modes live — GitHub is a third party and a field that is a string today can be null tomorrow —
and it is pure. The fetch is plumbing around it. Splitting them means the boundary check can be
run against a malformed payload with no network and no mock.

**Tests are named as claims, not as function names.** `"trims before measuring, so whitespace is
not a name"` rather than `"test trim"`. The suite reads as a description of what the code
guarantees, which is the only reason to read someone else's tests.

**Boundaries are tested on both sides.** Not "rejects a long name" but 100 accepted and 101
rejected; not "limits requests" but three allowed and the fourth refused. An off-by-one is the
error these functions are actually likely to have.

**One test is a regression test with its history written down** — the zod default message
defect from Phase 3, where a missing field produced "Invalid input: expected string, received
undefined" for a visitor to read. The test asserts no zod internals reach a message and that
every message is a sentence.

## Verification

```
ℹ tests 52
ℹ suites 13
ℹ pass 52
ℹ fail 0
ℹ duration_ms 468
```

`npm run typecheck` clean · `npm run lint` clean · `npm run build` clean, and **bundle sizes are
unchanged** — the test files are not imported by anything the bundler reaches.

### Mutation testing — the part that matters

Fifty-two passing tests prove nothing on their own; a suite that passes against broken code is
worse than no suite, because it is reassuring. So each area was verified by breaking the code
and confirming the tests noticed:

| Deliberate defect | Result |
| --- | --- |
| Rate limit capacity `3` → `4` | **7 failures** |
| Drop the `:` between salt and address in the hash | **1 failure** |
| Remove the human-readable message from a zod field | **2 failures** |
| Stop dropping GitHub repositories missing a name or URL | **1 failure** |
| *(baseline restored)* | 52 pass, 0 fail |

Every mutation was caught. The capacity change failing seven tests rather than one is the
window arithmetic being checked from several directions, which is what makes an off-by-one in
the refill hard to introduce quietly.

### What the suites cover

**`validation`** — 20 tests. Every boundary in section 5.3 from both sides, trim-before-measure
on name and message, the honeypot constraint, and the regression test above.

**`rate-limit`** — 9 tests. Three allowed and the fourth refused; `retryAfter` of exactly 1200
seconds; a token returning at twenty minutes but not nineteen; refill capping at capacity after
a day idle rather than banking 72 tokens; keys independent of each other; and **time going
backwards not granting tokens**, because clock skew between serverless instances is real and
must not be a reset button.

**`hash`** — 13 tests. Determinism, a 64-character hex digest, different addresses giving
different digests, the salt changing the output, and the delimiter test — salt `ab` + address
`c` must not collide with salt `a` + address `bc`. One test asserts the digest never contains
the address it was given, which is the entire justification for the column.
`clientIp` is covered for the leftmost `x-forwarded-for` entry, whitespace, the `x-real-ip`
fallback, precedence, and empty headers.

**`github-parse`** — 10 tests. Nine malformed payloads that must return `null` rather than
throw, repositories missing a name or URL being dropped rather than rendered as blanks, a null
description being preserved rather than dropping the whole repository, and an empty repository
list being a valid result rather than a failure.

### CI

`.github/workflows/ci.yml` runs typecheck, lint, test, and build on every push to `main` and
every pull request, on Node 24, with in-progress runs cancelled when superseded.

The build step runs **with no environment configured, deliberately**. Section 1.6 requires the
site to build and run with zero environment variables, and a green build on a runner that has
none is the only thing that actually keeps that true as the project grows.

## Needs your eyes

1. **The first CI run.** It fires on this push — check the Actions tab on GitHub and confirm it
   goes green. If `npm ci` fails there but `npm install` works locally, the lockfile is out of
   step and I should know.
2. **Read one test file**, ideally `rate-limit.test.mts`. It is the shortest and it is the one
   most likely to come up in an interview, since it is where the reasoning about the window
   lives.

## Not done in this phase, by design

No tests for React components or routes. That would need a DOM environment and a testing
library — real dependencies — to assert things the four boundaries above do not already cover.
The rule applied was to test the code with logic in it and leave the code with markup in it to
be looked at.

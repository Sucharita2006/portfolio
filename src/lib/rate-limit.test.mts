import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { take, reset } from "./rate-limit.ts";

const HOUR = 60 * 60 * 1000;
const T0 = 1_700_000_000_000;

// The clock is a parameter precisely so this suite does not have to sleep
// through an hour to test an hourly window.
describe("token bucket", () => {
  beforeEach(reset);

  test("allows three and refuses the fourth", () => {
    for (let i = 1; i <= 3; i++) {
      assert.equal(take("a", T0).allowed, true, `request ${i} should be allowed`);
    }
    assert.equal(take("a", T0).allowed, false, "the fourth should be refused");
  });

  test("reports twenty minutes until the next token", () => {
    for (let i = 0; i < 3; i++) take("a", T0);
    const refused = take("a", T0);
    // Three tokens an hour is one every twenty minutes.
    assert.equal(refused.retryAfter, 1200);
  });

  test("a token is back after twenty minutes", () => {
    for (let i = 0; i < 3; i++) take("a", T0);
    assert.equal(take("a", T0 + 19 * 60 * 1000).allowed, false, "still short at 19 min");
    assert.equal(take("a", T0 + 20 * 60 * 1000).allowed, true, "allowed at 20 min");
  });

  test("refills to capacity after an hour and no further", () => {
    for (let i = 0; i < 3; i++) take("a", T0);
    // A full day idle must not bank 72 tokens.
    const later = T0 + 24 * HOUR;
    for (let i = 1; i <= 3; i++) {
      assert.equal(take("a", later).allowed, true, `request ${i} after idling`);
    }
    assert.equal(take("a", later).allowed, false, "capacity is a ceiling, not a balance");
  });

  test("keys are independent", () => {
    for (let i = 0; i < 3; i++) take("a", T0);
    assert.equal(take("a", T0).allowed, false);
    assert.equal(take("b", T0).allowed, true, "one sender must not limit another");
  });

  test("an unseen key starts full", () => {
    assert.equal(take("fresh", T0).allowed, true);
  });

  test("time going backwards does not grant tokens", () => {
    for (let i = 0; i < 3; i++) take("a", T0);
    // Clock skew between instances is real; it must not be a way to reset.
    assert.equal(take("a", T0 - HOUR).allowed, false);
  });

  test("reset clears state between suites", () => {
    for (let i = 0; i < 3; i++) take("a", T0);
    assert.equal(take("a", T0).allowed, false);
    reset();
    assert.equal(take("a", T0).allowed, true);
  });
});

import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { hashIp, clientIp } from "./hash.ts";

const IP = "203.0.113.7";

describe("hashIp", () => {
  afterEach(() => {
    delete process.env.IP_HASH_SALT;
  });

  test("is deterministic for the same address and salt", () => {
    process.env.IP_HASH_SALT = "salt";
    assert.equal(hashIp(IP), hashIp(IP));
  });

  test("produces a 64-character hex digest", () => {
    assert.match(hashIp(IP), /^[0-9a-f]{64}$/);
  });

  test("never contains the address it was given", () => {
    // The whole point of the column. If this ever fails, the table is storing
    // addresses.
    assert.ok(!hashIp(IP).includes(IP));
    assert.ok(!hashIp(IP).includes("203"));
  });

  test("different addresses give different digests", () => {
    assert.notEqual(hashIp("203.0.113.7"), hashIp("203.0.113.8"));
  });

  test("the salt changes the digest", () => {
    process.env.IP_HASH_SALT = "one";
    const first = hashIp(IP);
    process.env.IP_HASH_SALT = "two";
    assert.notEqual(first, hashIp(IP));
  });

  test("the delimiter stops salt and address running together", () => {
    // Without a separator, salt "ab" + ip "c" and salt "a" + ip "bc" would be
    // the same input and therefore the same hash.
    process.env.IP_HASH_SALT = "ab";
    const first = hashIp("c");
    process.env.IP_HASH_SALT = "a";
    assert.notEqual(first, hashIp("bc"));
  });

  test("works with no salt configured, because the site must run without one", () => {
    assert.match(hashIp(IP), /^[0-9a-f]{64}$/);
  });
});

describe("clientIp", () => {
  const from = (entries: Record<string, string>) => clientIp(new Headers(entries));

  test("takes the first entry of x-forwarded-for", () => {
    // Vercel's edge appends proxies to the right, so the client is leftmost.
    assert.equal(from({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" }), "203.0.113.7");
  });

  test("trims whitespace around the entry", () => {
    assert.equal(from({ "x-forwarded-for": "  203.0.113.7 , 70.41.3.18" }), "203.0.113.7");
  });

  test("falls back to x-real-ip", () => {
    assert.equal(from({ "x-real-ip": "203.0.113.9" }), "203.0.113.9");
  });

  test("prefers x-forwarded-for over x-real-ip", () => {
    assert.equal(
      from({ "x-forwarded-for": "203.0.113.7", "x-real-ip": "203.0.113.9" }),
      "203.0.113.7",
    );
  });

  test("returns 'unknown' rather than empty when no header is present", () => {
    // An empty key would make every anonymous caller share one bucket, which is
    // the same outcome but by accident rather than on purpose.
    assert.equal(from({}), "unknown");
  });

  test("treats an empty or whitespace header as absent", () => {
    assert.equal(from({ "x-forwarded-for": "" }), "unknown");
    assert.equal(from({ "x-real-ip": "   " }), "unknown");
  });
});

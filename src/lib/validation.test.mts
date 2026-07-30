import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { contactSchema, fieldErrors } from "./validation.ts";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "x".repeat(25),
};

function errorsFor(input: unknown): Record<string, string> {
  const result = contactSchema.safeParse(input);
  assert.equal(result.success, false, "expected this input to be rejected");
  return fieldErrors(result.error!.issues);
}

describe("contactSchema", () => {
  test("accepts a well-formed submission", () => {
    assert.equal(contactSchema.safeParse(valid).success, true);
  });

  test("trims surrounding whitespace off the email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "  ada@example.com  " });
    assert.equal(result.success, true);
    assert.equal(result.data?.email, "ada@example.com");
  });

  describe("name", () => {
    test("rejects one character, accepts two", () => {
      assert.ok(errorsFor({ ...valid, name: "A" }).name);
      assert.equal(contactSchema.safeParse({ ...valid, name: "Ad" }).success, true);
    });

    test("accepts exactly 100 and rejects 101", () => {
      assert.equal(contactSchema.safeParse({ ...valid, name: "A".repeat(100) }).success, true);
      assert.ok(errorsFor({ ...valid, name: "A".repeat(101) }).name);
    });

    test("trims before measuring, so whitespace is not a name", () => {
      // The interesting case: five characters long, zero of them a name.
      assert.ok(errorsFor({ ...valid, name: "     " }).name);
    });
  });

  describe("email", () => {
    test("rejects something that is not an address", () => {
      assert.ok(errorsFor({ ...valid, email: "nope" }).email);
    });

    test("accepts exactly 200 characters and rejects 201", () => {
      const at200 = "a".repeat(195) + "@b.co";
      const at201 = "a".repeat(196) + "@b.co";
      assert.equal(at200.length, 200);
      assert.equal(contactSchema.safeParse({ ...valid, email: at200 }).success, true);
      assert.ok(errorsFor({ ...valid, email: at201 }).email);
    });
  });

  describe("message", () => {
    test("rejects 19 characters, accepts 20", () => {
      assert.ok(errorsFor({ ...valid, message: "x".repeat(19) }).message);
      assert.equal(contactSchema.safeParse({ ...valid, message: "x".repeat(20) }).success, true);
    });

    test("accepts exactly 4000 and rejects 4001", () => {
      assert.equal(contactSchema.safeParse({ ...valid, message: "x".repeat(4000) }).success, true);
      assert.ok(errorsFor({ ...valid, message: "x".repeat(4001) }).message);
    });

    test("trims before measuring, so padding does not reach the minimum", () => {
      // 18 real characters wearing a 22-character coat.
      assert.ok(errorsFor({ ...valid, message: "  " + "x".repeat(18) + "  " }).message);
    });
  });

  describe("honeypot", () => {
    test("a filled website field fails the schema", () => {
      // The route must never let this reach a 400 — it checks the raw body first
      // and answers 200 — but the constraint itself belongs in the schema.
      assert.ok(errorsFor({ ...valid, website: "http://spam.example" }).website);
    });

    test("an empty or absent website field is fine", () => {
      assert.equal(contactSchema.safeParse({ ...valid, website: "" }).success, true);
      assert.equal(contactSchema.safeParse(valid).success, true);
    });
  });

  describe("messages are written for the reader", () => {
    // Regression test for a real defect: zod's default for a missing field is
    // "Invalid input: expected string, received undefined", which is a sentence
    // for a developer and it was reaching visitors through the 400 response.
    for (const [label, input] of [
      ["missing every field", {}],
      ["nulls", { name: null, email: null, message: null }],
    ] as const) {
      test(`${label} produces no zod internals`, () => {
        const errors = errorsFor(input);
        assert.deepEqual(Object.keys(errors).sort(), ["email", "message", "name"]);
        for (const message of Object.values(errors)) {
          assert.doesNotMatch(message, /Invalid input|expected string|received/i, message);
          assert.match(message, /^[A-Z].*\.$/, `not a sentence: ${message}`);
        }
      });
    }
  });
});

describe("fieldErrors", () => {
  test("returns one message per field even when a field fails twice", () => {
    const errors = errorsFor({ name: "", email: "nope", message: "" });
    for (const value of Object.values(errors)) {
      assert.equal(typeof value, "string");
    }
    assert.ok(Object.keys(errors).length <= 3);
  });

  test("is empty for an empty issue list", () => {
    assert.deepEqual(fieldErrors([]), {});
  });
});

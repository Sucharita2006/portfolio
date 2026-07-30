import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { narrowGitHubStats } from "./github-parse.ts";

const user = { public_repos: 8, followers: 0, login: "Sucharita2006" };

const repo = {
  name: "PayFlow",
  html_url: "https://github.com/Sucharita2006/PayFlow",
  pushed_at: "2026-07-10T09:00:00Z",
  description: "Multi-gateway payment orchestrator",
  language: "TypeScript",
};

describe("narrowGitHubStats", () => {
  test("reads the fields it needs from a well-formed payload", () => {
    const stats = narrowGitHubStats(user, [repo]);
    assert.equal(stats?.publicRepos, 8);
    assert.equal(stats?.followers, 0);
    assert.equal(stats?.recent.length, 1);
    assert.equal(stats?.recent[0]?.name, "PayFlow");
    assert.equal(stats?.recent[0]?.language, "TypeScript");
  });

  test("keeps only the five fields the panel renders", () => {
    const stats = narrowGitHubStats(user, [repo]);
    assert.deepEqual(Object.keys(stats!.recent[0]!).sort(), [
      "description",
      "language",
      "name",
      "pushedAt",
      "url",
    ]);
  });

  describe("returns null rather than throwing", () => {
    // F5: any failure means the section does not render. None of these may throw.
    const rejected: [string, unknown, unknown][] = [
      ["user is null", null, [repo]],
      ["user is a string", "nope", [repo]],
      ["user is an array", [], [repo]],
      ["public_repos missing", { followers: 0 }, [repo]],
      ["public_repos is a string", { public_repos: "8", followers: 0 }, [repo]],
      ["followers missing", { public_repos: 8 }, [repo]],
      ["repos is not an array", user, { message: "Not Found" }],
      ["repos is null", user, null],
      ["both undefined", undefined, undefined],
    ];

    for (const [label, u, r] of rejected) {
      test(label, () => {
        assert.equal(narrowGitHubStats(u, r), null);
      });
    }
  });

  describe("individual repositories", () => {
    test("drops one missing a name, url, or push date rather than rendering blanks", () => {
      const stats = narrowGitHubStats(user, [
        repo,
        { ...repo, name: null },
        { ...repo, html_url: undefined },
        { ...repo, pushed_at: 12345 },
        "not an object",
      ]);
      assert.equal(stats?.recent.length, 1, "only the intact repository survives");
    });

    test("preserves a null description and language instead of dropping the repo", () => {
      // Common and harmless: a repository with no description is still worth
      // listing, so these two fields are nullable rather than required.
      const stats = narrowGitHubStats(user, [
        { ...repo, description: null, language: null },
      ]);
      assert.equal(stats?.recent.length, 1);
      assert.equal(stats?.recent[0]?.description, null);
      assert.equal(stats?.recent[0]?.language, null);
    });

    test("coerces an unexpected description type to null rather than rendering it", () => {
      const stats = narrowGitHubStats(user, [{ ...repo, description: { text: "oops" } }]);
      assert.equal(stats?.recent[0]?.description, null);
    });

    test("an empty repository list is a valid result, not a failure", () => {
      const stats = narrowGitHubStats(user, []);
      assert.notEqual(stats, null);
      assert.equal(stats?.recent.length, 0);
    });
  });
});

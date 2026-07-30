export type GitHubStats = {
  publicRepos: number;
  followers: number;
  recent: {
    name: string;
    description: string | null;
    language: string | null;
    url: string;
    pushedAt: string;
  }[];
} | null;

/**
 * The boundary check for F5, kept separate from the fetch that feeds it.
 *
 * Two reasons for the split. The parsing is the part with the interesting
 * failure modes — GitHub is a third party and a field that is a string today can
 * be null tomorrow — and it is pure, so it can be tested against a malformed
 * payload without a network or a mock. The fetch is three lines of plumbing
 * around it.
 *
 * This module deliberately imports nothing at all, which is also what lets the
 * test suite run it under plain Node.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Returns null rather than throwing or partially filling. The caller renders
 * nothing on null, so any shape we did not expect degrades to an absent section
 * instead of a broken page.
 */
export function narrowGitHubStats(user: unknown, repos: unknown): GitHubStats {
  if (!isRecord(user) || !Array.isArray(repos)) return null;
  if (typeof user.public_repos !== "number" || typeof user.followers !== "number") {
    return null;
  }

  const recent = repos.flatMap((repo) => {
    if (!isRecord(repo)) return [];
    const name = asString(repo.name);
    const url = asString(repo.html_url);
    const pushedAt = asString(repo.pushed_at);
    // A repository missing any of these three has nothing to display, so it is
    // dropped rather than rendered as blanks.
    if (!name || !url || !pushedAt) return [];
    return [
      {
        name,
        description: asString(repo.description),
        language: asString(repo.language),
        url,
        pushedAt,
      },
    ];
  });

  return { publicRepos: user.public_repos, followers: user.followers, recent };
}

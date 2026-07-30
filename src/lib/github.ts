import { profile } from "@/content/profile";

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

const API = "https://api.github.com";
const REVALIDATE_SECONDS = 3600;

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // Absent: 60 requests/hour instead of 5000. At hourly revalidation that is
    // roughly 24 requests a day, so the token is a convenience, not a need.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Narrowing at the boundary rather than trusting the shape. GitHub is a third
// party: a field that is a string today can be null tomorrow, and the failure
// mode of assuming otherwise is a runtime error on a page that had no business
// breaking over a decorative panel.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Returns null on any failure — network error, rate limit, a shape that is not
 * what we expected, anything. F5: this section does not render rather than
 * showing a spinner or an error, because it is supplementary. Nobody visits a
 * portfolio for the follower count.
 */
export async function getGitHubStats(): Promise<GitHubStats> {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`${API}/users/${profile.githubUser}`, {
        headers: headers(),
        next: { revalidate: REVALIDATE_SECONDS },
      }),
      fetch(
        `${API}/users/${profile.githubUser}/repos?sort=pushed&direction=desc&per_page=3&type=owner`,
        { headers: headers(), next: { revalidate: REVALIDATE_SECONDS } },
      ),
    ]);

    if (!userResponse.ok || !reposResponse.ok) return null;

    const user: unknown = await userResponse.json();
    const repos: unknown = await reposResponse.json();

    if (!isRecord(user) || !Array.isArray(repos)) return null;
    if (typeof user.public_repos !== "number" || typeof user.followers !== "number") {
      return null;
    }

    const recent = repos.flatMap((repo) => {
      if (!isRecord(repo)) return [];
      const name = asString(repo.name);
      const url = asString(repo.html_url);
      const pushedAt = asString(repo.pushed_at);
      // A repository without these three has nothing to display, so it is
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
  } catch (error) {
    console.error("[github] stats unavailable", error);
    return null;
  }
}

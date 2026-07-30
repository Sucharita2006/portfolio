import { profile } from "@/content/profile";
import { narrowGitHubStats, type GitHubStats } from "@/lib/github-parse";

export type { GitHubStats };

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

/**
 * Returns null on any failure — network error, rate limit, an unexpected shape,
 * anything. F5: this section does not render rather than showing a spinner or an
 * error, because it is supplementary. Nobody visits a portfolio for the follower
 * count.
 *
 * The shape checking lives in github-parse.ts so it can be tested without a
 * network. This function is the plumbing.
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

    return narrowGitHubStats(await userResponse.json(), await reposResponse.json());
  } catch (error) {
    console.error("[github] stats unavailable", error);
    return null;
  }
}

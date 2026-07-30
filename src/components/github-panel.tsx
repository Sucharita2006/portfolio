import { profile } from "@/content/profile";
import { getGitHubStats } from "@/lib/github";
import { SectionHeading } from "@/components/section-heading";

/**
 * Server component. Fetched at build and on revalidation, so nothing about this
 * reaches the browser as JavaScript and nothing flashes in on load.
 *
 * Renders null when the fetch fails for any reason. F5 is explicit that this is
 * supplementary — no spinner, no error state, no "couldn't load". A section that
 * apologises for itself is worse than a section that is not there.
 */
export async function GitHubPanel() {
  const stats = await getGitHubStats();
  if (!stats) return null;

  return (
    <section className="mt-14 border-t border-rule pt-10">
      <SectionHeading>On GitHub</SectionHeading>

      <p className="mt-6 font-mono text-sm text-ink-soft">
        {stats.publicRepos} public {stats.publicRepos === 1 ? "repository" : "repositories"}
        {" · "}
        {stats.followers} {stats.followers === 1 ? "follower" : "followers"}
        {" · "}
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          className="link-underline text-marine"
        >
          @{profile.githubUser}
        </a>
      </p>

      {stats.recent.length > 0 && (
        <ul className="mt-7 border-t border-rule">
          {stats.recent.map((repo) => (
            <li key={repo.url} className="border-b border-rule py-4">
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline font-mono text-[0.9375rem] text-ink"
              >
                {repo.name}
              </a>
              {repo.description && (
                <p className="mt-1.5 max-w-[62ch] text-sm text-ink-soft">{repo.description}</p>
              )}
              <p className="eyebrow-meta mt-1.5">
                {repo.language ? `${repo.language} · ` : ""}
                pushed {new Date(repo.pushedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

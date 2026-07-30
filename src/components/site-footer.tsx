import { profile } from "@/content/profile";

const links = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "GitHub", href: profile.github },
  { label: "LinkedIn", href: profile.linkedin },
  { label: "Résumé", href: profile.resumeHref },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="shell py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-display-sm text-2xl">Let&rsquo;s talk.</p>
            <p className="mt-1 text-sm text-muted">
              Open to software engineering internships and new-grad roles.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            {links.map((l) => {
              const external = l.href.startsWith("http");
              return (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="link-underline hover:text-ink"
                    target={external ? "_blank" : undefined}
                    // noreferrer implies noopener in current browsers, but naming
                    // both means the intent survives a reader who only knows one.
                    rel={external ? "noreferrer noopener" : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        {/*
          Evaluated during the build, not per request, because every page here is
          statically generated. It is a build stamp rather than a clock, which is
          what a footer year should be.
        */}
        <p className="eyebrow mt-10">
          {profile.location} · Built with Next.js · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

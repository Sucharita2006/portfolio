import Link from "next/link";
import { profile } from "@/content/profile";

const nav = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Résumé", href: profile.resumeHref },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-sm">
      <div className="shell flex items-center justify-between py-4">
        {/*
          The full name overflows at 360px: 23 characters of mono at 13px is
          roughly 180px, the three nav items and their gaps another 145px, and
          the viewport leaves 312px after page padding. The wordmark shortens
          rather than the navigation, because a name is still a name and a
          missing link is a missing link.
        */}
        <Link
          href="/"
          className="link-underline font-mono text-[0.8125rem] tracking-tight text-ink"
        >
          <span className="sm:hidden">{profile.shortName}</span>
          <span className="hidden sm:inline">{profile.name}</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 text-[0.8125rem] text-ink-soft sm:gap-6">
            {nav.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="link-underline hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

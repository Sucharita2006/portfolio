import type { Metadata } from "next";
import Link from "next/link";
import { work } from "@/content/work";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="shell py-24">
      <p className="eyebrow">Error 404</p>
      <h1 className="type-display-sm mt-4 text-section">This page doesn&rsquo;t exist.</h1>
      <p className="mt-4 max-w-[52ch] text-ink-soft">
        The address may be mistyped, or it may have pointed at something that has since
        moved. Everything on the site is one of these:
      </p>

      {/* A dead end is more useful with the real routes on it than with a lone
          "go home" link, and the case studies are the reason anyone is here. */}
      <ul className="mt-8 border-t border-rule">
        {work.map((item) => (
          <li key={item.slug} className="border-b border-rule">
            <Link
              href={`/work/${item.slug}`}
              className="link-underline flex items-baseline gap-4 py-3"
            >
              <span className="font-mono text-sm text-marine">{item.metric.value}</span>
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
        <li className="border-b border-rule">
          <Link href="/about" className="link-underline block py-3">
            About
          </Link>
        </li>
        <li className="border-b border-rule">
          <Link href="/" className="link-underline block py-3">
            Home
          </Link>
        </li>
      </ul>
    </div>
  );
}

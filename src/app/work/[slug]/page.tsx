import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { work, getWork } from "@/content/work";
import { StackTags } from "@/components/stack-tags";

// Every slug is known at build time, and dynamicParams: false is load-bearing
// rather than tidy. Left at its default, an unknown slug would invoke this page,
// the page would call notFound(), and Next renders that through <html
// id="__next_error__"> — a shell that bypasses the root layout entirely, so the
// visitor gets a 404 with no header, no footer, and fallback fonts. With it off,
// unknown slugs never reach the page and resolve through the real not-found.tsx.
// Verified both ways in Phase 4.
export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getWork(slug);
  if (!item) return {};

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.summary,
      url: `/work/${slug}`,
    },
  };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWork(slug);
  if (!item) notFound();

  // Previous and next by position in the work array, which is the order the
  // homepage shows. No wraparound: at either end the reader gets one link
  // instead of a loop that pretends the list is a carousel.
  const index = work.findIndex((w) => w.slug === slug);
  const previous = index > 0 ? work[index - 1] : undefined;
  const next = index < work.length - 1 ? work[index + 1] : undefined;

  return (
    <article className="shell py-14 md:py-20">
      <Link href="/#work" className="eyebrow link-underline">
        ← Selected work
      </Link>

      <header className="mt-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="font-mono text-[1.75rem] leading-none tracking-[-0.03em] text-ink">
            {item.metric.value}
          </p>
          <p className="eyebrow-meta">{item.metric.label}</p>
        </div>
        <span aria-hidden="true" className="mt-4 block h-0.5 w-10 bg-marine" />

        <h1 className="type-display-sm mt-8 max-w-[22ch] text-[2rem] leading-tight md:text-[2.5rem]">
          {item.title}
        </h1>

        <p className="eyebrow-meta mt-4">
          {item.subtitle} · {item.period}
        </p>

        <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed text-ink-soft">
          {item.summary}
        </p>

        {item.links.length > 0 && (
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {item.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline text-marine"
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* The full stack here, against five on the homepage row. This is the
            page for the reader who wants all of it. */}
        <div className="mt-9 border-t border-rule pt-5">
          <p className="eyebrow">Stack</p>
          <StackTags items={item.stack} className="mt-3" />
        </div>
      </header>

      <div className="mt-14 space-y-12">
        {item.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="type-display-sm text-[1.375rem] leading-tight">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="max-w-[68ch] leading-relaxed text-ink-soft"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <nav
        aria-label="Case studies"
        className="mt-16 grid gap-6 border-t border-rule pt-8 sm:grid-cols-2"
      >
        {previous ? (
          <Link href={`/work/${previous.slug}`} className="group">
            <p className="eyebrow">Previous</p>
            <p className="type-display-sm link-underline mt-2 inline-block text-[1.125rem]">
              {previous.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/work/${next.slug}`} className="sm:text-right">
            <p className="eyebrow">Next</p>
            <p className="type-display-sm link-underline mt-2 inline-block text-[1.125rem]">
              {next.title}
            </p>
          </Link>
        )}
      </nav>
    </article>
  );
}

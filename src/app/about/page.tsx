import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About",
  description: profile.aboutParagraphs[0],
  alternates: { canonical: "/about" },
  // Without this the root layout's og:title carries over and a shared link to
  // /about presents itself as the homepage. The case studies set theirs, so this
  // was the one route left inheriting.
  openGraph: {
    type: "profile",
    title: `About ${profile.name}`,
    description: profile.aboutParagraphs[0],
    url: "/about",
  },
};

export default function About() {
  return (
    <div className="shell py-14 md:py-20">
      <h1 className="type-display max-w-[18ch] text-[2.5rem] leading-tight md:text-[3.25rem]">
        {profile.role}, mostly backend.
      </h1>

      <div className="mt-10 max-w-[64ch] space-y-5">
        {profile.aboutParagraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-[1.0625rem] leading-relaxed text-ink-soft"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <section className="mt-16 border-t border-rule pt-10">
        <SectionHeading>Education</SectionHeading>
        <ul className="mt-6 space-y-7">
          {profile.education.map((entry) => (
            <li key={entry.school}>
              <h3 className="type-display-sm text-[1.25rem] leading-tight">
                {entry.school}
              </h3>
              <p className="mt-1.5 text-ink-soft">{entry.detail}</p>
              <p className="eyebrow-meta mt-1.5">{entry.meta}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-t border-rule pt-10">
        <SectionHeading>Awards</SectionHeading>
        <ul className="mt-6 space-y-6">
          {profile.awards.map((award) => (
            <li key={award.title}>
              <p className="text-[1.0625rem] text-ink">{award.title}</p>
              <p className="eyebrow-meta mt-1.5">{award.meta}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-14 border-t border-rule pt-8 text-ink-soft">
        The résumé has the same material in one page:{" "}
        <a href={profile.resumeHref} className="link-underline text-marine">
          {profile.resumeHref}
        </a>
        .
      </p>
    </div>
  );
}

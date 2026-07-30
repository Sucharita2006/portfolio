import { profile } from "@/content/profile";
import { work } from "@/content/work";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { WorkRow } from "@/components/work-row";
import { ContactForm } from "@/components/contact-form";

// Read from profile so no address is written twice on the site.
const contactChannels = [
  { label: profile.email, href: `mailto:${profile.email}`, external: false },
  { label: "GitHub", href: profile.github, external: true },
  { label: "LinkedIn", href: profile.linkedin, external: true },
  { label: "Résumé (PDF)", href: profile.resumeHref, external: false },
];

// Fully static. F1 called for hourly revalidation because the GitHub panel lived
// here; that moved to /about in review, so this page has no time-varying data at
// all and nothing to revalidate.

export default function Home() {
  return (
    <>
      {/*
        The hero is deliberately not wrapped in Reveal. It is the largest
        contentful paint, and gating it behind an intersection observer would
        delay the one paint the performance budget is measured on — to animate
        something that is already on screen before anyone can scroll.
      */}
      <section className="shell pt-14 pb-16 md:pt-20 md:pb-24">
        <h1 className="type-display text-hero">
          <span className="block">{profile.heroLead}</span>
          <span className="block">{profile.heroTrail}</span>
        </h1>

        <p className="mt-8 max-w-[54ch] text-[1.0625rem] leading-relaxed text-ink-soft">
          {profile.heroBody}
        </p>

        {/*
          Three facts as a hairline-ruled data row rather than one inline line.
          Reversing my Phase 5 call to hold the notes back for /about: on screen
          the hero left the right half of a 64rem column empty, and the notes are
          the substance that fills it — "branch rank holder" is the part of "9.79"
          a reader actually wants. Ruled columns also echo the metric ticks below,
          so the page has one rhythm instead of two.
        */}
        <ul className="mt-12 grid max-w-3xl gap-x-10 gap-y-7 sm:grid-cols-3">
          {profile.facts.map((fact) => (
            <li key={fact.label} className="border-t border-rule-strong pt-4">
              <p className="font-mono text-[1.375rem] leading-none text-ink">
                {fact.value}
              </p>
              <p className="eyebrow mt-2.5">{fact.label}</p>
              <p className="mt-2 text-sm leading-snug text-muted">{fact.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <Reveal>
        <section id="work" className="shell border-t border-rule py-16 md:py-20">
          <SectionHeading>Selected work</SectionHeading>
          <ul className="mt-8 border-t border-rule">
            {work.map((item) => (
              <WorkRow key={item.slug} item={item} />
            ))}
          </ul>
        </section>
      </Reveal>

      {/*
        The one raised surface on the page. `paper-raised` is barely a shade off
        `paper`, which is the point — eight screens of a single flat grey read as
        unconsidered, and a full-bleed band gives the longest section on the page
        an edge without introducing a card.
      */}
      <Reveal>
        <div className="border-y border-rule bg-paper-raised">
          <section id="capabilities" className="shell py-16 md:py-20">
            <SectionHeading>Capabilities</SectionHeading>
            <div className="mt-8 grid gap-x-12 gap-y-9 sm:grid-cols-2">
              {profile.skills.map((group) => (
                <div key={group.group}>
                  <h3 className="font-mono text-[0.9375rem] font-medium text-ink">
                    {group.group}
                  </h3>
                  <ul className="dot-list mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-[0.9375rem] text-ink-soft">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Reveal>

      {/*
        The footer already says "Let's talk." on every route, so this section
        does not repeat it — the eyebrow names the section and the form is the
        invitation.
      */}
      <Reveal>
        <section id="contact" className="shell py-16 md:py-20">
          <SectionHeading>Contact</SectionHeading>
          <div className="mt-8 grid gap-12 md:grid-cols-[1fr_auto] md:gap-16">
            <ContactForm />

            <div className="md:pt-1">
              <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-ink-soft">
                Or skip the form. Email is read daily and is the fastest way to reach me.
              </p>
              <ul className="mt-5 space-y-2.5 text-[0.9375rem]">
                {contactChannels.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      className="link-underline text-marine"
                      target={channel.external ? "_blank" : undefined}
                      rel={channel.external ? "noreferrer noopener" : undefined}
                    >
                      {channel.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}

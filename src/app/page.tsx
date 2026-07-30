import { profile } from "@/content/profile";
import { work } from "@/content/work";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { WorkRow } from "@/components/work-row";

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
      <section className="shell pt-16 pb-20 md:pt-24 md:pb-28">
        <h1 className="font-display text-hero">
          <span className="block">{profile.heroLead}</span>
          <span className="block">{profile.heroTrail}</span>
        </h1>

        <p className="mt-8 max-w-[52ch] text-ink-soft">{profile.heroBody}</p>

        {/* The `note` on each fact is deliberately not shown here — three facts
            with three footnotes would compete with the hero statement. They are
            rendered on /about, where there is room to read them. */}
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
          {profile.facts.map((fact) => (
            <li key={fact.label}>
              <span className="text-ink">{fact.value}</span>{" "}
              <span className="text-muted">{fact.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <Reveal>
        <section id="work" className="shell border-t border-rule py-16 md:py-24">
          <SectionHeading>Selected work</SectionHeading>
          <ul className="mt-10 border-t border-rule">
            {work.map((item) => (
              <WorkRow key={item.slug} item={item} />
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section id="capabilities" className="shell border-t border-rule py-16 md:py-24">
          <SectionHeading>Capabilities</SectionHeading>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {profile.skills.map((group) => (
              <div key={group.group}>
                <h3 className="font-mono text-sm text-ink">{group.group}</h3>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-soft">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </>
  );
}

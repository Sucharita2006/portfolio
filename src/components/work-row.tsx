import Link from "next/link";
import type { WorkItem } from "@/content/work";
import { MetricTick } from "@/components/metric-tick";
import { StackTags } from "@/components/stack-tags";

/**
 * One row of the work index. Separated by hairlines rather than wrapped in a
 * card, per DESIGN_BRIEF.md.
 *
 * The whole row is clickable, but only the title is the link. Wrapping the
 * metric, title, subtitle, period, summary and five stack tags in a single `<a>`
 * would give that link an accessible name around forty words long, and a screen
 * reader's link list — one of the primary ways people navigate — would become
 * unusable. Instead the anchor stretches over the row with an absolutely
 * positioned `::after`, so the pointer target is the whole row and the
 * accessible name is just the title. The focus ring stays on the title for the
 * same reason: a ring around an entire row tells you less about where you are.
 */
export function WorkRow({ item }: { item: WorkItem }) {
  return (
    <li className="relative border-b border-rule">
      <div className="grid gap-5 py-9 md:grid-cols-[9rem_1fr] md:gap-10">
        <MetricTick value={item.metric.value} label={item.metric.label} />

        <div>
          {/* type-display-sm, not type-display: at this size the display setting
              goes spindly and the title ends up visually weaker than the summary
              beneath it, which inverts the hierarchy. */}
          <h3 className="type-display-sm text-[1.5rem] leading-tight">
            <Link
              href={`/work/${item.slug}`}
              className="link-underline after:absolute after:inset-0 after:content-['']"
            >
              {item.title}
            </Link>
          </h3>

          <p className="eyebrow-meta mt-2.5">
            {item.subtitle} · {item.period}
          </p>

          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-soft">
            {item.summary}
          </p>

          {/* Five is F1's limit. The full list is on the case study page. */}
          <StackTags items={item.stack} limit={5} className="mt-4" />
        </div>
      </div>
    </li>
  );
}

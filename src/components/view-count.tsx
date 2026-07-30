"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/app/work/[slug]/actions";

/**
 * Defined here rather than imported from @/lib/views, and that is not a style
 * choice. views.ts imports the Drizzle client, which imports the Neon driver;
 * a client component importing *anything* from it drags that whole graph into
 * the browser bundle. Measured, that single import cost 66 kB gzipped on every
 * case study page. A "use server" boundary stops the server action's code
 * crossing over — it does nothing for an ordinary named export sitting in the
 * same module.
 *
 * Below this many views the counter renders nothing. A new page announcing
 * "3 views" is arguing against itself.
 */
const VIEW_DISPLAY_THRESHOLD = 25;

/**
 * The third and last client component, and the one the build spec says to stop
 * and ask about. It is in section 4's inventory, and it is here because F2 wants
 * a statically generated page and F4 wants that page to record a visit — which
 * nothing running on the server at build time can do.
 *
 * So the split is: the count is read during static generation and arrives as a
 * prop, and the only thing that happens in the browser is one fire-and-forget
 * call to a server action. No fetching, no state, no loading state.
 */
export function ViewCount({ slug, count }: { slug: string; count: number | null }) {
  const recorded = useRef(false);

  useEffect(() => {
    // React 18+ mounts effects twice in development strict mode. Without this
    // guard every local page load would count as two.
    if (recorded.current) return;
    recorded.current = true;

    // Deliberately not awaited and deliberately swallowed. F4: a failure here
    // must never break the page, and by this point the page is already rendered.
    void recordView(slug).catch(() => {});
  }, [slug]);

  // The view is still recorded below the threshold — it is only the display that
  // waits. A page that announces "3 views" is arguing against itself.
  if (count === null || count < VIEW_DISPLAY_THRESHOLD) return null;

  return (
    <p className="eyebrow">{count.toLocaleString("en-US")} views</p>
  );
}

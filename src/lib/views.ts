import { sql } from "drizzle-orm";
import { db } from "@/db";
import { pageViews } from "@/db/schema";

/**
 * Read during static generation, so the number is as fresh as the last
 * revalidation. An hour of staleness on a view counter is invisible, and the
 * alternative is a database round trip on every request to a page that is
 * otherwise served straight from cache.
 *
 * Returns null on any failure — no database configured, network down, table
 * missing — and the caller renders nothing.
 */
export async function getViewCount(slug: string): Promise<number | null> {
  if (!db) return null;
  try {
    const rows = await db
      .select({ count: pageViews.count })
      .from(pageViews)
      .where(sql`${pageViews.slug} = ${slug}`)
      .limit(1);
    return rows[0]?.count ?? 0;
  } catch (error) {
    console.error(`[views] read failed for ${slug}`, error);
    return null;
  }
}

/**
 * Increment, called from a server action on mount.
 *
 * The upsert is a single statement so two readers arriving together cannot lose
 * a count between a read and a write — the increment happens inside the
 * database, not in this process.
 */
export async function incrementView(slug: string): Promise<void> {
  if (!db) return;
  try {
    await db
      .insert(pageViews)
      .values({ slug, count: 1 })
      .onConflictDoUpdate({
        target: pageViews.slug,
        set: { count: sql`${pageViews.count} + 1`, updatedAt: new Date() },
      });
  } catch (error) {
    // Swallowed on purpose. F4: a failure here must never break the page, and
    // the page has already rendered by the time this runs.
    console.error(`[views] increment failed for ${slug}`, error);
  }
}

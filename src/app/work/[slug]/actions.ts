"use server";

import { getWork } from "@/content/work";
import { incrementView } from "@/lib/views";

/**
 * A server action is a public POST endpoint, so the slug arriving here is
 * untrusted input even though the only caller is our own component. Checking it
 * against the content array means the table can never accumulate rows for slugs
 * that do not exist — which is both a data-integrity point and the difference
 * between a counter and an open write endpoint.
 */
export async function recordView(slug: string): Promise<void> {
  if (!getWork(slug)) return;
  await incrementView(slug);
}

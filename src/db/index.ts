// Turns "a client component imported this" from a silent 66 kB regression into
// a build error. That regression happened once already, in this phase: a client
// component imported one constant from a module that transitively reached here,
// and nothing failed — the driver simply shipped to the browser. A guard that
// fails loudly is worth one dependency with no runtime code in it.
import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * `null` when DATABASE_URL is absent, which is the supported configuration —
 * section 1.6 requires the site to run locally with zero environment variables.
 *
 * Every caller therefore has to check, and that is deliberate: a module that
 * throws on import would take the whole site down over a feature (view counts)
 * that the site is explicitly allowed to do without. The type is `… | null`
 * rather than a proxy that throws later, so the compiler makes the check
 * unforgettable instead of leaving it to a runtime surprise.
 *
 * neon-http rather than the WebSocket driver: every query here is a single
 * statement with no transaction, and the HTTP driver holds no connection between
 * invocations — which is the right shape for a serverless function that may be
 * frozen a millisecond after it responds.
 */
const url = process.env.DATABASE_URL;

export const db = url ? drizzle(neon(url), { schema }) : null;

export const isDatabaseConfigured = db !== null;

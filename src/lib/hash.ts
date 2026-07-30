import { createHash } from "node:crypto";

// Used when IP_HASH_SALT is unset so the site runs from a fresh clone with an
// empty .env.local, which section 1.6 requires.
//
// Be clear about what this costs: with a known salt the hash is reversible by
// anyone willing to walk the address space, which for IPv4 is a few billion
// cheap hashes. It is a speed bump in development and nothing more. Production
// must set IP_HASH_SALT, and .env.example says so.
const DEVELOPMENT_SALT = "portfolio-development-salt";

/**
 * Stores a salted hash of the address rather than the address itself. It is
 * wanted for one thing — telling whether three messages came from one sender —
 * and a hash answers that question exactly as well as the raw value while being
 * far less of a liability if the table ever leaks.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? DEVELOPMENT_SALT;
  // Colon-delimited so salt "ab" + ip "c" cannot collide with salt "a" + ip "bc".
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Best-effort client address from proxy headers.
 *
 * `x-forwarded-for` is a client-controlled header everywhere except behind a
 * proxy that overwrites it. On Vercel it is set by the edge network and the
 * first entry is the real client, which is why the first entry is what this
 * takes. Run this behind anything else and the value is a suggestion, not a
 * fact — which is acceptable here, because the only thing keyed on it is a
 * courtesy rate limit, not authorisation.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

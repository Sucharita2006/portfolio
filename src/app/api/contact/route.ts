import { NextResponse } from "next/server";
import { Resend } from "resend";
import { profile } from "@/content/profile";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { clientIp, hashIp } from "@/lib/hash";
import { take } from "@/lib/rate-limit";

// node:crypto in hash.ts needs the Node runtime, and the rate limiter's module
// state only persists on a warm instance. Both are the default; stated so a
// later "let's move this to edge" is a decision rather than an accident.
export const runtime = "nodejs";

const TOO_MANY = "Too many messages. Try again in an hour.";
const SEND_FAILED = `Message couldn't be sent. Email directly at ${profile.email}`;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected a JSON body." },
      { status: 400 },
    );
  }

  // ── Honeypot, checked first and on the raw body ───────────────────────────
  // Order is the whole mechanism. Validating first would answer a bot with 400,
  // and a bot that receives 400 learns the field is a trap and returns without
  // it. One that receives 200 believes it succeeded and goes away. So: read
  // `website` before the schema runs, and lie politely.
  if (typeof payload === "object" && payload !== null && "website" in payload) {
    const website = (payload as { website?: unknown }).website;
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Some of that didn't look right.",
        fields: fieldErrors(parsed.error.issues),
      },
      { status: 400 },
    );
  }

  // ── Rate limit, after validation and before anything expensive ────────────
  // Deliberately not before validation. A visitor who mistypes their address
  // three times should not be locked out for an hour over three requests that
  // never sent anything. The cost of this ordering is that invalid payloads are
  // unmetered — acceptable, because rejecting one is a schema parse with no I/O,
  // no email, and no database write behind it.
  const ipHash = hashIp(clientIp(request.headers));
  const limit = take(ipHash);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: TOO_MANY },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  // Without a key the route still validates, still rate-limits, and still
  // returns 200 — it just logs instead of delivering. That is what makes the
  // site runnable from a fresh clone with no environment at all.
  if (!apiKey) {
    console.info(
      `[contact] RESEND_API_KEY unset — not delivered. from=${email} name=${name} chars=${message.length}`,
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "portfolio@resend.dev",
      to: process.env.CONTACT_TO_EMAIL ?? profile.email,
      // Replying in a mail client should reach the sender, not the site.
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("[contact] resend rejected the message", error);
      return NextResponse.json({ ok: false, error: SEND_FAILED }, { status: 500 });
    }
  } catch (cause) {
    console.error("[contact] delivery threw", cause);
    return NextResponse.json({ ok: false, error: SEND_FAILED }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

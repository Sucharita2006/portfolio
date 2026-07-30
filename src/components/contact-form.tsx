"use client";

import { useId, useRef, useState } from "react";

/**
 * The shared schema is loaded on demand rather than imported at the top.
 *
 * zod is 15.4 kB gzipped, measured. Imported statically it lands in a chunk the
 * whole site pays for on first load — including /about and the case studies,
 * which have no form on them — and it pushed every route from 106 kB to 122 kB,
 * past the budget.
 *
 * Nobody needs a validator until they interact with the form, so it is fetched
 * on the first focus of any field and awaited at submit. F3 still holds: errors
 * appear without a round trip to the API, because the schema is in memory long
 * before anyone finishes typing a twenty-character message. The promise is
 * cached at module scope so it is fetched once per page.
 */
let validationModule: Promise<typeof import("@/lib/validation")> | null = null;
function loadValidation() {
  validationModule ??= import("@/lib/validation");
  return validationModule;
}

type Status = "idle" | "sending" | "sent";

const FIELD_CLASS =
  "mt-2 w-full border border-rule-strong bg-paper-raised px-3 py-2 text-[0.9375rem] text-ink outline-none placeholder:text-muted";

export function ContactForm() {
  // useId rather than hardcoded ids: the label/input association has to survive
  // this component appearing more than once on a page, and guessing that it
  // never will is how duplicate-id bugs get written.
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const sending = useRef(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The button stays enabled while sending, because a control that vanishes
    // from the tab order mid-interaction strands keyboard and screen-reader
    // users. The guard against double submission belongs here instead — a ref,
    // not state, so it is correct on the very next event rather than after a
    // re-render.
    if (sending.current) return;

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    const { contactSchema, fieldErrors } = await loadValidation();

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.issues));
      setFormError(null);
      return;
    }

    sending.current = true;
    setStatus("sending");
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setErrors(result.fields ?? {});
        setFormError(result.error ?? "Something went wrong. Try again.");
        setStatus("idle");
        return;
      }

      setStatus("sent");
    } catch {
      // Network failure, offline, request blocked. The typed message is still in
      // the form because nothing has been cleared.
      setFormError("Couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    } finally {
      sending.current = false;
    }
  }

  if (status === "sent") {
    return (
      <p className="border-l-2 border-marine bg-marine-soft px-4 py-3 text-[0.9375rem] text-ink">
        Thanks — that reached me. I&rsquo;ll reply to the address you gave.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      // Capture, so focusing any field inside starts the fetch. By the time
      // anyone has typed a name the validator is already in memory.
      onFocusCapture={() => void loadValidation()}
      noValidate
      className="max-w-[34rem]"
    >
      {/* noValidate turns off the browser's own bubbles so the shared zod schema
          is the single source of what counts as valid. Two validators disagreeing
          in front of a visitor is worse than either alone. */}

      <div>
        <label htmlFor={`${id}-name`} className="eyebrow">
          Name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className={FIELD_CLASS}
        />
        {errors.name && (
          <p id={`${id}-name-error`} className="mt-1.5 text-sm text-marine">
            {errors.name}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor={`${id}-email`} className="eyebrow">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
          className={FIELD_CLASS}
        />
        {errors.email && (
          <p id={`${id}-email-error`} className="mt-1.5 text-sm text-marine">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor={`${id}-message`} className="eyebrow">
          Message
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={`${FIELD_CLASS} resize-y`}
        />
        {errors.message && (
          <p id={`${id}-message-error`} className="mt-1.5 text-sm text-marine">
            {errors.message}
          </p>
        )}
      </div>

      {/*
        Honeypot. Positioned off-screen rather than type="hidden", because many
        bots skip hidden inputs and fill everything else. aria-hidden and
        tabIndex={-1} keep it away from anyone using a keyboard or a screen
        reader; autoComplete="off" stops a password manager filling it in and
        getting a real person silently ignored.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="border border-ink bg-ink px-5 py-2.5 text-[0.9375rem] text-paper transition-opacity hover:opacity-85"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>

      {/* One live region for the whole form. Announced politely, so it waits for
          a natural pause instead of interrupting. */}
      <div aria-live="polite" className="mt-3 min-h-[1.25rem]">
        {formError && <p className="text-sm text-marine">{formError}</p>}
        {Object.keys(errors).length > 0 && !formError && (
          <p className="text-sm text-marine">
            {Object.keys(errors).length === 1
              ? "One field needs attention."
              : `${Object.keys(errors).length} fields need attention.`}
          </p>
        )}
      </div>
    </form>
  );
}

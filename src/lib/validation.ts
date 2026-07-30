import { z } from "zod";

/**
 * One schema definition, two consumers: the contact form validates against it
 * before sending so errors appear without a round trip, and `POST /api/contact`
 * validates against it again because a client-side check is a convenience, not
 * a boundary.
 *
 * Constraints are BUILD_SPEC section 5.3 verbatim.
 */
// Every message here is written for the person reading it. The `error` argument
// on each `z.string()` covers the missing-and-wrong-type case; without it zod
// answers a field-less request with "Invalid input: expected string, received
// undefined", which is a sentence for a developer, not for a visitor.
export const contactSchema = z.object({
  name: z
    .string({ error: "Please give a name." })
    .trim()
    .min(2, "Please give a name of at least two characters.")
    .max(100, "That name is longer than 100 characters."),

  // Trim first, then validate the address, so a copy-pasted " a@b.com " passes.
  // z.email() is the non-deprecated form in zod 4; z.string().email() still
  // works but is on its way out.
  email: z
    .string({ error: "Please give an email address so I can reply." })
    .trim()
    .pipe(
      z
        .email("That doesn't look like an email address.")
        .max(200, "That email address is longer than 200 characters."),
    ),

  message: z
    .string({ error: "Please write a message." })
    .trim()
    .min(20, "Please write at least 20 characters so I know what you need.")
    .max(4000, "That message is longer than 4000 characters."),

  // Honeypot. A real person never sees this field, so anything in it came from
  // a bot filling every input it found.
  //
  // Deliberately NOT enforced here as a rejection: the route checks it on the
  // raw body and returns 200 before validation runs. A bot that receives a 400
  // learns the field is a trap and comes back without it; one that receives 200
  // believes it succeeded. The constraint is declared for documentation, and the
  // route is where it is acted on.
  website: z.string().max(0, "Leave this field empty.").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Collapses zod's issue list into one message per field, which is the shape both
 * the form and the API's 400 response need. First issue per field wins — showing
 * a reader three reasons their name is wrong is not more helpful than one.
 */
export function fieldErrors(issues: readonly z.core.$ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

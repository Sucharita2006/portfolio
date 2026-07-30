import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Contact submissions, retained so a message is never lost to an email delivery
 * failure. If Resend rejects it or the account lapses, the message is still here.
 */
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),

  // sha256(salt + address), never the address. It answers the only question
  // worth asking of it — did these three messages come from one sender — while
  // being far less of a liability if this table ever leaks.
  ipHash: text("ip_hash").notNull(),

  userAgent: text("user_agent"),
  emailSent: boolean("email_sent").notNull().default(false),

  // withTimezone so a row means the same instant regardless of where the
  // instance that wrote it happened to be running.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One row per case study. The slug is the primary key rather than a serial id:
 * there is exactly one row per slug by definition, so a surrogate key would add
 * a column, an index, and a uniqueness constraint to express what the natural
 * key already says.
 */
export const pageViews = pgTable("page_views", {
  slug: text("slug").primaryKey(),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

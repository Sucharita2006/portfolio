import type { Config } from "drizzle-kit";

// Migrations are generated (`npx drizzle-kit generate`) and the SQL is committed
// under drizzle/, rather than using `push` to diff straight against a live
// database. Two tables makes push tempting, but "schema design & migrations" is
// a claim on the CV, and a reviewer can read a migration file.
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Only read by drizzle-kit, never at runtime. The app itself checks for this
    // and degrades when it is missing; the CLI has no reason to.
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;

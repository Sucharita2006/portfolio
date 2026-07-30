import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next still ships in eslintrc format, so FlatCompat is how it
// gets consumed from a flat config. This is the shape create-next-app generates
// for Next 15 — `next lint` is deprecated, so the eslint CLI runs it directly.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // BUILD_SPEC section 7: no console.log outside deliberate server-side
      // logging. Encoding that as a rule rather than a habit — error, warn, and
      // info stay available for the places that log on purpose, such as the
      // contact route's degraded path when RESEND_API_KEY is unset.
      "no-console": ["error", { allow: ["error", "warn", "info"] }],

      // Section 7 also forbids dead code. An unused import or binding is the
      // most common form of it.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default config;

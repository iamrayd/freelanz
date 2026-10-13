import { clientSchema, clientSkipMask, createEnv } from "./schema";

/**
 * Typed, validated `NEXT_PUBLIC_*` environment, safe to import anywhere.
 * Each key must be referenced as `process.env.NEXT_PUBLIC_X` literally so
 * Next.js can inline it into the browser bundle at build time.
 */
export const env = createEnv(
  clientSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  clientSkipMask,
);

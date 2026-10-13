import { z } from "zod";

/**
 * Environment schemas. Pure module (no `server-only`) so it can be unit-tested
 * and shared by `server.ts` and `client.ts`. App code imports `@/env/server`
 * or `@/env/client`, never this file.
 */

export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // required from FLZ-11 (Drizzle schema + first migration)
  DATABASE_URL: z.url().optional(),
  // required from FLZ-20 (Auth.js GitHub + Google)
  AUTH_SECRET: z.string().min(1).optional(),
  // required from FLZ-20
  AUTH_GITHUB_ID: z.string().min(1).optional(),
  // required from FLZ-20
  AUTH_GITHUB_SECRET: z.string().min(1).optional(),
  // required from FLZ-20
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  // required from FLZ-20
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
  // required from FLZ-14 (cron ingest route)
  CRON_SECRET: z.string().min(32, "must be at least 32 characters").optional(),
});

export const clientSchema = z.object({
  // http/https only: rejects javascript:, data:, ftp: and other schemes.
  NEXT_PUBLIC_APP_URL: z.url({ protocol: /^https?$/ }).default("http://localhost:3000"),
});

/** Server + client keys, parsed together so every bad key is reported at once. */
export const envSchema = serverSchema.extend(clientSchema.shape);

export type Env = z.infer<typeof envSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

type Source = Record<string, string | undefined>;

/**
 * Treat `KEY=` (empty string, as copied from .env.example) and whitespace-only
 * values as unset.
 */
function withoutEmpty(source: Source): Source {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value === undefined || value.trim() !== ""),
  );
}

/** Builds a readable error that names the bad keys but never prints their values. */
function formatIssues(issues: readonly z.core.$ZodIssue[]): string {
  const lines = issues.map((issue) => {
    const key = issue.path.join(".") || "(root)";
    return `  - ${key}: ${issue.message}`;
  });
  return `Invalid environment variables:\n${lines.join("\n")}\nSee .env.example. Set SKIP_ENV_VALIDATION=1 to bypass (CI only).`;
}

/**
 * Keys that are required in production but may be absent when
 * `SKIP_ENV_VALIDATION` is set (CI builds without secrets). Empty today: every
 * key is optional or has a default. FLZ-11, FLZ-14 and FLZ-20 make keys
 * required; add each newly required key to its schema AND to these masks.
 */
export const envSkipMask = {};
export const clientSkipMask = {};

function parseOrThrow<Shape extends z.ZodRawShape>(
  schema: z.ZodObject<Shape>,
  source: Source,
): z.infer<z.ZodObject<Shape>> {
  const result = schema.safeParse(withoutEmpty(source));
  if (!result.success) {
    throw new Error(formatIssues(result.error.issues));
  }
  return result.data;
}

/**
 * Parses `source` against `schema` and returns only the schema's keys.
 * Throws a readable error on failure.
 *
 * When `SKIP_ENV_VALIDATION` is set, the keys in `skippable` may be missing
 * (the schema is parsed as `.partial(skippable)`) so builds without secrets
 * still work. Defaults are still applied and values that are present are still
 * validated. Skipping is refused on Vercel production deployments.
 */
export function createEnv<
  Shape extends z.ZodRawShape,
  M extends z.core.util.Exactly<z.core.util.Mask<keyof Shape>, M>,
>(
  schema: z.ZodObject<Shape>,
  source: Source,
  skippable: M,
  skipValidation = isSkipValidation(source),
) {
  if (skipValidation) {
    if (source.VERCEL_ENV === "production") {
      throw new Error("SKIP_ENV_VALIDATION is not allowed when VERCEL_ENV=production.");
    }
    return parseOrThrow(schema.partial(skippable), source);
  }
  return parseOrThrow(schema, source);
}

export function isSkipValidation(source: Source): boolean {
  const flag = source.SKIP_ENV_VALIDATION;
  return flag === "1" || flag === "true";
}

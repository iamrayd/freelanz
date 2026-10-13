import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  clientSchema,
  clientSkipMask,
  createEnv,
  envSchema,
  envSkipMask,
  isSkipValidation,
} from "@/env/schema";

type Source = Record<string, string | undefined>;

const parseEnv = (source: Source) => createEnv(envSchema, source, envSkipMask);
const parseClient = (source: Source) => createEnv(clientSchema, source, clientSkipMask);

const validEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://user:pass@db.example.com:5432/freelanz",
  AUTH_SECRET: "auth-secret",
  AUTH_GITHUB_ID: "gh-id",
  AUTH_GITHUB_SECRET: "gh-secret",
  AUTH_GOOGLE_ID: "google-id",
  AUTH_GOOGLE_SECRET: "google-secret",
  CRON_SECRET: "x".repeat(32),
  NEXT_PUBLIC_APP_URL: "https://freelanz.example.com",
};

function parseError(source: Record<string, string | undefined>): string {
  try {
    parseEnv(source);
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected createEnv to throw");
}

describe("createEnv", () => {
  it("accepts a fully valid env and returns typed values", () => {
    const env = parseEnv(validEnv);
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.CRON_SECRET).toHaveLength(32);
    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://freelanz.example.com");
  });

  it("accepts an empty env and applies defaults (all keys optional for now)", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("treats empty strings (copied from .env.example) as unset", () => {
    const env = parseEnv({
      DATABASE_URL: "",
      CRON_SECRET: "",
      NEXT_PUBLIC_APP_URL: "",
    });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.CRON_SECRET).toBeUndefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("treats whitespace-only values as unset", () => {
    const env = parseEnv({
      DATABASE_URL: "   ",
      CRON_SECRET: "\t",
      NEXT_PUBLIC_APP_URL: " \n ",
    });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.CRON_SECRET).toBeUndefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects a CRON_SECRET shorter than 32 characters", () => {
    const message = parseError({ ...validEnv, CRON_SECRET: "x".repeat(31) });
    expect(message).toContain("CRON_SECRET");
    expect(message).toContain("at least 32 characters");
  });

  it.each(["javascript:alert(1)", "ftp://freelanz.example.com", "data:text/html,hi"])(
    "rejects a NEXT_PUBLIC_APP_URL with a non-http(s) scheme: %s",
    (url) => {
      expect(parseError({ ...validEnv, NEXT_PUBLIC_APP_URL: url })).toContain(
        "NEXT_PUBLIC_APP_URL",
      );
    },
  );

  it("accepts http and https NEXT_PUBLIC_APP_URL values", () => {
    for (const url of ["http://localhost:3000", "https://freelanz.example.com"]) {
      expect(parseEnv({ ...validEnv, NEXT_PUBLIC_APP_URL: url }).NEXT_PUBLIC_APP_URL).toBe(url);
    }
  });

  it("rejects a DATABASE_URL that is not a URL", () => {
    expect(parseError({ ...validEnv, DATABASE_URL: "not-a-url" })).toContain("DATABASE_URL");
  });

  it("lists every bad key but never prints their values", () => {
    const badSecret = "short-secret-do-not-leak";
    const badUrl = "definitely-not-a-url-do-not-leak";
    const message = parseError({
      ...validEnv,
      CRON_SECRET: badSecret,
      NEXT_PUBLIC_APP_URL: badUrl,
    });

    expect(message).toMatch(/^Invalid environment variables:/);
    expect(message).toContain("CRON_SECRET");
    expect(message).toContain("NEXT_PUBLIC_APP_URL");
    expect(message).not.toContain(badSecret);
    expect(message).not.toContain(badUrl);
    expect(message).not.toContain("DATABASE_URL");
  });

  it("returns only schema keys, never the rest of the source", () => {
    const env = parseEnv({ ...validEnv, PATH: "/usr/bin", SOME_SECRET: "leak" });
    expect(env).not.toHaveProperty("PATH");
    expect(env).not.toHaveProperty("SOME_SECRET");
  });

  it("validates the client schema on its own", () => {
    expect(parseClient({}).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(() => parseClient({ NEXT_PUBLIC_APP_URL: "nope" })).toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

describe("createEnv with SKIP_ENV_VALIDATION", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns only schema keys", () => {
    const env = parseEnv({
      SKIP_ENV_VALIDATION: "1",
      PATH: "/usr/bin",
      SOME_SECRET: "leak",
      CRON_SECRET: "x".repeat(32),
    });
    expect(Object.keys(env).sort()).toEqual(["CRON_SECRET", "NEXT_PUBLIC_APP_URL", "NODE_ENV"]);
    expect(env).not.toHaveProperty("SKIP_ENV_VALIDATION");
    expect(env).not.toHaveProperty("PATH");
    expect(env).not.toHaveProperty("SOME_SECRET");
  });

  it("applies defaults", () => {
    const env = parseEnv({ SKIP_ENV_VALIDATION: "1" });
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("still rejects values that are present but invalid", () => {
    expect(() => parseEnv({ SKIP_ENV_VALIDATION: "1", CRON_SECRET: "short" })).toThrow(
      /CRON_SECRET/,
    );
  });

  it("is refused when VERCEL_ENV=production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => parseEnv({ SKIP_ENV_VALIDATION: "1" })).toThrow(
      /not allowed when VERCEL_ENV=production/,
    );
  });

  it("is allowed on Vercel preview deployments", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(() => parseEnv({ SKIP_ENV_VALIDATION: "1" })).not.toThrow();
  });
});

describe("createEnv types", () => {
  it("keeps precise key types and rejects unknown keys", () => {
    const env = parseEnv({});
    expectTypeOf(env.NEXT_PUBLIC_APP_URL).toEqualTypeOf<string>();
    expectTypeOf(env.CRON_SECRET).toEqualTypeOf<string | undefined>();
    expectTypeOf(env.NODE_ENV).toEqualTypeOf<"development" | "test" | "production">();
    // @ts-expect-error unknown keys are a compile error, not `any`
    void env.NOT_A_KEY;

    const clientEnv = parseClient({});
    expectTypeOf(clientEnv.NEXT_PUBLIC_APP_URL).toEqualTypeOf<string>();
    // @ts-expect-error the client env has no server keys
    void clientEnv.CRON_SECRET;
  });

  it("makes masked keys optional only in the skip-mode type", () => {
    const env = createEnv(envSchema, {}, { NEXT_PUBLIC_APP_URL: true });
    expectTypeOf(env.NEXT_PUBLIC_APP_URL).toEqualTypeOf<string | undefined>();
    // @ts-expect-error mask keys must exist in the schema
    createEnv(envSchema, {}, { NOT_A_KEY: true });
  });
});

describe("isSkipValidation", () => {
  it.each([
    ["1", true],
    ["true", true],
    ["0", false],
    ["", false],
    [undefined, false],
  ])("SKIP_ENV_VALIDATION=%s -> %s", (value, expected) => {
    expect(isSkipValidation({ SKIP_ENV_VALIDATION: value })).toBe(expected);
  });
});

describe("env modules", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("server env parses process.env once at import", async () => {
    vi.stubEnv("CRON_SECRET", "y".repeat(40));
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
    const { env } = await import("@/env/server");
    expect(env.CRON_SECRET).toBe("y".repeat(40));
    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://app.example.com");
    expectTypeOf(env.NEXT_PUBLIC_APP_URL).toEqualTypeOf<string>();
    expectTypeOf(env.CRON_SECRET).toEqualTypeOf<string | undefined>();
  });

  it("server env fails fast on import when invalid", async () => {
    vi.stubEnv("SKIP_ENV_VALIDATION", "");
    vi.stubEnv("CRON_SECRET", "too-short");
    await expect(import("@/env/server")).rejects.toThrow(/CRON_SECRET/);
  });

  it("client env exposes only NEXT_PUBLIC_* keys", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
    vi.stubEnv("CRON_SECRET", "z".repeat(40));
    const { env } = await import("@/env/client");
    expect(env).toEqual({ NEXT_PUBLIC_APP_URL: "https://app.example.com" });
    expectTypeOf(env).toEqualTypeOf<{ NEXT_PUBLIC_APP_URL: string }>();
  });
});

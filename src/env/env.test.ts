import { afterEach, describe, expect, it, vi } from "vitest";

import { clientSchema, createEnv, envSchema, isSkipValidation } from "@/env/schema";

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
    createEnv(envSchema, source);
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected createEnv to throw");
}

describe("createEnv", () => {
  it("accepts a fully valid env and returns typed values", () => {
    const env = createEnv(envSchema, validEnv);
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.CRON_SECRET).toHaveLength(32);
    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://freelanz.example.com");
  });

  it("accepts an empty env and applies defaults (all keys optional for now)", () => {
    const env = createEnv(envSchema, {});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("treats empty strings (copied from .env.example) as unset", () => {
    const env = createEnv(envSchema, {
      DATABASE_URL: "",
      CRON_SECRET: "",
      NEXT_PUBLIC_APP_URL: "",
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

  it("skips validation when SKIP_ENV_VALIDATION=1", () => {
    const source = { SKIP_ENV_VALIDATION: "1", CRON_SECRET: "short" };
    expect(() => createEnv(envSchema, source)).not.toThrow();
    expect(createEnv(envSchema, source).CRON_SECRET).toBe("short");
  });

  it("validates the client schema on its own", () => {
    expect(createEnv(clientSchema, {}).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(() => createEnv(clientSchema, { NEXT_PUBLIC_APP_URL: "nope" })).toThrow(
      /NEXT_PUBLIC_APP_URL/,
    );
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
  });
});

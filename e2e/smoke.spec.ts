import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home page loads with the Freelanz heading", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Freelanz" })).toBeVisible();
  });

  test("responses carry the security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
    expect(headers["strict-transport-security"]).toBe("max-age=63072000; includeSubDomains");

    const csp = headers["content-security-policy"];
    expect(csp).toBeDefined();
    for (const directive of [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ]) {
      expect(csp).toContain(directive);
    }
    // Production build: no eval.
    expect(csp).not.toContain("'unsafe-eval'");
  });

  for (const { name, path, status } of [
    { name: "home page", path: "/", status: 200 },
    { name: "404 page", path: "/does-not-exist", status: 404 },
  ]) {
    test(`${name} renders without CSP violations`, async ({ page }) => {
      const violations: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" && message.text().includes("Content Security Policy")) {
          violations.push(message.text());
        }
      });
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(status);
      expect(violations).toEqual([]);
    });
  }
});
